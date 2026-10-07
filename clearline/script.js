(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header: border on scroll + mobile menu */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); }
  });

  /* Wipe-to-clean hero card */
  const figure = document.querySelector(".wipe");
  const canvas = figure.querySelector(".wipe-haze");
  const ctx = canvas.getContext("2d");
  let lastPoint = null;
  let strokes = 0;
  let finished = false;

  const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  const paintHaze = () => {
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = "rgba(196, 201, 196, 0.94)";
    ctx.fillRect(0, 0, width, height);

    const rand = seeded(42);
    for (let i = 0; i < 26; i++) {
      const x = rand() * width, y = rand() * height, r = 30 + rand() * 90;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(150, 140, 118, ${0.18 + rand() * 0.2})`);
      g.addColorStop(1, "rgba(150, 140, 118, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.strokeStyle = "rgba(120, 112, 96, 0.12)";
    ctx.lineCap = "round";
    for (let i = 0; i < 18; i++) {
      ctx.lineWidth = 6 + rand() * 18;
      ctx.beginPath();
      const x = rand() * width, y = rand() * height;
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 80 * rand(), y - 40 * rand(), x + 160 * rand(), y + 30 * rand());
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(90, 84, 70, 0.25)";
    for (let i = 0; i < 260; i++) {
      ctx.beginPath();
      ctx.arc(rand() * width, rand() * height, rand() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const wipeLine = (from, to) => {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = 64;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const clearedRatio = () => {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 40) { total++; if (data[i] < 30) clear++; }
    return clear / total;
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    figure.classList.add("done");
    if (reduceMotion) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
    canvas.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, easing: "ease-out", fill: "forwards" });
  };

  const pointFrom = (e) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    lastPoint = pointFrom(e);
    wipeLine(lastPoint, lastPoint);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!lastPoint) return;
    const p = pointFrom(e);
    wipeLine(lastPoint, p);
    lastPoint = p;
    if (++strokes % 12 === 0 && clearedRatio() > 0.6) finish();
  });
  const endStroke = () => { lastPoint = null; if (!finished && clearedRatio() > 0.6) finish(); };
  canvas.addEventListener("pointerup", endStroke);
  canvas.addEventListener("pointercancel", endStroke);

  figure.querySelector("[data-wipe-all]").addEventListener("click", finish);

  /* One orchestrated moment: a single swoosh wipe across the card on load,
     echoing the swoosh under the logo. */
  const introSwoosh = () => {
    const { width, height } = canvas.getBoundingClientRect();
    const start = performance.now();
    const duration = 950;
    let prev = null;
    const step = (now) => {
      if (finished) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const x = -40 + eased * (width + 80);
      const y = height * 0.62 - Math.sin(eased * Math.PI) * height * 0.08;
      const p = { x, y };
      if (prev) wipeLine(prev, p);
      prev = p;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  paintHaze();
  if (!reduceMotion) setTimeout(introSwoosh, 700);

  let resizeTimer;
  window.addEventListener("resize", () => {
    if (finished) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(paintHaze, 150);
  });

  /* Tabs (WAI-ARIA pattern with arrow keys) */
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (dir === undefined) return;
        e.preventDefault();
        const next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus();
        select(next);
      });
    });
  });

  /* Estimator */
  const sqft = document.getElementById("sqft");
  const sqftOut = document.getElementById("sqft-out");
  const estimate = document.getElementById("estimate");
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const roundTo = (n, step) => Math.round(n / step) * step;

  const updateEstimate = () => {
    const area = Number(sqft.value);
    const typeFactor = Number(document.querySelector('input[name="type"]:checked').value);
    const visits = Number(document.querySelector('input[name="freq"]:checked').value);
    // Per-visit cost scales sub-linearly with area; visits per month = visits/week * 4.33
    const perVisit = (0.028 * Math.pow(area, 0.93)) * typeFactor;
    const monthly = Math.max(320, perVisit * visits * 4.33);
    sqftOut.textContent = `${area.toLocaleString("en-US")} sq ft`;
    estimate.textContent = `${money.format(roundTo(monthly * 0.92, 10))} – ${money.format(roundTo(monthly * 1.12, 10))}`;
  };
  document.querySelector(".estimator").addEventListener("input", updateEstimate);
  updateEstimate();

  /* Quote form: validate on blur, clear errors as soon as input is fixed */
  const form = document.querySelector(".quote-form");
  const rules = {
    name: (v) => v.trim().length > 1,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  };
  const check = (input) => {
    const ok = rules[input.name](input.value);
    const err = document.getElementById(`${input.name}-error`);
    input.setAttribute("aria-invalid", String(!ok));
    input.setAttribute("aria-describedby", err.id);
    err.hidden = ok;
    return ok;
  };
  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    input.addEventListener("blur", () => { if (input.value) check(input); });
    input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true") check(input); });
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = Object.keys(rules).map((name) => check(form.elements[name]));
    const firstBad = Object.keys(rules).find((_, i) => !results[i]);
    if (firstBad) { form.elements[firstBad].focus(); return; }
    const success = form.querySelector(".form-success");
    success.hidden = false;
    success.focus();
  });
})();
