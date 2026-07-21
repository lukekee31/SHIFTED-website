/* ==================================================================
   SHIFTED — GLOBAL SCRIPT
   Software Design & Development Specification v1.0 — Chapter 4 / 6.9
   ================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ==================================================
     NAVIGATION
     ================================================== */

  // Highlight the current page's nav link based on the document filename.
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  navLinks.forEach(function (link) {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  // Collapse the mobile navbar automatically after a link is tapped.
  const navbarCollapse = document.querySelector(".navbar-collapse");
  if (navbarCollapse) {
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (navbarCollapse.classList.contains("show")) {
          bootstrap.Collapse.getOrCreateInstance(navbarCollapse).hide();
        }
      });
    });
  }

  /* ==================================================
     OVERLAY NAVBAR (full-screen hero pages)
     ================================================== */

  const overlayNavbar = document.querySelector(".navbar-overlay");
  if (overlayNavbar) {
    const solidifyNavbar = function () {
      if (window.scrollY > 60) {
        overlayNavbar.classList.add("navbar-scrolled");
      } else {
        overlayNavbar.classList.remove("navbar-scrolled");
      }
    };
    window.addEventListener("scroll", solidifyNavbar);
    solidifyNavbar();
  }

  /* ==================================================
     DARK MODE
     ================================================== */

  const THEME_KEY = "shifted-theme";
  const themeToggleButtons = document.querySelectorAll(".theme-toggle");
  const rootElement = document.documentElement;

  function applyTheme(theme) {
    if (theme === "dark") {
      rootElement.setAttribute("data-theme", "dark");
    } else {
      rootElement.removeAttribute("data-theme");
    }
    themeToggleButtons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark");
      const iconClass = theme === "dark" ? "bi-sun" : "bi-moon-stars";
      const label = theme === "dark" ? "Light" : "Dark";
      btn.innerHTML = '<i class="bi ' + iconClass + '"></i><span>' + label + "</span>";
    });
  }

  const storedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(storedTheme || (prefersDark ? "dark" : "light"));

  themeToggleButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const isDark = rootElement.getAttribute("data-theme") === "dark";
      const newTheme = isDark ? "light" : "dark";
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    });
  });

  /* ==================================================
     SCROLL REVEAL
     ================================================== */

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealElements.length) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: reveal everything immediately if unsupported.
    revealElements.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ==================================================
     INTERACTIVE FORMS — VEHICLE RECOMMENDATION
     ================================================== */

  const recommendationForm = document.getElementById("recommendationForm");
  if (recommendationForm) {
    recommendationForm.addEventListener("submit", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (!recommendationForm.checkValidity()) {
        recommendationForm.classList.add("was-validated");
        return;
      }

      recommendationForm.classList.add("was-validated");

      const budget = document.getElementById("budget").value;
      const distance = parseFloat(document.getElementById("dailyDistance").value);
      const passengers = document.getElementById("passengers").value;
      const chargingAvailable = recommendationForm.querySelector('input[name="charging"]:checked').value;
      const preference = document.getElementById("preference").value;

      let type;
      let reason;

      if (chargingAvailable === "yes" && distance <= 60 && (preference === "technology" || preference === "comfort")) {
        type = "Electric";
        reason =
          "Your daily driving distance is short and you have home charging available, so an electric vehicle can comfortably cover your commute while keeping running costs low. Since you value " +
          preference +
          ", an EV's instant torque and quiet cabin suit your priorities well.";
      } else if (chargingAvailable === "no" && (distance > 80 || preference === "performance")) {
        type = "Petrol";
        reason =
          (distance > 80
            ? "Your daily driving distance is long and you don't have reliable charging access, so a petrol vehicle offers the flexibility of quick refuelling on longer journeys."
            : "You prioritise performance and don't have reliable charging access, so a petrol vehicle can better satisfy that preference right now.") +
          " Petrol vehicles remain a dependable choice for drivers without consistent access to charging infrastructure.";
      } else {
        type = "Hybrid";
        reason =
          "Your daily driving distance is moderate, and " +
          (chargingAvailable === "no" ? "you do not have reliable charging access, " : "you may not always be near a charger, ") +
          "making a hybrid a practical balance between fuel efficiency and everyday convenience.";
      }

      const resultBox = document.getElementById("recommendationResult");
      if (resultBox) {
        const resultTitle = document.getElementById("recommendationType");
        const resultText = document.getElementById("recommendationReason");
        if (resultTitle) resultTitle.textContent = type;
        if (resultText) resultText.textContent = reason;
        resultBox.classList.remove("d-none");
        resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  /* ==================================================
     CALCULATORS — EV CHARGING TIME
     ================================================== */

  const chargingForm = document.getElementById("chargingCalculatorForm");
  if (chargingForm) {
    chargingForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const batterySize = parseFloat(document.getElementById("batterySize").value);
      const currentPercent = parseFloat(document.getElementById("currentPercent").value);
      const targetPercent = parseFloat(document.getElementById("targetPercent").value);
      const chargerPower = parseFloat(document.getElementById("chargerPower").value);

      const errorEl = document.getElementById("chargingError");
      const resultEl = document.getElementById("chargingResult");

      const invalid =
        isNaN(batterySize) || isNaN(currentPercent) || isNaN(targetPercent) || isNaN(chargerPower) ||
        batterySize <= 0 || chargerPower <= 0 ||
        currentPercent < 0 || currentPercent > 100 ||
        targetPercent < 0 || targetPercent > 100 ||
        targetPercent <= currentPercent;

      if (invalid) {
        if (resultEl) resultEl.classList.add("d-none");
        if (errorEl) {
          errorEl.textContent = "Please enter valid values — target percentage must be higher than current percentage, and battery size / charger power must be greater than zero.";
          errorEl.classList.remove("d-none");
        }
        return;
      }

      if (errorEl) errorEl.classList.add("d-none");

      const energyNeeded = batterySize * ((targetPercent - currentPercent) / 100);
      const timeHours = energyNeeded / chargerPower;

      if (resultEl) {
        resultEl.textContent = "Estimated charging time: " + timeHours.toFixed(1) + " hours";
        resultEl.classList.remove("d-none");
      }
    });
  }

  /* ==================================================
     PAGE SPECIFIC FEATURES
     ================================================== */

  // Reserved for functionality unique to an individual page.
});
