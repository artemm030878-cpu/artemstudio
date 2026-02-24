const burger = document.querySelector(".burger");
const mobileMenu = document.querySelector("#mobileMenu");

// Disable heavy effects on mobile
if (window.innerWidth <= 768) {
  document.documentElement.classList.add("mobile-no-anim");
}

function closeMenu() {
  burger.classList.remove("is-open");
  mobileMenu.classList.remove("is-open");
  document.body.style.overflow = "";
}

function toggleMenu() {
  const isOpen = mobileMenu.classList.toggle("is-open");
  burger.classList.toggle("is-open", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
}

burger?.addEventListener("click", toggleMenu);

// Закрывать меню при клике на пункт
mobileMenu?.addEventListener("click", (e) => {
  if (e.target.tagName === "A") closeMenu();
});

// Закрывать по Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});


// ===== Parallax planets in Services =====
const services = document.querySelector("#services");
const planets = services ? services.querySelectorAll("[data-parallax]") : [];

if (services && planets.length) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion) {
    let raf = null;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    const onMove = (e) => {
      const r = services.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;   // 0..1
      const y = (e.clientY - r.top) / r.height;   // 0..1

      targetX = (x - 0.5) * 2; // -1..1
      targetY = (y - 0.5) * 2; // -1..1

      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      raf = null;

      // мягкая инерция
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      planets.forEach((p) => {
        const k = Number(p.dataset.parallax || 20);
        const tx = currentX * k;
        const ty = currentY * k;
        p.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });

      // продолжать сглаживать, пока не догнали
      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        raf = requestAnimationFrame(tick);
      }
    };

    services.addEventListener("mousemove", onMove);
    services.addEventListener("mouseleave", () => {
      targetX = 0; targetY = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }
}


// ===== Portfolio tabs + modal =====
const tabs = document.querySelectorAll(".tab");
const grids = document.querySelectorAll(".portfolioGrid");

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.tab;

    tabs.forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", b === btn ? "true" : "false");
    });

    grids.forEach((g) => {
      g.classList.toggle("is-hidden", g.dataset.content !== key);
    });
  });
});

// Modal
const modal = document.querySelector("#workModal");
const modalTitle = document.querySelector("#modalTitle");
const modalDesc = document.querySelector("#modalDesc");
const modalPreview = document.querySelector("#modalPreview");

function openModal({ title, desc, num }) {
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  modalTitle.textContent = title || "Работа";
  modalDesc.textContent = desc || "";
  modalPreview.textContent = num || "PREVIEW";
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll(".work").forEach((w) => {
  w.addEventListener("click", () => {
    const title = w.dataset.title;
    const desc = w.dataset.desc;
    const num = w.querySelector(".work__thumb")?.textContent?.trim();
    openModal({ title, desc, num });
  });
});

modal?.addEventListener("click", (e) => {
  if (e.target?.dataset?.close === "true") closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
// ===== Reveal animations (Block 4) =====
const revealTargets = document.querySelectorAll("[data-animate], [data-animate-item]");

if (revealTargets.length) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        el.classList.add("is-inview");

        // stagger for items inside category
        if (el.hasAttribute("data-animate")) {
          const items = el.querySelectorAll("[data-animate-item]");
          items.forEach((item, i) => {
            item.style.transitionDelay = `${0.08 * i}s`;
            item.classList.add("is-inview");
          });
        }

        io.unobserve(el);
      });
    }, { threshold: 0.18 });

    document.querySelectorAll("[data-animate]").forEach(el => io.observe(el));
  } else {
    // reduced motion: show immediately
    revealTargets.forEach(el => el.classList.add("is-inview"));
  }
}

// ================= CURSOR V3 (RING ONLY) =================
(() => {
  const c = document.querySelector(".cursorV3");

  const canUse =
    window.matchMedia("(hover:hover)").matches &&
    window.matchMedia("(pointer:fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!c || !canUse) return;

  let active = false;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let cx = x, cy = y;

  const enable = () => {
    if (active) return;
    active = true;

    document.documentElement.classList.add("cursor-v3-on");

    c.style.opacity = "1";
    c.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;

    // чтобы не было “догонялки” при первом движении
    cx = x; cy = y;
  };

  window.addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    enable();
  });

  const loop = () => {
    if (active) {
      // супер мягко, но без лагов
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      c.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    }
    requestAnimationFrame(loop);
  };
  loop();

  // hover targets
  const hoverables = "a, button, .btn, .workItem, .tab, input, textarea, select";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverables)) c.classList.add("is-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverables)) c.classList.remove("is-hover");
  });

  // click
  document.addEventListener("mousedown", () => c.classList.add("is-down"));
  document.addEventListener("mouseup", () => c.classList.remove("is-down"));

  // when leaving window
  document.addEventListener("mouseleave", () => {
    c.style.opacity = "0";
    document.documentElement.classList.remove("cursor-v3-on");
    active = false;
  });
})();

// footer year
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// scroll to top
const up = document.querySelector(".footerMinimal__up");
if (up) {
  up.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

