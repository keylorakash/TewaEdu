// TEWA Education Consultancy - Main JavaScript

// ==========================================
// Hero Image Slider
// ==========================================
let heroIndex = 0;
let heroSlides = [];
let heroDots = [];
let heroAutoPlayInterval = null;

function initHeroSlider() {
  const sliderContainer = document.getElementById("heroSlider");
  if (!sliderContainer) return;

  heroSlides = sliderContainer.querySelectorAll(".slide");
  heroDots = sliderContainer.querySelectorAll(".dot");

  if (heroSlides.length === 0) return;

  // Start auto play
  startHeroAutoPlay();

  // Pause on hover
  sliderContainer.addEventListener("mouseenter", stopHeroAutoPlay);
  sliderContainer.addEventListener("mouseleave", startHeroAutoPlay);
}

function showHeroSlide(n) {
  if (heroSlides.length === 0) return;

  // Wrap index
  if (n >= heroSlides.length) {
    heroIndex = 0;
  } else if (n < 0) {
    heroIndex = heroSlides.length - 1;
  } else {
    heroIndex = n;
  }

  // Update active classes for slides
  heroSlides.forEach((slide, i) => {
    if (i === heroIndex) {
      slide.classList.add("active");
    } else {
      slide.classList.remove("active");
    }
  });

  // Update active classes for dots
  heroDots.forEach((dot, i) => {
    if (i === heroIndex) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function nextHeroSlide(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  showHeroSlide(heroIndex + 1);
}

function prevHeroSlide(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  showHeroSlide(heroIndex - 1);
}

function setHeroSlide(n) {
  showHeroSlide(n);
}

function startHeroAutoPlay() {
  if (heroAutoPlayInterval) clearInterval(heroAutoPlayInterval);
  heroAutoPlayInterval = setInterval(() => {
    nextHeroSlide();
  }, 4000);
}

function stopHeroAutoPlay() {
  if (heroAutoPlayInterval) {
    clearInterval(heroAutoPlayInterval);
    heroAutoPlayInterval = null;
  }
}

// ==========================================
// Intake Selection Functions
// ==========================================

function selectIntake(type) {
  scrollToForm(type);
}

function scrollToForm(type) {
  document.getElementById("apply").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => {
    selectFormIntake(type);
  }, 500);
}

function selectFormIntake(type) {
  const aprilOption = document.getElementById("aprilOption");
  const octoberOption = document.getElementById("octoberOption");
  const hiddenInput = document.getElementById("selectedIntake");
  if (!aprilOption || !octoberOption || !hiddenInput) return;

  if (type === "april") {
    aprilOption.classList.add("selected");
    aprilOption.classList.remove("october-option");
    octoberOption.classList.remove("selected");
    hiddenInput.value = "April Intake";
  } else {
    octoberOption.classList.add("selected");
    aprilOption.classList.remove("selected");
    hiddenInput.value = "October Intake";
  }
}

// ==========================================
// Form Submission Handler
// ==========================================

async function handleSubmit(e) {
  e.preventDefault();

  const btn = document.getElementById("submitBtn");
  const status = document.getElementById("formStatus");
  const form = e.target;

  btn.classList.add("loading");
  btn.disabled = true;
  status.style.display = "none";

  const formData = new FormData(form);
  const data = {
    timestamp: new Date().toISOString(),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    age: formData.get("age"),
    intake: formData.get("intake"),
    interest: formData.get("interest"),
    education: formData.get("education"),
    message: formData.get("message"),
    source: "TEWA Website",
    status: "New Lead",
  };

  try {
    const response = await fetch(`${API_URL}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // Check if request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      status.innerHTML = `
            <strong>✅ Application Submitted!</strong><br>
            Thank you ${data.fullName} for applying for ${data.intake}.<br>
            Our team will contact you within 24 hours.
        `;
      status.className = "form-status success";
    } else {
      throw new Error(result.message || "Failed to submit to Google Sheets");
    }

    status.style.display = "block";
    form.reset();
    selectFormIntake("april");
  } catch (error) {
    console.error("Form submission error:", error);
    status.innerHTML = `
            <strong>❌ Error submitting form.</strong><br>
            ${error.message}<br>
            Please call us directly at +977-9767474000
        `;
    status.className = "form-status error";
    status.style.display = "block";
  } finally {
    btn.classList.remove("loading");
    btn.disabled = false;
  }
}

// ==========================================
// Mobile Menu Toggle with CSS Classes
// ==========================================

function toggleMobileMenu() {
  const navContainer = document.querySelector(".nav-container");
  const navLinks = document.querySelector(".nav-links");
  const navContact = document.querySelector(".nav-contact-info");

  navContainer.classList.toggle("mobile-open");
  navLinks.classList.toggle("show");
  navContact.classList.toggle("show");
}

// Close mobile menu when link is clicked
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelector(".nav-container")?.classList.remove("mobile-open");
      document.querySelector(".nav-links")?.classList.remove("show");
      document.querySelector(".nav-contact-info")?.classList.remove("show");
    });
  });
});

// ==========================================
// Optimized Smooth Scroll Navigation
// ==========================================

function smoothScrollToElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Reviews Handler (Google Maps)
function handleReviewsClick(e) {
  e?.preventDefault();
  const mapsUrl =
    "https://www.google.com/maps/place/TEWA+EDUCATION+CONSULTANCY/@27.6656827,85.4247371,15z/data=!4m6!3m5!1s0x39eb1b00520dc45d:0x1eb5d2b844a87ce0!8m2!3d27.6656827!4d85.4247371!16s%2Fg%2F11p59fcvgp?entry=ttu";
  window.open(mapsUrl, "_blank");
}

// Unified anchor link handler
document.addEventListener(
  "click",
  (e) => {
    const link = e.target.closest("a[href^='#']");
    if (!link) return;

    // Handle reviews button specially
    if (link.hasAttribute("data-reviews")) {
      handleReviewsClick(e);
      return;
    }

    // Skip if it has target="_blank"
    if (link.getAttribute("target") === "_blank") return;

    e.preventDefault();
    const href = link.getAttribute("href");
    if (href && href !== "#") {
      smoothScrollToElement(href.substring(1));
    }
  },
  true,
);

// ==========================================
// Navbar Scroll Effect
// ==========================================

window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  if (window.scrollY > 100) {
    nav.style.boxShadow = "0 4px 30px rgba(0,0,0,0.15)";
  } else {
    nav.style.boxShadow = "0 2px 20px rgba(0,0,0,0.08)";
  }
});

// ==========================================
// Intersection Observer for Animations
// ==========================================

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1 },
);

// Observe elements for scroll animations
document
  .querySelectorAll(
    ".service-card, .success-card, .feature-box, .intake-card-large",
  )
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.6s ease";
    observer.observe(el);
  });

// ==========================================
// Success Stories Carousel Slider
// ==========================================
let testimonialIndex = 0;
let testimonialSlides = [];
let testimonialDots = [];
let testimonialAutoPlayInterval = null;

function initTestimonialSlider() {
  const track = document.getElementById("successCarouselTrack");
  const dotsContainer = document.getElementById("successCarouselDots");
  if (!track) return;

  testimonialSlides = track.querySelectorAll(".success-carousel-slide");
  if (dotsContainer) {
    testimonialDots = dotsContainer.querySelectorAll(".dot");
  }

  if (testimonialSlides.length === 0) return;

  // Start autoplay
  startTestimonialAutoPlay();

  // Pause autoplay on mouse hover over the testimonials container
  const container = document.querySelector(".success-carousel-wrapper");
  if (container) {
    container.addEventListener("mouseenter", stopTestimonialAutoPlay);
    container.addEventListener("mouseleave", startTestimonialAutoPlay);
  }
}

async function loadManagedTestimonials() {
  try {
    const response = await fetch(`${API_URL}/api/testimonials`);
    if (!response.ok) return;
    const testimonials = await response.json();
    const track = document.getElementById("successCarouselTrack");
    const dots = document.getElementById("successCarouselDots");
    if (!track || !dots) return;

    const cards = testimonials.map(
      (story) => `
      <div class="success-card">
        <div class="card-left"><div class="student-avatar-circle"><img src="${escapeHtml(story.image)}" alt="${escapeHtml(story.name)}"></div></div>
        <div class="card-right"><span class="quote-icon">“</span><p class="testimonial-quote-text">${escapeHtml(story.quote)}</p><h4 class="student-name">${escapeHtml(story.name)}</h4><p class="student-details">${escapeHtml(story.details)}</p></div>
      </div>
    `,
    );
    const slides = [];
    for (let index = 0; index < cards.length; index += 2) {
      slides.push(
        `<div class="success-carousel-slide${index === 0 ? " active" : ""}">${cards.slice(index, index + 2).join("")}</div>`,
      );
    }
    track.innerHTML = slides.join("");
    dots.innerHTML = slides
      .map(
        (_, index) =>
          `<span class="dot ${index === 0 ? "active" : ""}" onclick="setTestimonialSlide(${index})"></span>`,
      )
      .join("");
    testimonialIndex = 0;
    initTestimonialSlider();
  } catch (error) {
    console.warn("Could not load success stories:", error.message);
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
}

function showTestimonialSlide(n) {
  if (testimonialSlides.length === 0) return;

  // Wrap around index
  if (n >= testimonialSlides.length) {
    testimonialIndex = 0;
  } else if (n < 0) {
    testimonialIndex = testimonialSlides.length - 1;
  } else {
    testimonialIndex = n;
  }

  // Calculate slide offset and translate the track
  const offset = -testimonialIndex * 100;
  const track = document.getElementById("successCarouselTrack");
  if (track) {
    track.style.transform = `translateX(${offset}%)`;
  }

  // Update active status on slides
  testimonialSlides.forEach((slide, i) => {
    if (i === testimonialIndex) {
      slide.classList.add("active");
    } else {
      slide.classList.remove("active");
    }
  });

  // Update active status on dots
  testimonialDots.forEach((dot, i) => {
    if (i === testimonialIndex) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function nextTestimonialSlide(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  showTestimonialSlide(testimonialIndex + 1);
}

function prevTestimonialSlide(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  showTestimonialSlide(testimonialIndex - 1);
}

function setTestimonialSlide(n) {
  showTestimonialSlide(n);
}

function startTestimonialAutoPlay() {
  if (testimonialAutoPlayInterval) clearInterval(testimonialAutoPlayInterval);
  testimonialAutoPlayInterval = setInterval(() => {
    nextTestimonialSlide();
  }, 5000); // 5 seconds interval for testimonials
}

function stopTestimonialAutoPlay() {
  if (testimonialAutoPlayInterval) {
    clearInterval(testimonialAutoPlayInterval);
    testimonialAutoPlayInterval = null;
  }
}

// ==========================================
// Load Intakes from Backend
// ==========================================

const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "";

async function loadIntakesFromBackend() {
  try {
    const response = await fetch(`${API_URL}/api/intakes`);
    if (!response.ok) {
      console.warn("Backend not available. Using static data.");
      return false;
    }

    const intakes = await response.json();

    // Update April Intake Card
    updateIntakeCard("april", intakes.april);

    // Update October Intake Card
    updateIntakeCard("october", intakes.october);

    console.log("✅ Intakes loaded from backend successfully");
    return true;
  } catch (error) {
    console.warn("Could not connect to backend:", error.message);
    console.log("Using static data instead.");
    return false;
  }
}

async function loadContainerHeadings() {
  try {
    const response = await fetch(`${API_URL}/api/dashboard`);
    if (!response.ok) return;
    const dashboard = await response.json();
    const headingSelectors = {
      home: ".hero-content h1",
      about: ".about-content h2",
      "language-programs": ".language-programs .section-header h2",
      "kaigo-program": ".kaigo-program .section-header h2",
      services: ".services .section-header h2",
      "why-us": ".why-us .section-header h2",
      apply: ".application .form-header h2",
      testimonials: ".testimonials .section-header h2",
      gallery: ".gallery .section-header h2",
      contact: ".contact-info h2",
    };
    (dashboard.containers || []).forEach((container) => {
      const heading = document.querySelector(headingSelectors[container.id]);
      if (heading && container.heading) heading.textContent = container.heading;
    });
    const whyChoose = dashboard.whyChoose;
    if (whyChoose) {
      const whySection = document.querySelector(".why-us");
      const subtitle = whySection?.querySelector(".section-header p");
      if (subtitle && whyChoose.subtitle)
        subtitle.textContent = whyChoose.subtitle;
      (whyChoose.items || []).forEach((item, index) => {
        const feature = whySection?.querySelectorAll(".feature-box")[index];
        if (!feature) return;
        const icon = feature.querySelector(".feature-icon-big");
        const title = feature.querySelector("h3");
        const text = feature.querySelector("p");
        if (icon) icon.textContent = item.icon;
        if (title) title.textContent = item.title;
        if (text) text.textContent = item.text;
      });
    }
  } catch (error) {
    console.warn("Could not load frontend container headings:", error.message);
  }
}

function updateIntakeCard(intakeId, intakeData) {
  // Find the intake card container
  const isApril = intakeId === "april";
  const cardClass = isApril
    ? ".intake-card-large.april"
    : ".intake-card-large.october";
  const card = document.querySelector(cardClass);

  if (!card) {
    console.warn(`Could not find ${intakeId} intake card`);
    return;
  }

  // Update card content
  const titleElement = card.querySelector(".intake-title h3");
  const subtitleElement = card.querySelector(".intake-title p");

  if (titleElement) titleElement.textContent = intakeData.title;
  if (subtitleElement) subtitleElement.textContent = intakeData.subtitle;

  // Update details list
  const details = card.querySelectorAll(".intake-details-list li");

  if (details[0]) {
    details[0].querySelector(".detail-value, .deadline-highlight").textContent =
      intakeData.applicationDeadline;
  }
  if (details[1]) {
    details[1].querySelector(".detail-value").textContent =
      intakeData.courseDuration;
  }
  if (details[2]) {
    details[2].querySelector(".detail-value").textContent =
      intakeData.visaProcessing;
  }
  if (details[3]) {
    details[3].querySelector(".detail-value").textContent =
      intakeData.departure;
  }
  if (details[4]) {
    const scholarshipElement = details[4].querySelector(".detail-value");
    scholarshipElement.textContent = intakeData.scholarship;
    // Update color based on scholarshipColor
    if (intakeData.scholarshipColor === "red") {
      scholarshipElement.style.color = "var(--tewa-red)";
    } else if (intakeData.scholarshipColor === "blue") {
      scholarshipElement.style.color = "var(--tewa-blue)";
    }
  }
  if (details[5]) {
    details[5].querySelector(".detail-value").textContent =
      intakeData.partTimeWork;
  }

  // Update button text
  const button = card.querySelector(".intake-btn");
  if (button) button.textContent = intakeData.buttonText;
}

async function loadManagedHomeImages() {
  try {
    const response = await fetch(`${API_URL}/api/images/home`);
    if (!response.ok) return;
    const result = await response.json();
    const slides = Array.isArray(result.data) ? result.data : [];
    const slider = document.querySelector("#heroSlider .slider-slides");
    const dots = document.querySelector("#heroSlider .slider-dots");
    if (!slider || !dots) return;
    slider.innerHTML = slides
      .slice(0, 3)
      .map(
        (image, index) => `
      <div class="slide ${index === 0 ? "active" : ""}">
        <img src="${image.url}" alt="Home slider image ${index + 1}" class="student-image">
      </div>
    `,
      )
      .join("");
    dots.innerHTML = slides
      .slice(0, 3)
      .map(
        (_, index) =>
          `<span class="dot ${index === 0 ? "active" : ""}" onclick="setHeroSlide(${index})"></span>`,
      )
      .join("");
    heroSlides = slider.querySelectorAll(".slide");
    heroDots = dots.querySelectorAll(".dot");
    showHeroSlide(0);
  } catch (error) {
    console.warn("Could not load home images:", error.message);
  }
}

async function loadManagedGalleryImages() {
  try {
    const response = await fetch(`${API_URL}/api/images/gallery`);
    if (!response.ok) return;
    const result = await response.json();
    const galleryItems = Array.isArray(result.data) ? result.data : [];
    const galleryGrid = document.querySelector(".gallery-grid");
    if (!galleryGrid) return;
      if (galleryItems.length === 0) {
        galleryGrid.innerHTML = '<p class="gallery-empty">No gallery images available.</p>';
        return;
      }
    galleryGrid.innerHTML = galleryItems
      .map(
        (image, index) => `
      <div class="gallery-item">
        <img src="${image.url}" alt="Gallery Image ${index + 1}">
        <div class="gallery-overlay">
          <p>Gallery ${index + 1}</p>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (error) {
    console.warn("Could not load gallery images:", error.message);
  }
}

// ==========================================
// Page Load Initialization
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("TEWA Education Consultancy Website Loaded Successfully");

  // Initialize Hero Image Slider
  initHeroSlider();

  // Initialize Success Stories Slider
  initTestimonialSlider();
  loadManagedTestimonials();

  // Initialize default intake selection
  selectFormIntake("april");

  // Load intakes from backend (non-blocking)
  loadIntakesFromBackend();
  loadContainerHeadings();
  loadManagedHomeImages();
  loadManagedGalleryImages();
});
