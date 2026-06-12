// =============================================================
//  app.js — Flight Booking Landing Page
//  Handles: branding injection, wilaya autocomplete,
//           form validation, Supabase submission
// =============================================================

/* ── Algerian Wilayas (58) ─────────────────────────────────── */
const WILAYAS = [
  "01 - Adrar","02 - Chlef","03 - Laghouat","04 - Oum El Bouaghi",
  "05 - Batna","06 - Béjaïa","07 - Biskra","08 - Béchar",
  "09 - Blida","10 - Bouira","11 - Tamanrasset","12 - Tébessa",
  "13 - Tlemcen","14 - Tiaret","15 - Tizi Ouzou","16 - Alger",
  "17 - Djelfa","18 - Jijel","19 - Sétif","20 - Saïda",
  "21 - Skikda","22 - Sidi Bel Abbès","23 - Annaba","24 - Guelma",
  "25 - Constantine","26 - Médéa","27 - Mostaganem","28 - M'Sila",
  "29 - Mascara","30 - Ouargla","31 - Oran","32 - El Bayadh",
  "33 - Illizi","34 - Bordj Bou Arréridj","35 - Boumerdès",
  "36 - El Tarf","37 - Tindouf","38 - Tissemsilt","39 - El Oued",
  "40 - Khenchela","41 - Souk Ahras","42 - Tipaza","43 - Mila",
  "44 - Aïn Defla","45 - Naâma","46 - Aïn Témouchent","47 - Ghardaïa",
  "48 - Relizane","49 - El M'Ghair","50 - El Meniaa","51 - Ouled Djellal",
  "52 - Bordj Badji Mokhtar","53 - Béni Abbès","54 - Timimoun",
  "55 - Touggourt","56 - Djanet","57 - In Salah","58 - In Guezzam",
];

/* ── Supabase client (vanilla, no SDK needed) ──────────────── */
const supabase = {
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "apikey":        SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer":        "return=minimal",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return true;
  },
};

/* ── Branding injection ────────────────────────────────────── */
function applyBranding() {
  document.querySelectorAll("[data-brand-name]").forEach(el => {
    el.textContent = BRAND.companyName;
  });
  document.querySelectorAll("[data-brand-tagline]").forEach(el => {
    el.textContent = BRAND.tagline;
  });
  document.querySelectorAll("[data-brand-logo]").forEach(el => {
    if (BRAND.logoImage) {
      el.innerHTML = `<img src="${BRAND.logoImage}" alt="${BRAND.companyName} logo" class="logo-img" onerror="this.parentElement.innerHTML='<span class=logo-text>${BRAND.logoText}</span>'">`;
    } else {
      el.innerHTML = `<span class="logo-text">${BRAND.logoText}</span>`;
    }
  });
  document.title = `${BRAND.companyName} — Book Your Flight`;
}

/* ── Wilaya autocomplete ───────────────────────────────────── */
function initWilayaAutocomplete() {
  const input    = document.getElementById("wilaya");
  const dropdown = document.getElementById("wilaya-dropdown");
  let activeIdx  = -1;
  let selected   = false;

  function renderList(items) {
    dropdown.innerHTML = "";
    activeIdx = -1;
    if (!items.length) { dropdown.classList.remove("open"); return; }
    items.forEach((w, i) => {
      const li = document.createElement("li");
      li.textContent = w;
      li.dataset.value = w;
      li.addEventListener("mousedown", e => {
        e.preventDefault();
        selectWilaya(w);
      });
      dropdown.appendChild(li);
    });
    dropdown.classList.add("open");
  }

  function selectWilaya(val) {
    input.value  = val;
    selected     = true;
    input.dataset.valid = "true";
    dropdown.classList.remove("open");
    input.setCustomValidity("");
  }

  function updateActive(dir) {
    const items = dropdown.querySelectorAll("li");
    if (!items.length) return;
    items[activeIdx]?.classList.remove("active");
    activeIdx = (activeIdx + dir + items.length) % items.length;
    items[activeIdx].classList.add("active");
    items[activeIdx].scrollIntoView({ block: "nearest" });
  }

  input.addEventListener("input", () => {
    selected = false;
    input.dataset.valid = "";
    const q = input.value.trim().toLowerCase();
    if (!q) { dropdown.classList.remove("open"); return; }
    const filtered = WILAYAS.filter(w => w.toLowerCase().includes(q));
    renderList(filtered);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown")  { e.preventDefault(); updateActive(1); }
    if (e.key === "ArrowUp")    { e.preventDefault(); updateActive(-1); }
    if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      const li = dropdown.querySelectorAll("li")[activeIdx];
      if (li) selectWilaya(li.dataset.value);
    }
    if (e.key === "Escape")     dropdown.classList.remove("open");
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      dropdown.classList.remove("open");
      if (!selected) {
        const exact = WILAYAS.find(w => w.toLowerCase() === input.value.trim().toLowerCase());
        if (exact) selectWilaya(exact);
        else if (input.value.trim()) input.setCustomValidity("Please select a valid wilaya.");
      }
    }, 150);
  });

  input.addEventListener("focus", () => {
    if (input.value.trim() && !selected) {
      const q = input.value.trim().toLowerCase();
      renderList(WILAYAS.filter(w => w.toLowerCase().includes(q)));
    }
  });
}

/* ── Form validation helpers ───────────────────────────────── */
function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validatePhone(v) { return /^[\+]?[\d\s\-\(\)]{8,15}$/.test(v.trim()); }

function showFieldError(field, msg) {
  const wrapper = field.closest(".field-wrapper") || field.parentElement;
  wrapper.classList.add("error");
  wrapper.classList.remove("success");
  let hint = wrapper.querySelector(".field-hint");
  if (!hint) { hint = document.createElement("span"); hint.className = "field-hint"; wrapper.appendChild(hint); }
  hint.textContent = msg;
}

function showFieldSuccess(field) {
  const wrapper = field.closest(".field-wrapper") || field.parentElement;
  wrapper.classList.remove("error");
  wrapper.classList.add("success");
  const hint = wrapper.querySelector(".field-hint");
  if (hint) hint.textContent = "";
}

function clearFieldState(field) {
  const wrapper = field.closest(".field-wrapper") || field.parentElement;
  wrapper.classList.remove("error","success");
}

/* ── Real-time per-field validation ────────────────────────── */
function attachLiveValidation() {
  const fields = document.querySelectorAll("#booking-form input");
  fields.forEach(f => {
    f.addEventListener("blur", () => validateField(f));
    f.addEventListener("input", () => { if (f.closest(".field-wrapper")?.classList.contains("error")) validateField(f); });
  });
}

function validateField(f) {
  const v = f.value.trim();
  if (!v && f.required) { showFieldError(f, `${f.dataset.label || "This field"} is required.`); return false; }
  if (f.type === "email" && v && !validateEmail(v)) { showFieldError(f, "Enter a valid email address."); return false; }
  if (f.type === "tel"   && v && !validatePhone(v)) { showFieldError(f, "Enter a valid phone number."); return false; }
  if (f.id === "wilaya"  && v && f.dataset.valid !== "true") { showFieldError(f, "Select a wilaya from the list."); return false; }
  showFieldSuccess(f);
  return true;
}

/* ── Form submission ───────────────────────────────────────── */
async function handleSubmit(e) {
  e.preventDefault();
  const form   = document.getElementById("booking-form");
  const fields = [...form.querySelectorAll("input[required]")];
  const valid  = fields.map(f => validateField(f)).every(Boolean);
  if (!valid) { shakeForm(); return; }

  const btn     = form.querySelector(".submit-btn");
  const success = document.getElementById("form-success");
  const errEl   = document.getElementById("form-error");

  setLoading(btn, true);
  errEl.hidden = true;

  const data = {
    first_name:    form.first_name.value.trim(),
    family_name:   form.family_name.value.trim(),
    date_of_birth: form.date_of_birth.value,
    email:         form.email.value.trim(),
    phone:         form.phone.value.trim(),
    wilaya:        form.wilaya.value.trim(),
  };

  try {
    await supabase.insert("booked", data);
    success.hidden = false;
    form.reset();
    fields.forEach(f => clearFieldState(f));
    document.getElementById("wilaya").dataset.valid = "";
    success.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => { success.hidden = true; }, 6000);
  } catch (err) {
    errEl.textContent = `Submission failed: ${err.message}. Please try again.`;
    errEl.hidden = false;
  } finally {
    setLoading(btn, false);
  }
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.querySelector(".btn-text").style.display    = loading ? "none" : "";
  btn.querySelector(".btn-spinner").style.display = loading ? "flex" : "none";
}

function shakeForm() {
  const card = document.querySelector(".booking-card");
  card.classList.remove("shake");
  void card.offsetWidth;
  card.classList.add("shake");
}

/* ── Sticky header shrink ──────────────────────────────────── */
function initStickyHeader() {
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });
}

/* ── Mobile nav toggle ─────────────────────────────────────── */
function initMobileNav() {
  const toggle  = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  toggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  navMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => navMenu.classList.remove("open"));
  });
}

/* ── FAQ accordion ─────────────────────────────────────────── */
function initFAQ() {
  document.querySelectorAll(".faq-item").forEach(item => {
    const btn    = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    btn.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      answer.style.maxHeight = open ? answer.scrollHeight + "px" : "0";
    });
  });
}

/* ── Scroll-reveal animation ───────────────────────────────── */
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
}

/* ── Smooth scroll for nav links ───────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  });
}

/* ── Boot ──────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  applyBranding();
  initWilayaAutocomplete();
  attachLiveValidation();
  initStickyHeader();
  initMobileNav();
  initFAQ();
  initScrollReveal();
  initSmoothScroll();
  document.getElementById("booking-form").addEventListener("submit", handleSubmit);
});
