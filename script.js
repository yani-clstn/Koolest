// Hamburger Mobile Nav & Page Interactions
document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.getElementById("hamburger-btn") || document.getElementById("mobileMenuBtn");
  const navMenu = document.getElementById("nav-menu") || document.getElementById("mobileMenu");
  const navLinks = navMenu?.querySelectorAll("a");

  if (hamburgerBtn && navMenu) {
    const toggleMenu = () => {
      const isHidden = navMenu.classList.contains("hidden");

      if (isHidden) {
        navMenu.classList.remove("hidden");
        navMenu.classList.add("flex");
      } else {
        navMenu.classList.add("hidden");
        navMenu.classList.remove("flex");
      }

      const icon = hamburgerBtn.querySelector("i");
      if (icon) {
        if (isHidden) {
          icon.classList.remove("fa-bars");
          icon.classList.add("fa-xmark");
        } else {
          icon.classList.remove("fa-xmark");
          icon.classList.add("fa-bars");
        }
      }
    };

    const closeMenu = () => {
      navMenu.classList.add("hidden");
      navMenu.classList.remove("flex");
      const icon = hamburgerBtn.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      }
    };

    hamburgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close mobile menu when clicking any link
    navLinks?.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // 1. Initialize Typed.js Animation
  if (document.getElementById("typed-text") && typeof Typed !== "undefined") {
    new Typed("#typed-text", {
      strings: [
        "Air Conditioner.",
        "Washing Machine.",
        "Home Appliances."
      ],
      typeSpeed: 70,
      backSpeed: 40,
      backDelay: 1800,
      loop: true,
      showCursor: true,
      cursorChar: "|"
    });
  }

  // 2. Set dynamic booking date limits (Earliest: Tomorrow, Latest: +60 Days)
  const dateInput = document.getElementById("bookingDate");
  if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 60);

    dateInput.min = tomorrow.toISOString().split("T")[0];
    dateInput.max = maxDate.toISOString().split("T")[0];
  }

  // 3. Initialize particle effects
  initBreezeFloaterParticles();

  // 4. Repeatable Scroll Reveal Animation
  const revealElements = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        } else {
          entry.target.classList.remove("active");
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );
  revealElements.forEach((element) => revealObserver.observe(element));

  // 5. Input constraints & formatters (+63 PH Phone Formatter)
  const phoneInput = document.getElementById("customerPhone") || document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let rawVal = e.target.value.replace(/[^\d+]/g, ""); // Keep numbers & leading plus
      let digits = rawVal.replace(/\D/g, ""); // Pure numeric digits

      if (!digits) {
        e.target.value = "";
        return;
      }

      // Automatically prepends +63 when user types 09... or 9...
      if (digits.startsWith("63")) {
        e.target.value = ("+" + digits).slice(0, 14);
      } else if (digits.startsWith("0")) {
        e.target.value = ("+63" + digits.slice(1)).slice(0, 14);
      } else if (digits.startsWith("9")) {
        e.target.value = ("+63" + digits).slice(0, 14);
      } else {
        e.target.value = rawVal.slice(0, 14);
      }
    });
  }

  const locationInput = document.getElementById("customerAddress") || document.getElementById("location");
  if (locationInput) {
    locationInput.addEventListener("blur", (e) => {
      if (!e.target.value) return;
      e.target.value = e.target.value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    });
  }

  // 6. Booking Form Submission & Reset
  const bookingForm = document.getElementById("bookingForm");
  const bookingSuccess = document.getElementById("bookingSuccess");
  const resetBookingBtn = document.getElementById("resetBookingBtn");
  const bookingErrorBanner = document.getElementById("bookingErrorBanner");

  // Element getter map for field-level tooltips
  const fieldInputMap = {
    fullName: () => document.getElementById("customerName") || document.getElementById("fullName"),
    name: () => document.getElementById("customerName") || document.getElementById("fullName"),
    email: () => document.getElementById("customerEmail") || document.getElementById("email"),
    phone: () => document.getElementById("customerPhone") || document.getElementById("phone"),
    serviceType: () => document.getElementById("serviceType") || document.getElementById("service-type"),
    bookingDate: () => document.getElementById("bookingDate"),
    location: () => document.getElementById("customerAddress") || document.getElementById("location"),
    address: () => document.getElementById("customerAddress") || document.getElementById("location"),
  };

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Clear custom validity messages
      Object.values(fieldInputMap).forEach((getEl) => {
        const el = getEl();
        if (el) el.setCustomValidity("");
      });

      // Clear previous global error banner if present
      if (bookingErrorBanner) {
        bookingErrorBanner.classList.add("hidden");
        bookingErrorBanner.textContent = "";
      }

      const formData = {
        fullName: fieldInputMap.fullName()?.value || "",
        name: fieldInputMap.fullName()?.value || "",
        email: fieldInputMap.email()?.value || "",
        phone: fieldInputMap.phone()?.value || "",
        serviceType: fieldInputMap.serviceType()?.value || "",
        bookingDate: fieldInputMap.bookingDate()?.value || "",
        location: fieldInputMap.location()?.value || "",
        address: fieldInputMap.location()?.value || "",
        notes: document.getElementById("bookingNotes")?.value || "",
      };

      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        // Safely handle HTML or JSON responses
        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const rawText = await response.text();
          throw new Error(rawText || `Server error status ${response.status}`);
        }

        if (!response.ok || !data.success) {
          console.error("Booking API error:", data);
          showFieldError(data);
          return;
        }

        showSuccessUI();
      } catch (err) {
        console.error("Booking API request failed:", err);
        showGenericError(err.message || "An error occurred while submitting your booking. Please check your connection.");
      }
    });
  }

  // "Book Another Service" Button Event Listener
  if (resetBookingBtn) {
    resetBookingBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Clear form inputs
      if (bookingForm) {
        bookingForm.reset();
        bookingForm.classList.remove("hidden");
        bookingForm.style.display = "block";
      }

      // Hide success message
      if (bookingSuccess) {
        bookingSuccess.classList.add("hidden");
        bookingSuccess.style.display = "none";
      }

      // Clear active error banner if any
      if (bookingErrorBanner) {
        bookingErrorBanner.classList.add("hidden");
        bookingErrorBanner.textContent = "";
      }

      // Smooth scroll back to form container center
      const bookingCard = document.getElementById("bookingCard") || document.querySelector(".booking-card");
      if (bookingCard) {
        bookingCard.style.display = "block";
        bookingCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  function showFieldError(data) {
    if (data?.details) {
      const firstField = Object.keys(data.details).find(
        (key) => key !== "_errors" && data.details[key]?._errors?.length
      );
      if (firstField && fieldInputMap[firstField]) {
        const message = data.details[firstField]._errors[0];
        const el = fieldInputMap[firstField]();
        if (el) {
          el.setCustomValidity(message);
          el.reportValidity();
          el.addEventListener("input", () => el.setCustomValidity(""), { once: true });
          return;
        }
      }
    }
    showGenericError(data?.error || data?.message || "Failed to submit booking. Please try again.");
  }

  function showGenericError(message) {
    if (bookingErrorBanner) {
      bookingErrorBanner.textContent = message;
      bookingErrorBanner.classList.remove("hidden");
    } else {
      const el = fieldInputMap.email() || fieldInputMap.fullName();
      if (el) {
        el.setCustomValidity(message);
        el.reportValidity();
        el.addEventListener("input", () => el.setCustomValidity(""), { once: true });
      } else {
        alert(message);
      }
    }
  }

  function showSuccessUI() {
    const bookingCard = document.getElementById("bookingCard") || document.querySelector(".booking-card");

    if (bookingForm) {
      bookingForm.classList.add("hidden");
      bookingForm.style.display = "none";
    }

    if (bookingSuccess) {
      bookingSuccess.classList.remove("hidden");
      bookingSuccess.style.display = "block";
    }

    if (bookingCard) {
      bookingCard.style.display = "block";
      bookingCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // 7. Feedback Form Submission
  const feedbackForm = document.getElementById("feedbackForm");
  const feedbackFieldInputMap = {
    name: () => document.getElementById("clientName"),
    message: () => document.getElementById("comment"),
  };

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      Object.values(feedbackFieldInputMap).forEach((getEl) => {
        const el = getEl();
        if (el) el.setCustomValidity("");
      });

      const ratingError = document.getElementById("ratingError");
      if (ratingError) ratingError.style.display = "none";

      const ratingInput = feedbackForm.querySelector('input[name="rating"]:checked');

      const formData = {
        name: document.getElementById("clientName")?.value || "",
        rating: ratingInput?.value || "",
        message: document.getElementById("comment")?.value || "",
      };

      try {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        let data;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const rawText = await response.text();
          throw new Error(rawText || `Server returned error status ${response.status}`);
        }

        if (!response.ok || !data.success) {
          console.error("Feedback submission error:", data.details || data.error);
          showFeedbackFieldError(data);
          return;
        }

        showFeedbackSuccess();
      } catch (err) {
        console.error("Feedback API request failed:", err);
        showFeedbackGenericError(err.message || "Something went wrong. Please try again.");
      }
    });
  }

  function showFeedbackFieldError(data) {
    if (data?.details) {
      const firstField = Object.keys(data.details).find(
        (key) => key !== "_errors" && data.details[key]?._errors?.length
      );

      if (firstField === "rating") {
        showRatingError(data.details.rating._errors[0]);
        return;
      }

      if (firstField && feedbackFieldInputMap[firstField]) {
        const message = data.details[firstField]._errors[0];
        const el = feedbackFieldInputMap[firstField]();
        if (el) {
          el.setCustomValidity(message);
          el.reportValidity();
          el.addEventListener("input", () => el.setCustomValidity(""), { once: true });
          return;
        }
      }
    }
    showFeedbackGenericError(data?.error || "Failed to submit feedback. Please try again.");
  }

  function showRatingError(message) {
    const errorEl = document.getElementById("ratingError");
    if (!errorEl) {
      showFeedbackGenericError(message);
      return;
    }
    errorEl.textContent = message;
    errorEl.style.display = "block";

    const ratingInputs = feedbackForm.querySelectorAll('input[name="rating"]');
    ratingInputs.forEach((input) => {
      input.addEventListener(
        "change",
        () => {
          errorEl.style.display = "none";
        },
        { once: true }
      );
    });
  }

  function showFeedbackGenericError(message) {
    const el = document.getElementById("clientName");
    if (el) {
      el.setCustomValidity(message);
      el.reportValidity();
      el.addEventListener("input", () => el.setCustomValidity(""), { once: true });
    } else {
      alert(message);
    }
  }

  function showFeedbackSuccess() {
    const formWrapper = document.getElementById("feedbackFormWrapper");
    const successMsg = document.getElementById("feedbackSuccess");

    if (formWrapper) formWrapper.style.display = "none";
    if (successMsg) successMsg.style.display = "block";
  }

  // 8. Issue Form Submission
  const issueForm = document.getElementById("issueForm");
  const issueFieldInputMap = {
    name: () => document.getElementById("issueName") || document.getElementById("fullName"),
    email: () => document.getElementById("issueEmail") || document.getElementById("email"),
    issueType: () => document.getElementById("issueType") || document.getElementById("typeOfIssue"),
    message: () => document.getElementById("issueMessage") || document.getElementById("message"),
  };

  if (issueForm) {
    issueForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      Object.values(issueFieldInputMap).forEach((getEl) => {
        const el = getEl();
        if (el) el.setCustomValidity("");
      });

      const issueErrorBanner = document.getElementById("issueErrorBanner");
      if (issueErrorBanner) issueErrorBanner.style.display = "none";

      const formData = {
        name: issueFieldInputMap.name()?.value || "",
        email: issueFieldInputMap.email()?.value || "",
        issueType: issueFieldInputMap.issueType()?.value || "",
        message: issueFieldInputMap.message()?.value || "",
      };

      try {
        const response = await fetch("/api/report-issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        let data;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const rawText = await response.text();
          throw new Error(rawText || `Server error status ${response.status}`);
        }

        if (!response.ok || !data.success) {
          console.error("Report issue submission error:", data.details || data.error);
          showIssueFieldError(data);
          return;
        }

        issueForm.style.display = "none";
        const formSuccess = document.getElementById("formSuccess");
        if (formSuccess) formSuccess.style.display = "block";

      } catch (err) {
        console.error("Report issue API request failed:", err);
        showIssueGenericError(err.message || "An error occurred while submitting your report.");
      }
    });
  }

  function showIssueFieldError(data) {
    if (data?.details) {
      const firstField = Object.keys(data.details).find(
        (key) => key !== "_errors" && data.details[key]?._errors?.length
      );

      if (firstField && issueFieldInputMap[firstField]) {
        const message = data.details[firstField]._errors[0];
        const el = issueFieldInputMap[firstField]();
        if (el) {
          el.setCustomValidity(message);
          el.reportValidity();
          el.addEventListener("input", () => el.setCustomValidity(""), { once: true });
          return;
        }
      }
    }
    showIssueGenericError(data?.error || data?.message || "Failed to submit report. Please check your inputs.");
  }

  function showIssueGenericError(message) {
    const issueErrorBanner = document.getElementById("issueErrorBanner");
    if (issueErrorBanner) {
      issueErrorBanner.textContent = message;
      issueErrorBanner.style.display = "block";
    } else {
      const el = issueFieldInputMap.email() || issueFieldInputMap.name();
      if (el) {
        el.setCustomValidity(message);
        el.reportValidity();
        el.addEventListener("input", () => el.setCustomValidity(""), { once: true });
      } else {
        alert(message);
      }
    }
  }

  // 9. Back to Top Button
  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.remove("hidden");
        backToTopBtn.classList.add("flex");
      } else {
        backToTopBtn.classList.add("hidden");
        backToTopBtn.classList.remove("flex");
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 10. Privacy Policy (DPA) Modal Logic
  const privacyModal = document.getElementById("privacyModal");
  const openPrivacyBtn = document.getElementById("openPrivacyModal");
  const closePrivacyBtn = document.getElementById("closePrivacyModal");
  const acceptPrivacyBtn = document.getElementById("acceptPrivacyBtn");
  const dpaCheckbox = document.getElementById("dpaAgreeCheckbox");

  const openModal = () => {
    if (!privacyModal) return;
    privacyModal.classList.remove("hidden");
    privacyModal.classList.add("flex");
    document.body.classList.add("overflow-hidden");
  };

  const closeModal = () => {
    if (!privacyModal) return;
    privacyModal.classList.add("hidden");
    privacyModal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
  };

  openPrivacyBtn?.addEventListener("click", openModal);
  closePrivacyBtn?.addEventListener("click", closeModal);

  acceptPrivacyBtn?.addEventListener("click", () => {
    if (dpaCheckbox) dpaCheckbox.checked = true;
    closeModal();
  });

  privacyModal?.addEventListener("click", (e) => {
    if (e.target === privacyModal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && privacyModal && !privacyModal.classList.contains("hidden")) {
      closeModal();
    }
  });

  // 11. Initialize Slideshow safely
  initSlideshow();
});

// Helper: Particle animation generator
function initBreezeFloaterParticles() {
  const container = document.getElementById("breeze-container");
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.className = "breeze-particle";

    const size = Math.random() * 24 + 12;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 8}s`;
    particle.style.animationDuration = `${Math.random() * 6 + 8}s`;

    container.appendChild(particle);
  }
}

// Slideshow Controller
let slideIndex = 0;

function initSlideshow() {
  const slides = document.getElementsByClassName("slide");
  if (slides.length === 0) return;

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  slideIndex++;
  if (slideIndex > slides.length) {
    slideIndex = 1;
  }

  slides[slideIndex - 1].style.display = "block";
  setTimeout(initSlideshow, 3000);
}