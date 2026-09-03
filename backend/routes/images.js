import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(rootDir, "uploads");
const galleryDir = path.join(uploadsDir, "gallery");
const homeDir = path.join(uploadsDir, "home");
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(rootDir, "data");
const imagesFile = path.join(dataDir, "images.json");

const router = express.Router();

router.use((req, res, next) => {
  if (req.method === "GET") return next();
  return req.app.locals.requireAdmin(req, res, next);
});

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
const maxSizeBytes = 5 * 1024 * 1024;

fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(galleryDir, { recursive: true });
fs.mkdirSync(homeDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

function createDefaultImages() {
  return {
    home: [
      { id: 1, file: "home-1.jpg", order: 1 },
      { id: 2, file: "home-2.jpg", order: 2 },
      { id: 3, file: "home-3.jpg", order: 3 },
    ],
    gallery: [
      { id: 1, file: "gallery-1.jpg", order: 1 },
      { id: 2, file: "gallery-2.jpg", order: 2 },
      { id: 3, file: "gallery-3.jpg", order: 3 },
      { id: 4, file: "gallery-4.jpg", order: 4 },
      { id: 5, file: "gallery-5.jpg", order: 5 },
      { id: 6, file: "gallery-6.jpg", order: 6 },
      { id: 7, file: "gallery-7.jpg", order: 7 },
      { id: 8, file: "gallery-8.jpg", order: 8 },
    ],
  };
}

function ensureImagesFile() {
  if (!fs.existsSync(imagesFile)) {
    fs.writeFileSync(
      imagesFile,
      JSON.stringify(createDefaultImages(), null, 2),
    );
  }
}

function readImages() {
  ensureImagesFile();
  const parsed = JSON.parse(fs.readFileSync(imagesFile, "utf-8"));
  return {
    home: Array.isArray(parsed.home) ? parsed.home : [],
    gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
  };
}

function writeImages(data) {
  fs.writeFileSync(imagesFile, JSON.stringify(data, null, 2));
}

function normalizeItems(items, category) {
  return [...items]
    .map((item, index) => ({
      ...item,
      id: Number(item.id) || index + 1,
      order: Number(item.order) || index + 1,
      file: typeof item.file === "string" ? item.file : "",
    }))
    .filter(
      (item) =>
        item.file &&
        fs.existsSync(
          path.join(
            category === "home" ? homeDir : galleryDir,
            path.basename(item.file),
          ),
        ),
    )
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index + 1 }));
}

function getPublicUrl(fileName, category) {
  const relativeUrl = `/uploads/${category}/${encodeURIComponent(path.basename(fileName))}`;
  const publicApiUrl = String(process.env.PUBLIC_API_URL || "").replace(
    /\/+$/,
    "",
  );
  return publicApiUrl ? `${publicApiUrl}${relativeUrl}` : relativeUrl;
}

function createUploadHandler(category) {
  const targetDir = category === "home" ? homeDir : galleryDir;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(targetDir, { recursive: true });
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const base = crypto.randomBytes(16).toString("hex");
      cb(null, `${base}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxSizeBytes },
    fileFilter: (req, file, cb) => {
      const mime = file.mimetype || "";
      const extension = path.extname(file.originalname || "").toLowerCase();
      if (
        allowedTypes.includes(mime) &&
        allowedExtensions.includes(extension)
      ) {
        cb(null, true);
      } else {
        cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."));
      }
    },
  });
}

const galleryUpload = createUploadHandler("gallery");
const homeUpload = createUploadHandler("home");

function removeOldFile(category, fileName) {
  if (!fileName) return;
  const targetFile = path.join(
    category === "home" ? homeDir : galleryDir,
    fileName,
  );
  if (fs.existsSync(targetFile)) fs.unlinkSync(targetFile);
}

router.get("/gallery", (req, res) => {
  const data = readImages();
  const gallery = normalizeItems(data.gallery, "gallery").map((item) => ({
    ...item,
    url: getPublicUrl(item.file, "gallery"),
  }));
  res.json({ success: true, data: gallery });
});

router.get("/home", (req, res) => {
  const data = readImages();
  const home = normalizeItems(data.home, "home").map((item) => ({
    ...item,
    url: getPublicUrl(item.file, "home"),
  }));
  res.json({ success: true, data: home });
});

router.post("/gallery/upload", galleryUpload.single("image"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    const data = readImages();
    const nextId =
      Math.max(0, ...data.gallery.map((item) => Number(item.id) || 0)) + 1;
    const item = {
      id: nextId,
      file: req.file.filename,
      order: data.gallery.length + 1,
    };
    data.gallery.push(item);
    writeImages(data);
    res
      .status(201)
      .json({
        success: true,
        data: { ...item, url: getPublicUrl(item.file, "gallery") },
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to save gallery image." });
  }
});

router.post("/home/upload", homeUpload.single("image"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    const data = readImages();
    const nextId =
      Math.max(0, ...data.home.map((item) => Number(item.id) || 0)) + 1;
    const item = {
      id: nextId,
      file: req.file.filename,
      order: data.home.length + 1,
    };
    data.home.push(item);
    writeImages(data);
    res
      .status(201)
      .json({
        success: true,
        data: { ...item, url: getPublicUrl(item.file, "home") },
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to save home image." });
  }
});

router.put("/gallery/reorder", (req, res) => {
  try {
    const incoming = Array.isArray(req.body) ? req.body : [];
    const data = readImages();
    const reordered = normalizeItems(incoming, "gallery").map(
      (item, index) => ({ ...item, order: index + 1 }),
    );
    data.gallery = reordered;
    writeImages(data);
    res.json({
      success: true,
      data: reordered.map((item) => ({
        ...item,
        url: getPublicUrl(item.file, "gallery"),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to reorder gallery images." });
  }
});

router.put("/home/reorder", (req, res) => {
  try {
    const incoming = Array.isArray(req.body) ? req.body : [];
    const data = readImages();
    const reordered = normalizeItems(incoming, "home").map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    data.home = reordered;
    writeImages(data);
    res.json({
      success: true,
      data: reordered.map((item) => ({
        ...item,
        url: getPublicUrl(item.file, "home"),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to reorder home images." });
  }
});

router.delete("/gallery/:id", (req, res) => {
  try {
    const data = readImages();
    const item = data.gallery.find(
      (image) => String(image.id) === String(req.params.id),
    );
    if (!item)
      return res.status(404).json({ error: "Gallery image not found." });
    removeOldFile("gallery", item.file);
    data.gallery = normalizeItems(
      data.gallery.filter(
        (image) => String(image.id) !== String(req.params.id),
      ),
      "gallery",
    ).map((image, index) => ({ ...image, order: index + 1 }));
    writeImages(data);
    res.json({ success: true, message: "Gallery image deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete gallery image." });
  }
});

router.delete("/home/:id", (req, res) => {
  try {
    const data = readImages();
    const item = data.home.find(
      (image) => String(image.id) === String(req.params.id),
    );
    if (!item) return res.status(404).json({ error: "Home image not found." });
    removeOldFile("home", item.file);
    data.home = normalizeItems(
      data.home.filter((image) => String(image.id) !== String(req.params.id)),
      "home",
    ).map((image, index) => ({ ...image, order: index + 1 }));
    writeImages(data);
    res.json({ success: true, message: "Home image deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete home image." });
  }
});

router.put(
  "/gallery/:id/replace",
  galleryUpload.single("image"),
  (req, res) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ error: "No replacement image uploaded." });
      const data = readImages();
      const item = data.gallery.find(
        (image) => String(image.id) === String(req.params.id),
      );
      if (!item)
        return res.status(404).json({ error: "Gallery image not found." });
      removeOldFile("gallery", item.file);
      item.file = req.file.filename;
      writeImages(data);
      res.json({
        success: true,
        data: { ...item, url: getPublicUrl(item.file, "gallery") },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to replace gallery image." });
    }
  },
);

router.put("/home/:id/replace", homeUpload.single("image"), (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No replacement image uploaded." });
    const data = readImages();
    const item = data.home.find(
      (image) => String(image.id) === String(req.params.id),
    );
    if (!item) return res.status(404).json({ error: "Home image not found." });
    removeOldFile("home", item.file);
    item.file = req.file.filename;
    writeImages(data);
    res.json({
      success: true,
      data: { ...item, url: getPublicUrl(item.file, "home") },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to replace home image." });
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "Image exceeds the 5MB maximum size." });
    }
  }

  if (error && error.message) {
    return res.status(400).json({ error: error.message });
  }

  next(error);
});

export default router;
