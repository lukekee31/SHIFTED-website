/* ======================================================================
   SHIFTED — Shared JavaScript
   One file, used across every page. Organised into labelled sections.
   ====================================================================== */

// ================= GLOBAL VARIABLES =================
const root = document.documentElement;
const themeButtons = document.querySelectorAll(".theme-toggle-btn");
const THEME_KEY = "shifted-theme";

// ================= THEME TOGGLE =================
// Reads the saved theme (or system preference) and applies it immediately
// so pages never "flash" the wrong theme on load.
function applyTheme(theme) {
    if (theme === "dark") {
        root.setAttribute("data-theme", "dark");
    } else {
        root.removeAttribute("data-theme");
    }
    themeButtons.forEach((btn) => {
        const icon = btn.querySelector("i");
        if (!icon) return;
        icon.className = theme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    });
}

function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
        applyTheme(saved);
    } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
    }
}

function toggleTheme() {
    const isDark = root.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    // Save the user's selected theme so it persists across page refreshes
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
}

themeButtons.forEach((btn) => btn.addEventListener("click", toggleTheme));
initTheme();

// ================= ACTIVE NAVIGATION =================
// Detects the current page URL and highlights the matching nav link so
// users always know where they are in the site.
function highlightActiveNav() {
    const links = document.querySelectorAll(".navbar-nav .nav-link[href]");
    const currentFile = window.location.pathname.split("/").pop() || "index.html";

    links.forEach((link) => {
        const linkFile = link.getAttribute("href").split("/").pop();
        if (linkFile === currentFile) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}
highlightActiveNav();

// ================= NAVBAR SCROLL SHADOW =================
const navbarEl = document.querySelector(".navbar");
function handleNavbarScroll() {
    if (!navbarEl) return;
    navbarEl.classList.toggle("scrolled", window.scrollY > 12);
}
window.addEventListener("scroll", handleNavbarScroll, { passive: true });
handleNavbarScroll();

// ================= SCROLL REVEAL =================
// Elements fade in and move up slightly the first time they enter the
// viewport, then stop observing them so the animation only plays once.
const revealTargets = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && revealTargets.length) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
} else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
}

// ================= SMOOTH SCROLLING =================
// Handles same-page anchor links (Explore button, Back to Top, in-page
// section links) without relying on any external library.
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        if (targetId.length <= 1) return;
        const target = document.querySelector(targetId);
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

// ================= BACK TO TOP =================
const backToTopBtn = document.querySelector(".back-to-top");
if (backToTopBtn) {
    window.addEventListener(
        "scroll",
        () => backToTopBtn.classList.toggle("show", window.scrollY > 500),
        { passive: true }
    );
    backToTopBtn.addEventListener("click", () =>
        window.scrollTo({ top: 0, behavior: "smooth" })
    );
}

// ================= STAT COUNTER ANIMATION =================
// Animates the Home page statistics upward once they scroll into view.
const statNumbers = document.querySelectorAll(".stat-number[data-count]");
function animateCount(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

if ("IntersectionObserver" in window && statNumbers.length) {
    const statObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );
    statNumbers.forEach((el) => statObserver.observe(el));
}

// ================= IMAGE FALLBACK =================
// Content images are supplied locally by the developer after generation.
// Until a real file exists at the given path, swap in a neutral inline
// placeholder so pages never show a broken-image icon.
const PLACEHOLDER_SRC =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">' +
        '<rect width="100%" height="100%" fill="#d8d8d8"/>' +
        '<g fill="#9a9a9a" font-family="sans-serif" text-anchor="middle">' +
        '<text x="400" y="290" font-size="26">SHIFTED</text>' +
        '<text x="400" y="325" font-size="15">Image coming soon</text>' +
        '</g></svg>'
    );

document.querySelectorAll("img").forEach((img) => {
    img.addEventListener(
        "error",
        function handleImgError() {
            if (this.src !== PLACEHOLDER_SRC) {
                this.src = PLACEHOLDER_SRC;
                this.classList.add("img-placeholder");
            }
        },
        { once: true }
    );
});

// ================= SEARCH & FILTER (reusable) =================
// Powers both the Popular Cars category filter and the Automotive
// Showcase gallery filter using the same button-group markup pattern.
function initFilterGroup(groupSelector, itemSelector) {
    const group = document.querySelector(groupSelector);
    if (!group) return;

    const buttons = group.querySelectorAll("[data-filter]");
    const items = document.querySelectorAll(itemSelector);

    group.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-filter]");
        if (!btn) return;

        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filterValue = btn.getAttribute("data-filter");

        items.forEach((item) => {
            const matches = filterValue === "all" || item.getAttribute("data-category") === filterValue;
            item.classList.toggle("hidden-item", !matches);
        });
    });
}
initFilterGroup("#carFilterGroup", ".car-filter-item");
initFilterGroup("#galleryFilterGroup", ".gallery-filter-item");

// ================= ENGINE QUIZ (Page 3) =================
const quizForm = document.getElementById("engineQuiz");
if (quizForm) {
    const quizFeedback = document.getElementById("quizFeedback");
    quizForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const selected = quizForm.querySelector('input[name="quizAnswer"]:checked');

        if (!selected) {
            quizFeedback.className = "alert-shifted mt-3";
            quizFeedback.textContent = "Please select an answer before submitting.";
            quizFeedback.style.display = "block";
            return;
        }

        if (selected.value === "subaru") {
            quizFeedback.className = "alert-shifted mt-3";
            quizFeedback.style.borderLeftColor = "#2e7d32";
            quizFeedback.textContent = "Correct! Subaru has been producing Boxer engines for decades.";
        } else {
            quizFeedback.className = "alert-shifted mt-3";
            quizFeedback.style.borderLeftColor = "";
            quizFeedback.textContent = "Not quite — Subaru is the manufacturer most associated with Boxer engines, thanks to models like the WRX and BRZ.";
        }
        quizFeedback.style.display = "block";
    });
}

// ================= HYBRID VS ELECTRIC — DRIVING SCENARIO TOOL (Page 4) =================
const scenarioForm = document.getElementById("scenarioForm");
if (scenarioForm) {
    scenarioForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const distance = scenarioForm.distance.value;
        const charging = scenarioForm.charging.value;
        const driving = scenarioForm.drivingType.value;

        let recommendation = "Hybrid";
        let reason = "A hybrid suits mixed driving without needing to rely on charging infrastructure.";

        if (charging === "yes" && (distance === "short" || distance === "medium")) {
            recommendation = "Electric";
            reason = "With home charging available and a manageable daily distance, an EV keeps running costs low with zero tailpipe emissions.";
        } else if (charging === "yes" && driving === "highway") {
            recommendation = "Electric";
            reason = "Home charging offsets the need for frequent public stops, even with longer highway trips.";
        } else if (charging === "no" && distance === "long") {
            recommendation = "Hybrid";
            reason = "Without home charging, a hybrid avoids range anxiety on long daily distances while still improving fuel economy.";
        } else if (charging === "no") {
            recommendation = "Hybrid";
            reason = "Without regular access to charging, a hybrid offers efficiency gains without changing your refuelling routine.";
        }

        const resultCard = document.getElementById("scenarioResult");
        resultCard.querySelector(".result-type").textContent = recommendation;
        resultCard.querySelector(".result-reason").textContent = reason;
        resultCard.classList.add("show");
        resultCard.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}

// ================= CAR BUYING GUIDE — RECOMMENDATION ENGINE (Page 8) =================
const buyingForm = document.getElementById("buyingForm");
if (buyingForm) {
    buyingForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // Basic client-side validation — every field is required
        if (!buyingForm.checkValidity()) {
            event.stopPropagation();
            buyingForm.classList.add("was-validated");
            const feedback = document.getElementById("buyingFormFeedback");
            feedback.style.display = "block";
            feedback.textContent = "Please complete every question so we can recommend a vehicle type.";
            return;
        }

        const priority = buyingForm.priority.value;
        const charging = buyingForm.querySelector('input[name="charging"]:checked').value;
        const driving = buyingForm.querySelector('input[name="driving"]:checked').value;

        let type = "Hybrid";
        let models = ["Toyota Corolla Hybrid", "Honda Civic e:HEV", "Toyota Prius"];
        let why = "You mainly drive in the city, have no home charger, and prioritise fuel economy.";

        if (charging === "yes" && (priority === "environment" || priority === "running-cost")) {
            type = "Electric";
            models = ["BYD Atto 3", "Hyundai IONIQ 5", "Tesla Model 3"];
            why = "With home charging available and a focus on running costs or emissions, an electric vehicle is the strongest match.";
        } else if (priority === "performance") {
            type = "Petrol";
            models = ["Honda Civic Type R", "Toyota GR Yaris", "Ford Mustang GT"];
            why = "You prioritise performance — a petrol engine still offers the most responsive, characterful driving experience.";
        } else if (priority === "family" && driving === "long-distance") {
            type = "Hybrid";
            models = ["Toyota Corolla Cross Hybrid", "Honda CR-V e:HEV", "Toyota Camry Hybrid"];
            why = "For family use over longer distances, a hybrid balances space, comfort and efficiency without needing to charge.";
        } else if (charging === "no" && driving === "city") {
            type = "Hybrid";
            models = ["Toyota Corolla Hybrid", "Honda Civic e:HEV", "Toyota Prius"];
            why = "You mainly drive in the city, have no home charger, and prioritise fuel economy.";
        }

        document.getElementById("resultType").textContent = type;
        document.getElementById("resultWhy").textContent = why;
        const modelList = document.getElementById("resultModels");
        modelList.innerHTML = "";
        models.forEach((model) => {
            const li = document.createElement("li");
            li.textContent = model;
            modelList.appendChild(li);
        });

        const resultCard = document.getElementById("buyingResult");
        resultCard.classList.add("show");
        resultCard.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}

// ================= MAINTENANCE CHECKLIST & PROGRESS BAR (Page 9) =================
const maintenanceChecklist = document.getElementById("maintenanceChecklist");
if (maintenanceChecklist) {
    const checkboxes = maintenanceChecklist.querySelectorAll('input[type="checkbox"]');
    const progressBar = document.getElementById("maintenanceProgressBar");
    const progressLabel = document.getElementById("maintenanceProgressLabel");
    const completionMessage = document.getElementById("maintenanceCompletionMessage");

    function updateProgress() {
        const total = checkboxes.length;
        const completed = Array.from(checkboxes).filter((cb) => cb.checked).length;
        const percent = Math.round((completed / total) * 100);

        progressBar.style.width = percent + "%";
        progressBar.setAttribute("aria-valuenow", percent);
        progressLabel.textContent = percent + "%";

        completionMessage.style.display = percent === 100 ? "block" : "none";
    }

    checkboxes.forEach((cb) => {
        cb.addEventListener("change", () => {
            cb.closest(".checklist-item").classList.toggle("checked-item", cb.checked);
            updateProgress();
        });
    });

    updateProgress();
}

// ================= ENGINE COMPONENT MODAL POPULATION (Page 3) =================
// A single modal is reused; JS fills its content based on which
// component icon the user selected, avoiding one modal per component.
const componentData = {
    pistons: {
        title: "Pistons",
        purpose: "Move up and down inside the cylinder, converting the pressure from combustion into mechanical motion.",
        location: "Housed inside the engine cylinders.",
        fact: "A typical four-cylinder engine's pistons can move up and down over 100 times per second at high RPM."
    },
    crankshaft: {
        title: "Crankshaft",
        purpose: "Converts the up-and-down motion of the pistons into rotational motion that ultimately turns the wheels.",
        location: "Located at the bottom of the engine block.",
        fact: "The crankshaft's rotation speed is what your rev counter (tachometer) actually displays."
    },
    camshaft: {
        title: "Camshaft",
        purpose: "Opens and closes the intake and exhaust valves at precisely the right moment in the engine cycle.",
        location: "Positioned above or beside the cylinder head, driven by a timing belt or chain.",
        fact: "Some performance engines use variable camshaft timing to improve power across different RPM ranges."
    },
    "connecting-rod": {
        title: "Connecting Rod",
        purpose: "Links each piston to the crankshaft, transferring the force of combustion into rotational energy.",
        location: "Connects the piston to the crankshaft inside the engine block.",
        fact: "Connecting rods must withstand thousands of high-force cycles per minute without failing."
    },
    "spark-plug": {
        title: "Spark Plug",
        purpose: "Ignites the compressed air-fuel mixture inside the cylinder to begin the power stroke.",
        location: "Threaded into the top of each cylinder.",
        fact: "A spark plug fires thousands of times per minute and can reach temperatures of over 400°C."
    },
    valves: {
        title: "Valves",
        purpose: "Control the flow of air and fuel into the cylinder and the release of exhaust gases out of it.",
        location: "Located in the cylinder head, operated by the camshaft.",
        fact: "Most modern engines use four valves per cylinder — two intake, two exhaust — for better airflow."
    }
};

const componentModalEl = document.getElementById("componentModal");
if (componentModalEl) {
    document.querySelectorAll("[data-component]").forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const key = trigger.getAttribute("data-component");
            const data = componentData[key];
            if (!data) return;
            document.getElementById("componentModalTitle").textContent = data.title;
            document.getElementById("componentModalPurpose").textContent = data.purpose;
            document.getElementById("componentModalLocation").textContent = data.location;
            document.getElementById("componentModalFact").textContent = data.fact;
        });
    });
}
