/* sluk – you deserve it. interaction layer */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- palette / themes ---------------- */
  const THEMES = {
    cream: { bg: "#f4ebe0", fg: "#201512", soft: "rgba(32,21,18,.62)",  line: "rgba(32,21,18,.18)" },
    olive: { bg: "#778443", fg: "#f4ebe0", soft: "rgba(244,235,224,.72)", line: "rgba(244,235,224,.28)" },
    mango: { bg: "#edb067", fg: "#201512", soft: "rgba(32,21,18,.66)",  line: "rgba(32,21,18,.2)" },
    orange:{ bg: "#e08526", fg: "#201512", soft: "rgba(32,21,18,.66)",  line: "rgba(32,21,18,.22)" },
    berry: { bg: "#7e172c", fg: "#f4ebe0", soft: "rgba(244,235,224,.7)", line: "rgba(244,235,224,.26)" },
    taupe: { bg: "#c79a7c", fg: "#201512", soft: "rgba(32,21,18,.64)",  line: "rgba(32,21,18,.2)" },
    pink:  { bg: "#de8f98", fg: "#201512", soft: "rgba(32,21,18,.64)",  line: "rgba(32,21,18,.2)" },
    ink:   { bg: "#201512", fg: "#f4ebe0", soft: "rgba(244,235,224,.62)", line: "rgba(244,235,224,.22)" }
  };

  const root = document.documentElement;
  function applyTheme(name) {
    const t = THEMES[name] || THEMES.cream;
    root.style.setProperty("--bg", t.bg);
    root.style.setProperty("--fg", t.fg);
    root.style.setProperty("--fg-soft", t.soft);
    root.style.setProperty("--line", t.line);
    document.body.dataset.theme = name;
  }

  /* theme switches when a section crosses the vertical middle of the viewport */
  const themed = document.querySelectorAll("[data-bg]");
  const themeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) applyTheme(e.target.dataset.bg);
      });
    },
    { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
  );
  themed.forEach((s) => themeObserver.observe(s));

  /* ---------------- loader ---------------- */
  const loader = document.getElementById("loader");
  window.addEventListener("load", () => {
    setTimeout(() => loader.classList.add("done"), prefersReduced ? 0 : 1100);
  });
  /* safety: never trap the user behind the loader */
  setTimeout(() => loader.classList.add("done"), 2600);

  /* ---------------- split text ---------------- */
  document.querySelectorAll("[data-split]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w) => `<span class="w"><span>${w}</span></span>`)
      .join(" ");
  });

  /* ---------------- reveal on scroll ---------------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  document.querySelectorAll(".reveal, [data-split], .flavour-bottle").forEach((el) => revealObserver.observe(el));

  /* stagger split words once revealed */
  document.querySelectorAll("[data-split]").forEach((el) => {
    el.querySelectorAll(".w > span").forEach((s, i) => {
      s.style.transitionDelay = `${i * 45}ms`;
    });
  });


  /* ---------------- counters ---------------- */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        counterObserver.unobserve(el);
        const target = parseFloat(el.dataset.count);
        /* reserve the final width up front so the suffix and label
           never reflow while the number counts up */
        el.style.display = "inline-block";
        el.style.minWidth = `${String(target).length}ch`;
        const dur = 1600;
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        if (prefersReduced) { el.textContent = target; return; }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

  /* ---------------- nav: hide on scroll down ---------------- */
  const nav = document.getElementById("nav");
  const bottles = [...document.querySelectorAll(".flavour-bottle")];
  let lastY = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);
    if (y > 300 && y > lastY + 4) nav.classList.add("hidden");
    else if (y < lastY - 4) nav.classList.remove("hidden");
    lastY = y;

    /* juice meter */
    const doc = document.documentElement;
    const p = y / (doc.scrollHeight - window.innerHeight);
    const fill = document.querySelector(".jm-fill");
    if (fill) fill.setAttribute("y", 56 - 52 * Math.min(Math.max(p, 0), 1));

    /* bottle scroll parallax */
    if (!prefersReduced) {
      const vh = window.innerHeight;
      bottles.forEach((b) => {
        const r = b.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const off = (r.top + r.height / 2 - vh / 2) / vh; /* -0.5..0.5 */
        b.style.transform = `translateY(${off * -46}px) rotate(${off * -5}deg)`;
      });
    }
  }, { passive: true });

  /* ---------------- nav active section ---------------- */
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        navLinks.forEach((a) =>
          a.classList.toggle("active", a.getAttribute("href") === `#${id}`)
        );
      });
    },
    { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
  );
  ["flavours", "impact", "story", "feed"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });
  const heroClear = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) navLinks.forEach((a) => a.classList.remove("active"));
      });
    },
    { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
  );
  const heroEl = document.querySelector(".hero");
  if (heroEl) heroClear.observe(heroEl);

  /* ---------------- hero mouse parallax ----------------
     targets update on mousemove; an eased rAF loop renders them, so
     there is never a single-frame snap — not on entry, not on leave. */
  const heroBlobWrap = document.querySelector(".hero-blob");
  const heroTitle = document.querySelector(".hero-title");
  if (heroBlobWrap && window.matchMedia("(pointer:fine)").matches && !prefersReduced) {
    let ptx = 0, pty = 0, pcx = 0, pcy = 0;
    /* always-on loop, same pattern as the cursor — no start/stop state
       machine that could ever wedge and freeze the parallax */
    const render = () => {
      pcx += (ptx - pcx) * 0.07;
      pcy += (pty - pcy) * 0.07;
      heroBlobWrap.style.transform =
        `translate3d(${(pcx * 26).toFixed(2)}px, ${(pcy * 18).toFixed(2)}px, 0) translateY(4%)`;
      heroTitle.style.transform =
        `translate3d(${(pcx * -12).toFixed(2)}px, ${(pcy * -8).toFixed(2)}px, 0)`;
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
    /* window-level: crossing child/overlay boundaries (nav, badge, pill)
       never fires a reset, so the blob only ever follows the cursor */
    window.addEventListener("mousemove", (e) => {
      if (window.scrollY > window.innerHeight * 1.3) return; /* hero off-screen */
      ptx = e.clientX / window.innerWidth - 0.5;
      pty = e.clientY / window.innerHeight - 0.5;
    });
  }

  /* ---------------- mobile menu ---------------- */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  burger.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ---------------- custom cursor ---------------- */
  const cursor = document.getElementById("cursor");
  if (window.matchMedia("(pointer:fine)").matches && !prefersReduced) {
    let cx = -100, cy = -100, tx = -100, ty = -100;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add("on");
    });
    const loop = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll("a, button, input").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("grow"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("grow"));
    });
    const feedEl = document.getElementById("feedTrack");
    if (feedEl) {
      feedEl.addEventListener("mouseenter", () => {
        cursor.classList.add("label");
        cursor.dataset.label = "drag";
      });
      feedEl.addEventListener("mouseleave", () => {
        cursor.classList.remove("label");
        delete cursor.dataset.label;
      });
    }
  }

  /* ---------------- magnetic elements ---------------- */
  if (window.matchMedia("(pointer:fine)").matches && !prefersReduced) {
    document.querySelectorAll("[data-magnet]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.18}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------------- feed rail (infinite, transform-driven) ----------------
     No native scrolling at all: Chrome scrolls containers on the compositor
     thread (trackpad inertia, touch pans), which fights main-thread
     scrollLeft wrapping and causes stutter + runaway jumps. Instead the
     card row is tripled and moved with translate3d from ONE JS-owned
     offset, wrapped modulo the copy width — nothing can fight it. */
  const track = document.getElementById("feedTrack");
  if (track) {
    const row = document.createElement("div");
    row.className = "feed-row";
    while (track.firstChild) row.appendChild(track.firstChild);
    track.appendChild(row);

    const originals = [...row.children];
    const setSize = originals.length;
    for (let c = 0; c < 2; c++) {
      originals.forEach((fig) => {
        const clone = fig.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        row.appendChild(clone);
      });
    }

    /* one period = distance between the same card in adjacent copies */
    let period = 0;
    const measure = () => {
      period = row.children[setSize].offsetLeft - row.children[0].offsetLeft;
    };
    measure();

    let offset = period; /* start in the middle copy */
    let vel = 0, down = false, lastX = 0, raf = null;

    const norm = () => {
      if (!period) return;
      offset = ((offset - period * 0.5) % period + period) % period + period * 0.5;
    };
    const render = () => {
      row.style.transform = `translate3d(${(-offset).toFixed(2)}px,0,0)`;
    };
    norm(); render();
    /* layout can change without a window resize event (embedded viewports,
       zoom, font swaps) — observe the row itself and re-measure */
    const remeasure = () => {
      const p0 = period;
      measure();
      if (p0 && period !== p0) {
        offset = offset / p0 * period; /* keep relative position */
        norm(); render();
      }
    };
    new ResizeObserver(remeasure).observe(row);
    window.addEventListener("resize", remeasure);

    const glide = () => {
      vel *= 0.94;
      if (down || Math.abs(vel) < 0.1) { raf = null; return; }
      offset += vel;
      norm(); render();
      raf = requestAnimationFrame(glide);
    };

    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault(); /* no native selection drag */
      remeasure();       /* belt-and-braces: exact period per gesture */
      down = true;
      lastX = e.clientX;
      vel = 0;
      track.classList.add("dragging");
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      offset -= dx;
      vel = vel * 0.75 + (-dx) * 0.25; /* smoothed release velocity */
      norm(); render();
    });
    ["pointerup", "pointercancel"].forEach((ev) =>
      track.addEventListener(ev, () => {
        if (!down) return;
        down = false;
        track.classList.remove("dragging");
        if (!prefersReduced && raf === null) raf = requestAnimationFrame(glide);
      })
    );

    /* horizontal trackpad / shift+wheel drives the rail; vertical
       wheel is left alone so the page still scrolls normally */
    track.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      vel = 0;
      offset += e.deltaX;
      norm(); render();
    }, { passive: false });
  }

  /* ---------------- marquees: seamless loop ----------------
     pad each half until it is wider than the viewport (otherwise a
     blank gap sweeps through on wide screens), keep both halves
     identical, and normalise speed to px/s so duration follows width. */
  function tuneMarquees() {
    document.querySelectorAll(".marquee-track").forEach((track) => {
      const spans = track.querySelectorAll("span");
      if (spans.length < 2) return;
      if (!track.dataset.base) {
        /* strip trailing whitespace (which HTML would trim at the span
           edge) and end on one non-breaking space, so the seam between
           copies is exactly as wide as every in-copy separator */
        track.dataset.base = spans[0].innerHTML.replace(/\s+$/, "") + "\u00a0";
      }
      const base = track.dataset.base;
      spans.forEach((s) => { s.innerHTML = base; });
      let guard = 0;
      while (spans[0].offsetWidth < window.innerWidth * 1.15 && guard++ < 8) {
        spans.forEach((s) => { s.innerHTML += base; });
      }
      const speed = track.closest(".footer-marquee") ? 110 : 80; /* px per second */
      track.style.animationDuration = Math.max(spans[0].offsetWidth / speed, 12) + "s";
    });
  }
  tuneMarquees();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(tuneMarquees);
  let mqResizeT;
  window.addEventListener("resize", () => {
    clearTimeout(mqResizeT);
    mqResizeT = setTimeout(tuneMarquees, 200);
  });

  /* ---------------- drop list form ---------------- */
  const dropForm = document.getElementById("dropForm");
  if (dropForm) {
    dropForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = dropForm.querySelector("input");
      if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.focus();
        email.style.borderColor = "var(--mango)";
        return;
      }
      dropForm.hidden = true;
      document.getElementById("dropDone").hidden = false;
    });
  }

  /* ---------------- generated art (Higgsfield) swap-in ---------------- */
  /* if a generated asset exists in assets/gen/, use it; otherwise the CSS
     gradient fallbacks stay in place. */
  function swapIn(el, src, styleProp) {
    if (!el) return;
    const img = new Image();
    img.onload = () => { el.style[styleProp || "backgroundImage"] = `url("${src}")`; };
    img.src = src;
  }
  swapIn(document.getElementById("heroBlob"), "assets/gen/swirl-berry.webp");
})();
