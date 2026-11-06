/* =========================================================
   Mahesh Kunapareddy — Portfolio interactions
   Vanilla JS · no dependencies
   ========================================================= */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* -------------------------------------------------------
     1. Preloader
  ------------------------------------------------------- */
  const preloader = $("#preloader");
  const preloaderBar = $("#preloaderBar");
  const preloaderCount = $("#preloaderCount");

  function finishLoading() {
    if (!preloader) return;
    preloader.classList.add("is-done");
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-loaded");

    window.setTimeout(() => {
      preloader.remove();
    }, 1100);

    // Hero stat count-up after the entrance
    window.setTimeout(runCounters, 650);
  }

  if (preloader) {
    if (reducedMotion) {
      preloaderBar.style.width = "100%";
      preloaderCount.textContent = "100";
      window.setTimeout(finishLoading, 200);
    } else {
      const start = performance.now();
      const duration = 1450;

      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = Math.round(eased * 100);
        preloaderBar.style.width = value + "%";
        preloaderCount.textContent = value;

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          window.setTimeout(finishLoading, 260);
        }
      };

      requestAnimationFrame(tick);
    }
  } else {
    document.body.classList.add("is-loaded");
    runCounters();
  }

  /* -------------------------------------------------------
     2. Custom cursor
  ------------------------------------------------------- */
  if (finePointer && !reducedMotion) {
    const dot = $("#cursorDot");
    const ring = $("#cursorRing");
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let visible = false;

    document.body.classList.add("has-cursor");

    window.addEventListener(
      "mousemove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!visible) {
          visible = true;
          ringX = mouseX;
          ringY = mouseY;
        }

        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      },
      { passive: true }
    );

    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    document.addEventListener(
      "mouseover",
      (e) => {
        const target = e.target.closest("a, button, .tilt, .chip, .contact-link, .track");
        document.body.classList.toggle("cursor-hover", Boolean(target));
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      document.body.classList.remove("has-cursor");
    });

    document.addEventListener("mouseenter", () => {
      document.body.classList.add("has-cursor");
    });
  }

  /* -------------------------------------------------------
     3. Background constellation canvas
  ------------------------------------------------------- */
  const canvas = $("#bgCanvas");

  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let rafId = null;

    const PALETTE = [
      { r: 167, g: 139, b: 250 },
      { r: 103, g: 232, b: 249 },
      { r: 244, g: 114, b: 182 },
    ];

    function buildParticles() {
      const count = Math.min(64, Math.max(14, Math.floor((width * height) / 26000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.4 + 0.4,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      }));
    }

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.55)`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 145) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - dist / 145) * 0.13})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    resizeCanvas();
    draw();

    let resizeTimer;
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(resizeCanvas, 180);
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        cancelAnimationFrame(rafId);
        draw();
      }
    });
  }

  /* -------------------------------------------------------
     4. Scroll progress + nav state
  ------------------------------------------------------- */
  const nav = $("#nav");
  const scrollBar = $("#scrollBar");
  let scrollTicking = false;

  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;

    if (scrollBar) scrollBar.style.width = (progress * 100).toFixed(2) + "%";
    if (nav) nav.classList.toggle("is-scrolled", scrollTop > 24);

    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  onScroll();

  /* -------------------------------------------------------
     5. Active nav link
  ------------------------------------------------------- */
  const navLinks = $$(".nav-link");
  const sections = $$("main section[id]");

  if ("IntersectionObserver" in window && sections.length) {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );

    sections.forEach((section) => activeObserver.observe(section));
  }

  /* -------------------------------------------------------
     6. Reveal on scroll
  ------------------------------------------------------- */
  const revealEls = $$("[data-reveal]");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* -------------------------------------------------------
     7. Counters
  ------------------------------------------------------- */
  let countersRan = false;

  function runCounters() {
    if (countersRan) return;
    countersRan = true;

    const counters = $$(".stat-num[data-count]");

    counters.forEach((el) => {
      const target = Number(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || "";

      if (reducedMotion) {
        el.textContent = target + suffix;
        return;
      }

      const duration = 1400;
      const start = performance.now();

      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });
  }

  /* -------------------------------------------------------
     8. Typewriter
  ------------------------------------------------------- */
  const typewriter = $("#typewriter");
  const phrases = ["Python", "Java", "the Web", "Flutter", "Dart"];

  if (typewriter) {
    if (reducedMotion) {
      typewriter.textContent = phrases[0];
    } else {
      let phraseIndex = 0;
      let charIndex = phrases[0].length;
      let deleting = false;

      const type = () => {
        const phrase = phrases[phraseIndex];

        if (!deleting) {
          charIndex++;
          typewriter.textContent = phrase.slice(0, charIndex);

          if (charIndex >= phrase.length) {
            deleting = true;
            window.setTimeout(type, 1700);
            return;
          }
          window.setTimeout(type, 80);
        } else {
          charIndex--;
          typewriter.textContent = phrase.slice(0, Math.max(0, charIndex));

          if (charIndex <= 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            window.setTimeout(type, 260);
            return;
          }
          window.setTimeout(type, 42);
        }
      };

      // Wait for the preloader, then start from the first phrase
      window.setTimeout(() => {
        charIndex = 0;
        typewriter.textContent = "";
        type();
      }, 2300);
    }
  }

  /* -------------------------------------------------------
     9. Tilt + spotlight cards
  ------------------------------------------------------- */
  const tiltCards = $$("[data-tilt]");

  if (finePointer && !reducedMotion) {
    tiltCards.forEach((card) => {
      const maxTilt = 7;

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;

        const rotateY = (px - 0.5) * maxTilt * 2;
        const rotateX = -(py - 0.5) * maxTilt * 2;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(
          2
        )}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  // Spotlight position for all glowing cards
  $$(".glow-card").forEach((card) => {
    card.addEventListener(
      "mousemove",
      (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%");
      },
      { passive: true }
    );
  });

  /* -------------------------------------------------------
     10. Magnetic buttons
  ------------------------------------------------------- */
  if (finePointer && !reducedMotion) {
    $$("[data-magnetic]").forEach((el) => {
      const strength = 0.28;
      const max = 9;

      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * strength;
        const y = (e.clientY - rect.top - rect.height / 2) * strength;
        const clampX = Math.max(-max, Math.min(max, x));
        const clampY = Math.max(-max, Math.min(max, y));
        el.style.transform = `translate(${clampX.toFixed(2)}px, ${clampY.toFixed(2)}px)`;
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* -------------------------------------------------------
     11. Marquee duplication
  ------------------------------------------------------- */
  const marqueeTrack = $("#marqueeTrack");
  if (marqueeTrack) {
    const group = marqueeTrack.querySelector(".marquee-group");
    if (group) {
      const clone = group.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      marqueeTrack.appendChild(clone);
    }
  }

  /* -------------------------------------------------------
     12. Mobile menu
  ------------------------------------------------------- */
  const menuBtn = $("#menuBtn");
  const primaryNav = $("#navLinks");

  function closeMenu() {
    document.body.classList.remove("menu-open");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open menu");
    }
  }

  if (menuBtn && primaryNav) {
    menuBtn.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
      menuBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    primaryNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* -------------------------------------------------------
     13. Copy email
  ------------------------------------------------------- */
  const copyBtn = $("#copyEmail");

  if (copyBtn) {
    const originalText = copyBtn.querySelector(".copy-text");
    const icon = copyBtn.querySelector(".copy-icon");
    let resetTimer = null;

    const flash = () => {
      copyBtn.classList.add("is-copied");
      if (icon) icon.textContent = "✓";
      if (originalText) originalText.textContent = "Copied";

      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        copyBtn.classList.remove("is-copied");
        if (icon) icon.textContent = "⧉";
        if (originalText) originalText.textContent = "Copy";
      }, 1800);
    };

    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email || "";
      try {
        await navigator.clipboard.writeText(email);
        flash();
      } catch {
        // Fallback for older browsers / non-secure contexts
        const textarea = document.createElement("textarea");
        textarea.value = email;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          flash();
        } catch {
          /* no-op */
        }
        document.body.removeChild(textarea);
      }
    });
  }

  /* -------------------------------------------------------
     14. Footer year
  ------------------------------------------------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* -------------------------------------------------------
     15. Hero visual pointer parallax
  ------------------------------------------------------- */
  if (finePointer && !reducedMotion) {
    const hero = $(".hero");
    const stage = $(".orbit-stage");

    if (hero && stage) {
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;

      hero.addEventListener(
        "mousemove",
        (e) => {
          const rect = hero.getBoundingClientRect();
          targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
          targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
        },
        { passive: true }
      );

      const animateStage = () => {
        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;
        stage.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(
          2
        )}px, 0)`;
        requestAnimationFrame(animateStage);
      };
      requestAnimationFrame(animateStage);
    }
  }
})();
