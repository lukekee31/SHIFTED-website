// ================= GLOBAL VARIABLES =================
const root = document.documentElement;
const themeToggleButtons = document.querySelectorAll(".theme-toggle-btn");
const backToTopBtn = document.querySelector(".back-to-top");

// ================= THEME TOGGLE =================
// Applies the saved theme (or the system preference) as soon as the page loads.
function applyTheme(theme) {
    if (theme === "dark") {
        root.setAttribute("data-theme", "dark");
    } else {
        root.removeAttribute("data-theme");
    }
    themeToggleButtons.forEach((btn) => {
        const icon = btn.querySelector("i");
        if (!icon) return;
        icon.className = theme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    });
}

function initTheme() {
    // Save the user's selected theme so it persists across page refreshes
    const savedTheme = localStorage.getItem("shifted-theme");
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
    }
}

function toggleTheme() {
    const isDark = root.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";
    applyTheme(newTheme);
    localStorage.setItem("shifted-theme", newTheme);
}

themeToggleButtons.forEach((btn) => btn.addEventListener("click", toggleTheme));
initTheme();

// ================= ACTIVE NAVIGATION =================
// Detects the current page URL and highlights the matching nav link.
function highlightActiveNav() {
    const navLinks = document.querySelectorAll(".navbar-shifted .nav-link[data-page]");
    const currentPage = document.body.getAttribute("data-page");
    navLinks.forEach((link) => {
        if (link.getAttribute("data-page") === currentPage) {
            link.classList.add("active");
        }
    });
}
highlightActiveNav();

// =================== BONUS POINTS THING =========================
// Replaces card information in page7.html to data.js
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid || typeof carsData === 'undefined') return;

    // Clear whatever's currently in the grid before rebuilding
    grid.replaceChildren();

    carsData.forEach((car) => {
        // Outer column wrapper
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 reveal';
        col.dataset.galleryCategory = car.category;

        // Card
        const card = document.createElement('div');
        card.className = 'shifted-card';

        // Image wrapper
        const imgWrap = document.createElement('div');
        imgWrap.className = 'card-img-wrap';
        const img = document.createElement('img');
        img.src = car.cardImg;
        img.alt = car.alt;
        imgWrap.appendChild(img);

        // Card body
        const body = document.createElement('div');
        body.className = 'card-body';

        const badge = document.createElement('span');
        badge.className = 'badge-blue mb-2 d-inline-block';
        badge.textContent = car.badgeCato;

        const title = document.createElement('h5');
        title.textContent = car.title;

        const manufacturer = document.createElement('p');
        manufacturer.className = 'small mb-2';
        manufacturer.textContent = `Manufacturer: ${car.manufacturer}`;

        const btn = document.createElement('button');
        btn.className = 'btn btn-shifted-outline btn-shifted-sm';
        btn.setAttribute('data-showcase-trigger', '');
        btn.textContent = 'View Details';

        // Data attributes read by initDetailModal()
        const specEngine = car.engine ? `Engine: ${car.engine}`
                   : car.powertrain ? `Powertrain: ${car.powertrain}`
                   : '';    
        const specCaCo = car.country ? `Country: ${car.country}`
                : car.carCato ? `Category: ${car.carCato}`
                : '';
        const specPower = car.power ? `Power: ${car.power}`
                   : car.drivetrain ? `Drivetrain: ${car.drivetrain}`
                   : car.layout ? `Layout: ${car.layout}`
                   : car.zerotohun ? `0 - 100km/h: ${car.zerotohun}`
                   : car.series ? `Series: ${car.series}`
                   : '';
        btn.dataset.title = car.title;
        btn.dataset.img = car.modalImg;
        btn.dataset.alt = car.alt;
        btn.dataset.spec1 = `Manufacturer: ${car.manufacturer}`;
        btn.dataset.spec2 = specCaCo;
        btn.dataset.spec3 = specEngine;
        btn.dataset.spec4 = specPower;
        btn.dataset.fact = car.fact;
        btn.dataset.link = car.link;

        body.append(badge, title, manufacturer, btn);
        card.append(imgWrap, body);
        col.appendChild(card);
        grid.appendChild(col);
    });
}
renderGallery();

// ================= SCROLL REVEAL =================
// Elements fade in and move up slightly the first time they enter the viewport.
function initScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal");
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    obs.unobserve(entry.target); // Trigger only once
                }
            });
        },
        { threshold: 0.15 }
    );

    revealElements.forEach((el) => observer.observe(el));
}
initScrollReveal();

// ================= ENGINE POWER: QUICK QUIZ =================
// Checks the selected answer and shows contextual feedback without reloading.
function initEngineQuiz() {
    const quizForm = document.getElementById("engine-quiz-form");
    if (!quizForm) return;
    const feedback = document.getElementById("quiz-feedback");

    quizForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const selected = quizForm.querySelector('input[name="quiz-answer"]:checked');

        if (!selected) {
            feedback.className = "alert alert-warning mt-3";
            feedback.textContent = "Please select an answer before submitting.";
            feedback.classList.remove("d-none");
            return;
        }

        if (selected.value === "subaru") {
            feedback.className = "alert alert-success mt-3";
            feedback.textContent = "Correct! Subaru has been producing Boxer engines for decades, prized for their low centre of gravity.";
        } else {
            feedback.className = "alert alert-danger mt-3";
            feedback.textContent = "Not quite. Subaru is the manufacturer most famous for its horizontally-opposed Boxer engines.";
        }
        feedback.classList.remove("d-none");
    });
}
initEngineQuiz();

// ================= ENGINE POWER: COMPONENT MODAL =================
// Populates a shared modal with details for whichever engine component icon was clicked.
function initEngineComponentModal() {
    const buttons = document.querySelectorAll("[data-component]");
    const modalEl = document.getElementById("componentModal");
    if (!buttons.length || !modalEl) return;

    const componentData = {
        pistons: {
            title: "Pistons",
            purpose: "Move up and down inside the cylinder to convert burning fuel into mechanical force.",
            location: "Housed inside the engine block, one per cylinder.",
            fact: "A modern piston can travel up and down thousands of times per minute at high revs."
        },
        crankshaft: {
            title: "Crankshaft",
            purpose: "Converts the up-and-down motion of the pistons into rotational motion.",
            location: "Located at the bottom of the engine block.",
            fact: "The crankshaft's rotation is ultimately what turns the car's wheels."
        },
        camshaft: {
            title: "Camshaft",
            purpose: "Opens and closes the intake and exhaust valves at precisely the right moment.",
            location: "Positioned above or beside the cylinder head, driven by a belt or chain.",
            fact: "Some performance engines use variable camshaft timing to improve power at different speeds."
        },
        rod: {
            title: "Connecting Rod",
            purpose: "Links each piston to the crankshaft, transferring the piston's force.",
            location: "Connects the piston pin to the crankshaft journal.",
            fact: "Connecting rods must withstand enormous forces thousands of times per minute."
        },
        sparkplug: {
            title: "Spark Plug",
            purpose: "Ignites the compressed air-fuel mixture to start the power stroke.",
            location: "Threaded into the top of each cylinder.",
            fact: "A spark plug fires thousands of times per minute at higher engine speeds."
        },
        valves: {
            title: "Valves",
            purpose: "Control the flow of air and fuel into, and exhaust gases out of, the cylinder.",
            location: "Located in the cylinder head, opened and closed by the camshaft.",
            fact: "Most modern engines use four valves per cylinder for better airflow."
        }
    };

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-component");
            const data = componentData[key];
            if (!data) return;
            modalEl.querySelector(".modal-title").textContent = data.title;
            modalEl.querySelector("[data-modal-purpose]").textContent = data.purpose;
            modalEl.querySelector("[data-modal-location]").textContent = data.location;
            modalEl.querySelector("[data-modal-fact]").textContent = data.fact;
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        });
    });
}
initEngineComponentModal();

// ================= HYBRID VS ELECTRIC: DRIVING SCENARIO TOOL =================
// Reads the user's driving habits and instantly recommends Hybrid or Electric.
function initDrivingScenarioTool() {
    const form = document.getElementById("scenario-form");
    if (!form) return;
    const resultBox = document.getElementById("scenario-result");

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const distance = form.querySelector('input[name="distance"]:checked');
        const charging = form.querySelector('input[name="charging"]:checked');
        const roadType = form.querySelector('input[name="roadtype"]:checked');

        if (!distance || !charging || !roadType) {
            resultBox.className = "alert alert-warning mt-4";
            resultBox.textContent = "Please answer all three questions to get a recommendation.";
            resultBox.classList.remove("d-none");
            return;
        }

        // Simple weighted scoring: charging access and short distances favour Electric
        let electricScore = 0;
        if (charging.value === "yes") electricScore += 2;
        if (distance.value === "short") electricScore += 1;
        if (roadType.value === "city") electricScore += 1;
        if (distance.value === "long") electricScore -= 1;

        const recommendation = electricScore >= 2 ? "Electric" : "Hybrid";
        const reason =
            recommendation === "Electric"
                ? "You have access to charging and mostly drive shorter, city-based trips, so a Battery Electric Vehicle would suit you well."
                : "Without reliable home charging, or with longer distances, a Hybrid gives you flexibility without needing to plan around charging.";

        resultBox.className = "alert alert-shifted-info mt-4";
        resultBox.innerHTML = `<strong>Recommended: ${recommendation}</strong><br>${reason}`;
        resultBox.classList.remove("d-none");
    });
}
initDrivingScenarioTool();

// ================= POPULAR CARS: CATEGORY FILTER =================
function initCategoryFilter(buttonSelector, cardSelector) {
    const buttons = document.querySelectorAll(buttonSelector);
    const cards = document.querySelectorAll(cardSelector);
    if (!buttons.length || !cards.length) return;

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            // Update active state of buttons
            buttons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            // Read the filter value
            const filter = (btn.getAttribute("data-filter") || "").toLowerCase();

            cards.forEach((card) => {
                // Get catogary for cards (checks data-cars-category OR data-category)
                const category = (card.dataset.galleryCategory || card.dataset.carsCategory || card.dataset.category || "").toLowerCase();
                const show = filter === "all" || filter === category;

                // Show/hide element
                if (show) {
                    card.classList.remove("d-none");
                    card.style.display = "";
                }
                else { card.style.display = "none"; }
                card.style.display = show ? "" : "none";
            });
        });
    });
}
initCategoryFilter("[data-cars-filter]", "[data-cars-category]");
initCategoryFilter("[data-gallery-filter]", "[data-gallery-category]");

// ================= VEHICLE / GALLERY MODALS =================
// Populates a shared modal from data attributes on the clicked card button.
function initDetailModal(triggerSelector, modalId) {
    const triggers = document.querySelectorAll(triggerSelector);
    const modalEl = document.getElementById(modalId);
    if (!triggers.length || !modalEl) return;

    triggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const fields = ["title", "img", "alt", "manufacturer", "spec1", "spec2", "spec3", "spec4", "fact", "link"];
            fields.forEach((field) => {
                const value = trigger.getAttribute(`data-${field}`);
                const target = modalEl.querySelector(`[data-modal-${field}]`);
                if (target) {
                    if (target.tagName === "IMG") {
                        target.src = value || "";
                    } else if (target.tagName === "A") {
                        target.href = value || "#";
                    } else {
                        target.textContent = value || "";
                    }
                }
            });
            // Set alt text on the modal image directly (images don't use data-modal-alt)
            const modalImg = modalEl.querySelector("[data-modal-img]");
            if (modalImg) {
                modalImg.alt = trigger.getAttribute("data-alt") || "";
            }
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        });
    });
}
initDetailModal("[data-vehicle-trigger]", "vehicleModal");
initDetailModal("[data-showcase-trigger]", "showcaseModal");
initDetailModal("[data-motorsport-trigger]", "motorsportModal");

// ================= CAR BUYING GUIDE: RECOMMENDATION ENGINE =================
function initBuyingRecommendation() {
    const form = document.getElementById("recommendation-form");
    if (!form) return;
    const resultCard = document.getElementById("recommendation-result");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const budget = form.budget.value;
        const driving = form.querySelector('input[name="driving"]:checked');
        const passengers = form.passengers.value;
        const charging = form.querySelector('input[name="charging"]:checked');
        const priority = form.priority.value;

        // Basic validation — never allow an incomplete submission
        if (!budget || !driving || !passengers || !charging || !priority) {
            resultCard.className = "alert alert-warning mt-4";
            resultCard.textContent = "Please complete every question so we can generate an accurate recommendation.";
            resultCard.classList.remove("d-none");
            return;
        }

        let type = "Hybrid";
        let models = ["Toyota Corolla Hybrid", "Honda Civic e:HEV", "Toyota Prius"];
        let reason = "A balanced choice for mixed driving with lower running costs and no need to plan around charging.";

        if (charging.value === "yes" && (driving.value === "city" || priority === "environment")) {
            type = "Electric";
            models = ["BYD Atto 3", "Hyundai IONIQ 5", "Tesla Model 3"];
            reason = "You have charging access and prioritise low running costs or environmental impact, making a full Electric Vehicle a strong fit.";
        } else if (priority === "performance" || (driving.value === "long" && budget === "above180")) {
            type = "Petrol";
            models = ["Honda Civic Type R candidates", "Mazda 3", "Toyota GR86"];
            reason = "Long-distance driving and a performance priority both favour a responsive petrol powertrain.";
        }

        document.getElementById("result-type").textContent = type;
        document.getElementById("result-reason").textContent = reason;
        const modelList = document.getElementById("result-models");
        modelList.innerHTML = "";
        models.forEach((m) => {
            const li = document.createElement("li");
            li.textContent = m;
            modelList.appendChild(li);
        });

        resultCard.className = "shifted-card p-4 mt-4";
        resultCard.classList.remove("d-none");
        resultCard.scrollIntoView({ behavior: "smooth", block: "center" });
    });
}
initBuyingRecommendation();

// ================= MAINTENANCE GUIDE: INTERACTIVE CHECKLIST =================
function initMaintenanceChecklist() {
    const checkboxes = document.querySelectorAll(".maintenance-check");
    const progressBar = document.getElementById("maintenance-progress");
    const progressLabel = document.getElementById("maintenance-progress-label");
    const completionMsg = document.getElementById("maintenance-complete-msg");
    if (!checkboxes.length || !progressBar) return;

    function updateProgress() {
        const total = checkboxes.length;
        const checked = document.querySelectorAll(".maintenance-check:checked").length;
        const percent = Math.round((checked / total) * 100);

        progressBar.style.width = percent + "%";
        progressBar.setAttribute("aria-valuenow", percent);
        progressLabel.textContent = `${percent}% Complete (${checked}/${total})`;

        if (completionMsg) {
            completionMsg.classList.toggle("d-none", percent < 100);
        }
    }

    checkboxes.forEach((cb) => cb.addEventListener("change", updateProgress));
    updateProgress();
}
initMaintenanceChecklist();

// ================= REUSABLE UTILITY: CAROUSEL / TAB / ACCORDION SAFETY =================
// Bootstrap's own JS handles Tabs, Accordions, Carousels and Modals — no
// custom re-implementation is needed. This file only enhances behaviour
// where extra interactivity (filtering, validation, dynamic content) is required.
