import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import cors from "cors";
import { fileURLToPath } from "url";
import imagesRouter from "./routes/images.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);
const frontendPath = path.join(__dirname, "..", "frontend");
const uploadRootPath = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "uploads");
const dataPath = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, "data");
const INTAKES_FILE = path.join(dataPath, "intakes.json");
const APPLICATIONS_FILE = path.join(dataPath, "applications.json");
const MESSAGES_FILE = path.join(dataPath, "messages.json");
const TESTIMONIALS_FILE = path.join(dataPath, "testimonials.json");
const TESTIMONIAL_UPLOAD_DIR = path.join(uploadRootPath, "testimonials");
const DASHBOARD_FILE = path.join(dataPath, "dashboard.json");
const ADMIN_AUTH_FILE = path.join(dataPath, "admin-auth.json");
const activeTokens = new Map();
const loginAttempts = new Map();
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(uploadRootPath));
app.use(express.static(frontendPath));
app.use("/api/images", imagesRouter);

if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath, { recursive: true });

if (!fs.existsSync(INTAKES_FILE)) {
  const defaultIntakes = {
    april: {
      id: "april",
      icon: "🌸",
      title: "April Intake",
      subtitle: "Main Academic Year Start",
      applicationDeadline: "Nov 30, 2025",
      courseDuration: "1-2 Years",
      visaProcessing: "Dec 2025 - Jan 2026",
      departure: "Late March 2026",
      scholarship: "100% Available",
      scholarshipColor: "red",
      partTimeWork: "28 hrs/week",
      buttonText: "Apply for April Intake →",
    },
    october: {
      id: "october",
      icon: "🍂",
      title: "October Intake",
      subtitle: "Second Major Intake",
      applicationDeadline: "May 31, 2026",
      courseDuration: "1.5 Years",
      visaProcessing: "Jun - Jul 2026",
      departure: "September 2026",
      scholarship: "Partial to Full",
      scholarshipColor: "blue",
      partTimeWork: "28 hrs/week",
      buttonText: "Apply for October Intake →",
    },
  };
  fs.writeFileSync(INTAKES_FILE, JSON.stringify(defaultIntakes, null, 2));
}

if (!fs.existsSync(APPLICATIONS_FILE))
  fs.writeFileSync(APPLICATIONS_FILE, "[]");
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, "[]");
if (!fs.existsSync(TESTIMONIALS_FILE))
  fs.writeFileSync(TESTIMONIALS_FILE, "[]");
fs.mkdirSync(TESTIMONIAL_UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DASHBOARD_FILE)) {
  fs.writeFileSync(
    DASHBOARD_FILE,
    JSON.stringify(
      {
        brand: "TEWA Education",
        subtitle: "Education Consultancy CMS",
        welcome: "Welcome, Admin",
        profile: {
          name: "TEWA Education",
          role: "Japan Education Consultancy",
          bio: "Helping students study, work, and build their future in Japan.",
          email: "tewa.educ@gmail.com",
          phone: "+977-9767474000",
          image: "/images/logo.png",
        },
        photos: [{ image: "/images/logo.png", caption: "TEWA Education logo" }],
        containers: [
          { id: "home", name: "Hero", heading: "Study In Japan" },
          {
            id: "about",
            name: "About TEWA",
            heading: "Guiding Your Path to Success in Japan",
          },
          {
            id: "language-programs",
            name: "Language Programs",
            heading: "Japanese Language Courses & Tests",
          },
          {
            id: "kaigo-program",
            name: "Kaigo Program",
            heading: "Kaigo (介護) Scholarship Program",
          },
          { id: "services", name: "Services", heading: "Our Services" },
          { id: "why-us", name: "Why Choose Us", heading: "Why Choose TEWA?" },
          { id: "apply", name: "Application", heading: "Apply Now" },
          {
            id: "testimonials",
            name: "Testimonials",
            heading: "Success Stories",
          },
          { id: "gallery", name: "Gallery", heading: "Gallery" },
          { id: "contact", name: "Contact", heading: "Contact Us" },
        ],
        cards: [
          { label: "New Leads", value: "0", color: "#ef4444" },
          { label: "Unread Messages", value: "0", color: "#3b82f6" },
        ],
        whyChoose: {
          subtitle: "Your trusted partner for Japan education since 2024",
          items: [
            {
              icon: "📅",
              title: "Flexible Class Schedule",
              text: "Learn Japanese at timings that fit your lifestyle and commitments.",
            },
            {
              icon: "👨‍🏫",
              title: "Experienced Instructors",
              text: "Practical, engaging, and result-oriented Japanese language training.",
            },
            {
              icon: "📋",
              title: "Complete Application Support",
              text: "From school selection to document preparation, we simplify the process.",
            },
            {
              icon: "📝",
              title: "Exam Registration Assistance",
              text: "Get professional guidance for Japanese language proficiency tests.",
            },
            {
              icon: "🎓",
              title: "Scholarship Opportunities",
              text: "Explore special scholarship pathways, including Kaigo (介護) programs, one of the most in-demand jobs in Japan.",
            },
          ],
        },
      },
      null,
      2,
    ),
  );
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString("hex") };
}

function ensureAdminAuth() {
  if (!fs.existsSync(ADMIN_AUTH_FILE)) {
    const initialPassword = process.env.ADMIN_PASSWORD || "tewa123";
    fs.writeFileSync(
      ADMIN_AUTH_FILE,
      JSON.stringify(hashPassword(initialPassword), null, 2),
    );
  }
}

function verifyPassword(password) {
  try {
    const credentials = JSON.parse(fs.readFileSync(ADMIN_AUTH_FILE, "utf-8"));
    const candidate = crypto.scryptSync(password, credentials.salt, 64);
    const stored = Buffer.from(credentials.hash, "hex");
    return (
      stored.length === candidate.length &&
      crypto.timingSafeEqual(stored, candidate)
    );
  } catch (error) {
    return false;
  }
}

function resolveIntakeId(id) {
  const aliases = {
    april2026: "april",
    "april-2026": "april",
    april2027: "april",
    "april-2027": "april",
    october2026: "october",
    "october-2026": "october",
  };
  return aliases[id.toLowerCase()] || id;
}

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const expiresAt = token ? activeTokens.get(token) : null;
  if (!expiresAt || expiresAt <= Date.now()) {
    if (token) activeTokens.delete(token);
    return res
      .status(401)
      .json({ error: "Please log in as an administrator." });
  }
  next();
}

app.locals.requireAdmin = requireAdmin;

ensureAdminAuth();

app.get("/api/intakes", (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(INTAKES_FILE, "utf-8")));
  } catch (error) {
    res.status(500).json({ error: "Failed to read intakes data" });
  }
});

app.get("/api/intakes/:id", (req, res) => {
  try {
    const intakes = JSON.parse(fs.readFileSync(INTAKES_FILE, "utf-8"));
    const intake = intakes[resolveIntakeId(req.params.id)];
    if (!intake) return res.status(404).json({ error: "Intake not found" });
    res.json(intake);
  } catch (error) {
    res.status(500).json({ error: "Failed to read intake data" });
  }
});

app.get("/api/dashboard", (req, res) => {
  try {
    const dashboard = JSON.parse(fs.readFileSync(DASHBOARD_FILE, "utf-8"));
    const applications = JSON.parse(
      fs.readFileSync(APPLICATIONS_FILE, "utf-8"),
    );
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    const cardCounts = {
      Applications: applications.length,
      "New Leads": applications.filter(
        (application) => application.status === "New Lead",
      ).length,
      "Unread Messages": messages.filter((message) => !message.read).length,
    };

    res.json({
      ...dashboard,
      cards: dashboard.cards.map((card) => ({
        ...card,
        value: cardCounts[card.label] ?? card.value,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to read dashboard data" });
  }
});

app.post("/api/auth/login", (req, res) => {
  const clientKey = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const attempt = loginAttempts.get(clientKey);
  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(clientKey, { count: 0, resetAt: now + LOGIN_WINDOW_MS });
  } else if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    res.set("Retry-After", String(Math.ceil((attempt.resetAt - now) / 1000)));
    return res
      .status(429)
      .json({ error: "Too many login attempts. Try again later." });
  }

  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  if (!verifyPassword(password)) {
    const nextAttempt = loginAttempts.get(clientKey);
    nextAttempt.count += 1;
    return res.status(401).json({ error: "Incorrect password." });
  }

  loginAttempts.delete(clientKey);
  const token = crypto.randomBytes(32).toString("hex");
  activeTokens.set(token, now + TOKEN_TTL_MS);
  res.json({ token });
});

app.post("/api/applications", (req, res) => {
  const requiredFields = [
    "fullName",
    "phone",
    "email",
    "intake",
    "interest",
    "education",
  ];
  const missingField = requiredFields.find(
    (field) => typeof req.body?.[field] !== "string" || !req.body[field].trim(),
  );
  if (missingField)
    return res.status(400).json({ error: `${missingField} is required.` });

  try {
    const applications = JSON.parse(
      fs.readFileSync(APPLICATIONS_FILE, "utf-8"),
    );
    const application = {
      ...req.body,
      timestamp:
        typeof req.body.timestamp === "string"
          ? req.body.timestamp
          : new Date().toISOString(),
      status: "New Lead",
    };
    applications.push(application);
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2));
    if (application.message?.trim()) {
      const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
      messages.push({ ...application, id: crypto.randomUUID(), read: false });
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    }
    res
      .status(201)
      .json({ success: true, message: "Application submitted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to save application." });
  }
});

app.get("/api/messages", requireAdmin, (req, res) => {
  try {
    res.json(JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8")));
  } catch (error) {
    res.status(500).json({ error: "Failed to read messages." });
  }
});

app.get("/api/testimonials", (req, res) => {
  try {
    const testimonials = JSON.parse(
      fs.readFileSync(TESTIMONIALS_FILE, "utf-8"),
    );
    res.json(
      testimonials.map((testimonial) => ({
        ...testimonial,
        image: getTestimonialImage(testimonial.image),
      })),
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to read success stories." });
  }
});

const testimonialUpload = multer({
  storage: multer.diskStorage({
    destination: TESTIMONIAL_UPLOAD_DIR,
    filename: (req, file, callback) =>
      callback(
        null,
        `${crypto.randomUUID()}${path.extname(file.originalname || "").toLowerCase()}`,
      ),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const validType = ["image/jpeg", "image/png", "image/webp"].includes(
      file.mimetype,
    );
    callback(
      null,
      validType && [".jpg", ".jpeg", ".png", ".webp"].includes(extension),
    );
  },
});

function removeTestimonialImage(imageUrl) {
  if (!imageUrl?.startsWith("/uploads/testimonials/")) return;
  const filePath = path.join(TESTIMONIAL_UPLOAD_DIR, path.basename(imageUrl));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function getTestimonialImage(imageUrl) {
  if (imageUrl?.startsWith("/uploads/testimonials/")) return imageUrl;
  if (imageUrl?.startsWith("/images/")) return imageUrl;
  if (imageUrl?.startsWith("images/")) return `/${imageUrl}`;
  return "";
}

function validateTestimonial(body) {
  const requiredFields = ["name", "quote", "details"];
  return requiredFields.find(
    (field) => typeof body?.[field] !== "string" || !body[field].trim(),
  );
}

app.post(
  "/api/testimonials",
  requireAdmin,
  testimonialUpload.single("image"),
  (req, res) => {
    const missingField = validateTestimonial(req.body);
    if (missingField)
      return res.status(400).json({ error: `${missingField} is required.` });
    if (!req.file)
      return res.status(400).json({ error: "Student image is required." });

    try {
      const testimonials = JSON.parse(
        fs.readFileSync(TESTIMONIALS_FILE, "utf-8"),
      );
      const testimonial = {
        id: crypto.randomUUID(),
        name: req.body.name.trim(),
        quote: req.body.quote.trim(),
        details: req.body.details.trim(),
        image: `/uploads/testimonials/${req.file.filename}`,
      };
      testimonials.push(testimonial);
      fs.writeFileSync(
        TESTIMONIALS_FILE,
        JSON.stringify(testimonials, null, 2),
      );
      res.status(201).json({ success: true, data: testimonial });
    } catch (error) {
      res.status(500).json({ error: "Failed to create success story." });
    }
  },
);

app.put(
  "/api/testimonials/:id",
  requireAdmin,
  testimonialUpload.single("image"),
  (req, res) => {
    const missingField = validateTestimonial(req.body);
    if (missingField)
      return res.status(400).json({ error: `${missingField} is required.` });

    try {
      const testimonials = JSON.parse(
        fs.readFileSync(TESTIMONIALS_FILE, "utf-8"),
      );
      const testimonialIndex = testimonials.findIndex(
        (testimonial) => testimonial.id === req.params.id,
      );
      if (testimonialIndex < 0)
        return res.status(404).json({ error: "Success story not found." });
      const previousImage = testimonials[testimonialIndex].image;
      testimonials[testimonialIndex] = {
        id: req.params.id,
        name: req.body.name.trim(),
        quote: req.body.quote.trim(),
        details: req.body.details.trim(),
        image: req.file
          ? `/uploads/testimonials/${req.file.filename}`
          : previousImage,
      };
      if (req.file) removeTestimonialImage(previousImage);
      fs.writeFileSync(
        TESTIMONIALS_FILE,
        JSON.stringify(testimonials, null, 2),
      );
      res.json({ success: true, data: testimonials[testimonialIndex] });
    } catch (error) {
      res.status(500).json({ error: "Failed to update success story." });
    }
  },
);

app.delete("/api/testimonials/:id", requireAdmin, (req, res) => {
  try {
    const testimonials = JSON.parse(
      fs.readFileSync(TESTIMONIALS_FILE, "utf-8"),
    );
    const testimonialIndex = testimonials.findIndex(
      (testimonial) => testimonial.id === req.params.id,
    );
    if (testimonialIndex < 0)
      return res.status(404).json({ error: "Success story not found." });
    removeTestimonialImage(testimonials[testimonialIndex].image);
    testimonials.splice(testimonialIndex, 1);
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2));
    res.json({ success: true, message: "Success story deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete success story." });
  }
});

function findMessageIndex(messages, messageId) {
  return messages.findIndex(
    (message) => message.id === messageId || message.timestamp === messageId,
  );
}

app.put("/api/messages/:id", requireAdmin, (req, res) => {
  try {
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    const messageIndex = findMessageIndex(messages, req.params.id);
    if (messageIndex < 0)
      return res.status(404).json({ error: "Message not found." });
    if (typeof req.body?.read !== "boolean")
      return res
        .status(400)
        .json({ error: "Read status must be true or false." });

    messages[messageIndex] = { ...messages[messageIndex], read: req.body.read };
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    res.json({ success: true, data: messages[messageIndex] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update message." });
  }
});

app.delete("/api/messages/:id", requireAdmin, (req, res) => {
  try {
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    const messageIndex = findMessageIndex(messages, req.params.id);
    if (messageIndex < 0)
      return res.status(404).json({ error: "Message not found." });

    messages.splice(messageIndex, 1);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    res.json({ success: true, message: "Message deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message." });
  }
});

app.put("/api/dashboard", requireAdmin, (req, res) => {
  try {
    const dashboard = JSON.parse(fs.readFileSync(DASHBOARD_FILE, "utf-8"));
    const nextDashboard = { ...dashboard, ...req.body };
    if (
      !Array.isArray(nextDashboard.cards) ||
      nextDashboard.cards.length !== 6
    ) {
      return res
        .status(400)
        .json({ error: "Dashboard must contain exactly six cards." });
    }
    fs.writeFileSync(DASHBOARD_FILE, JSON.stringify(nextDashboard, null, 2));
    res.json({ success: true, data: nextDashboard });
  } catch (error) {
    res.status(500).json({ error: "Failed to save dashboard data" });
  }
});

app.put("/api/intakes/:id", requireAdmin, (req, res) => {
  try {
    const intakes = JSON.parse(fs.readFileSync(INTAKES_FILE, "utf-8"));
    const intakeId = resolveIntakeId(req.params.id);
    if (!intakes[intakeId])
      return res.status(404).json({ error: "Intake not found" });
    intakes[intakeId] = { ...intakes[intakeId], ...req.body };
    fs.writeFileSync(INTAKES_FILE, JSON.stringify(intakes, null, 2));
    res.json({
      success: true,
      message: "Intake updated successfully",
      data: intakes[intakeId],
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update intake data" });
  }
});

app.get("/api/health", (req, res) =>
  res.json({ status: "Server is running", timestamp: new Date() }),
);
app.get("/", (req, res) => res.sendFile(path.join(frontendPath, "index.html")));

app.listen(PORT, () => {
  console.log(
    `\n✅ TEWA Backend Server is running on http://localhost:${PORT}`,
  );
  console.log(`📊 Admin Panel: http://localhost:${PORT}/admin.html`);
  console.log(`🔌 API Endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/intakes`);
  console.log(
    `   PUT  http://localhost:${PORT}/api/intakes/:id (requires login)\n`,
  );
});
