(() => {
  /* ---------- Garment illustrations (flat SVG, distressed print) ---------- */
  const shade = "rgba(0,0,0,.18)";
  const print = (color, y = 150, size = 54) =>
    `<g filter="url(#grit)"><text x="150" y="${y}" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="${size}" fill="${color}" letter-spacing="2">CC</text>
     <rect x="${150 - size * 0.75}" y="${y + 8}" width="${size * 1.5}" height="5" fill="${color}"/></g>`;

  const garments = {
    tee: (fill, ink) => `
      <path d="M95 34 58 46 14 92l38 38 26-18v196h144V112l26 18 38-38-44-46-37-12c-8 22-28 34-55 34S103 56 95 34z" fill="${fill}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
      <path d="M95 34c8 22 28 34 55 34s47-12 55-34" fill="none" stroke="${shade}" stroke-width="7"/>
      <path d="M78 112v40M222 112v40" stroke="${shade}" stroke-width="2"/>
      ${print(ink, 168)}`,
    crew: (fill, ink) => `
      <path d="M95 34 56 48 30 120 18 292h38l22-150v166h144V142l22 150h38l-12-172-26-72-39-14c-8 20-28 32-55 32S103 54 95 34z" fill="${fill}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
      <path d="M95 34c8 20 28 32 55 32s47-12 55-32" fill="none" stroke="${shade}" stroke-width="8"/>
      <path d="M78 292h144" stroke="${shade}" stroke-width="10"/>
      <path d="M18 280h38M244 280h38" stroke="${shade}" stroke-width="8"/>
      ${print(ink, 170, 60)}`,
    hoodie: (fill, ink) => `
      <path d="M150 10c-36 0-58 22-60 52l60 26 60-26c-2-30-24-52-60-52z" fill="${fill}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
      <path d="M150 22c-24 0-38 16-40 38l40 18 40-18c-2-22-16-38-40-38z" fill="${shade}"/>
      <path d="M92 48 56 60 30 128 18 296h38l22-150v164h144V146l22 150h38l-12-168-26-68-36-12-60 30z" fill="${fill}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
      <path d="M140 80v52M160 80v52" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
      <path d="M98 226h104l14 60H84z" fill="${shade}"/>
      <path d="M78 296h144" stroke="${shade}" stroke-width="10"/>
      ${print(ink, 196, 48)}`,
    pants: (fill, ink) => `
      <path d="M84 16h132l22 304h-70l-18-196-18 196H62z" fill="${fill}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
      <path d="M84 16h132v20H84z" fill="${shade}"/>
      <path d="M150 36v80" stroke="${shade}" stroke-width="2"/>
      <rect x="66" y="150" width="40" height="52" fill="${shade}"/><rect x="194" y="150" width="40" height="52" fill="${shade}"/>
      <path d="M66 162h40M194 162h40" stroke="#000" stroke-opacity=".25" stroke-width="2"/>
      <g filter="url(#grit)"><rect x="196" y="230" width="22" height="34" fill="${ink}"/><text x="207" y="254" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="14" fill="${fill}">CC</text></g>`,
    cap: (fill, ink) => `
      <path d="M58 196c0-66 40-104 92-104s92 38 92 104z" fill="${fill}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
      <path d="M150 92v104M104 104c-12 26-16 56-14 92M196 104c12 26 16 56 14 92" stroke="${shade}" stroke-width="2" fill="none"/>
      <circle cx="150" cy="92" r="6" fill="${shade}"/>
      <path d="M40 196c40-8 180-8 220 6l-6 26c-40-12-170-14-208-4z" fill="${fill}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
      <path d="M44 214c40-8 170-6 212 4" stroke="${shade}" stroke-width="6" fill="none"/>
      ${print(ink, 172, 40)}`,
  };

  const garmentSVG = (type, fill, ink, label) =>
    `<svg viewBox="0 0 300 330" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${garments[type](fill, ink)}</svg>`;

  /* ---------- Products ---------- */
  const SIZES = ["S", "M", "L", "XL", "XXL"];
  const products = [
    { id: "slab-hoodie", name: "Slab Hoodie", price: 98, type: "hoodie", fill: "#EDEAE3", ink: "#111111", color: "Bone", weight: "500 GSM fleece", left: 14, out: ["S"] },
    { id: "cracked-tee", name: "Cracked CC Tee", price: 48, type: "tee", fill: "#111111", ink: "#D7263D", color: "Black", weight: "300 GSM jersey", left: 0, out: SIZES },
    { id: "rebar-cargo", name: "Rebar Cargo", price: 110, type: "pants", fill: "#8A8D93", ink: "#111111", color: "Concrete", weight: "14 oz canvas", left: 6, out: ["S", "XXL"] },
    { id: "block-tee", name: "Block Logo Tee", price: 45, type: "tee", fill: "#EDEAE3", ink: "#D7263D", color: "Bone", weight: "300 GSM jersey", left: 22, out: [] },
    { id: "curb-crew", name: "Curb Crew", price: 85, type: "crew", fill: "#D7263D", ink: "#EDEAE3", color: "Hazard red", weight: "450 GSM fleece", left: 3, out: ["S", "M", "XXL"] },
    { id: "block-cap", name: "Block 5-Panel", price: 38, type: "cap", fill: "#2a2a2a", ink: "#EDEAE3", color: "Black", weight: "Nylon, one size", left: 0, out: ["OS"], sizes: ["OS"] },
  ];

  const grid = document.getElementById("product-grid");
  grid.innerHTML = products.map((p) => {
    const sold = p.left === 0;
    const sizes = p.sizes || SIZES;
    const tag = sold ? "" : `<span class="p-tag ${p.left <= 6 ? "low" : ""}">${p.left} left</span>`;
    return `
      <article class="product ${sold ? "sold" : ""}" data-id="${p.id}">
        <div class="p-art">
          ${tag}
          ${garmentSVG(p.type, p.fill, p.ink, `${p.name} in ${p.color}`)}
          ${sold ? '<div class="stamp"><span>Sold out</span></div>' : ""}
        </div>
        <div class="p-info">
          <div class="p-row"><h3 class="p-name">${p.name}</h3><span class="p-price">$${p.price}</span></div>
          <p class="p-meta">${p.color}, ${p.weight}</p>
          <fieldset class="sizes">
            <legend>Size for ${p.name}</legend>
            ${sizes.map((s) => `<label><input type="radio" name="size-${p.id}" value="${s}" ${p.out.includes(s) ? "disabled" : ""}${sizes.length === 1 && !sold ? " checked" : ""}><span>${s}</span></label>`).join("")}
          </fieldset>
          <button class="add" type="button" ${sold ? "disabled" : ""}>${sold ? "Sold out" : "Add to bag"}</button>
          <p class="p-hint" aria-live="polite"></p>
        </div>
      </article>`;
  }).join("");

  /* Lookbook art */
  document.querySelectorAll(".look-art").forEach((el) => {
    el.innerHTML = garmentSVG(el.dataset.garment, el.dataset.fill, el.dataset.print);
  });

  /* ---------- Bag ---------- */
  const bag = [];
  const dialog = document.getElementById("bag");
  const bagBtn = document.querySelector(".bag-btn");
  const count = document.getElementById("bag-count");
  const list = document.getElementById("bag-items");
  const empty = document.getElementById("bag-empty");
  const foot = document.getElementById("bag-foot");
  const total = document.getElementById("bag-total");

  const renderBag = () => {
    count.textContent = String(bag.length);
    empty.hidden = bag.length > 0;
    foot.hidden = bag.length === 0;
    list.innerHTML = bag.map((item, i) => {
      const p = products.find((x) => x.id === item.id);
      return `<li>
        <div class="bag-thumb">${garmentSVG(p.type, p.fill, p.ink)}</div>
        <div><b>${p.name}</b><small>${p.color}, size ${item.size}</small><br><button class="bag-remove" type="button" data-i="${i}">Remove</button></div>
        <span>$${p.price}</span>
      </li>`;
    }).join("");
    total.textContent = `$${bag.reduce((sum, item) => sum + products.find((x) => x.id === item.id).price, 0)}`;
  };

  grid.addEventListener("change", (e) => {
    const card = e.target.closest(".product");
    if (card) card.querySelector(".p-hint").textContent = "";
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add");
    if (!btn || btn.disabled) return;
    const card = btn.closest(".product");
    const size = card.querySelector('input[type="radio"]:checked');
    const hint = card.querySelector(".p-hint");
    if (!size) { hint.textContent = "Pick a size first."; card.querySelector('input:not(:disabled)').focus(); return; }
    bag.push({ id: card.dataset.id, size: size.value });
    renderBag();
    btn.textContent = "Added";
    btn.classList.add("added");
    bagBtn.classList.add("bump");
    setTimeout(() => { btn.textContent = "Add to bag"; btn.classList.remove("added"); bagBtn.classList.remove("bump"); }, 1400);
  });

  list.addEventListener("click", (e) => {
    const rm = e.target.closest(".bag-remove");
    if (!rm) return;
    bag.splice(Number(rm.dataset.i), 1);
    renderBag();
    (list.querySelector(".bag-remove") || dialog.querySelector(".bag-close")).focus();
  });

  bagBtn.addEventListener("click", () => { renderBag(); dialog.showModal(); });
  dialog.querySelector(".bag-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
  document.getElementById("checkout").addEventListener("click", () => {
    document.getElementById("checkout-note").textContent = "Demo store. Order not placed, no payment taken.";
  });
  renderBag();

  /* ---------- Countdown to next Friday 12 PM ET (16:00 UTC) ---------- */
  const nextDrop = () => {
    const now = new Date();
    const t = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 16));
    const add = (5 - t.getUTCDay() + 7) % 7;
    t.setUTCDate(t.getUTCDate() + add);
    if (t <= now) t.setUTCDate(t.getUTCDate() + 7);
    return t;
  };
  const target = nextDrop();
  const units = Object.fromEntries([...document.querySelectorAll("[data-unit]")].map((el) => [el.dataset.unit, el]));
  const pad = (n) => String(n).padStart(2, "0");
  const tickClock = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); s %= 60;
    units.d.textContent = pad(d); units.h.textContent = pad(h); units.m.textContent = pad(m); units.s.textContent = pad(s);
  };
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- Drop text signup ---------- */
  const form = document.querySelector(".signup-form");
  const phone = document.getElementById("phone");
  const msg = document.getElementById("phone-msg");
  const validPhone = (v) => v.replace(/\D/g, "").length >= 10;
  phone.addEventListener("input", () => {
    if (phone.getAttribute("aria-invalid") === "true" && validPhone(phone.value)) {
      phone.removeAttribute("aria-invalid");
      msg.textContent = "Demo form. No texts are sent.";
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validPhone(phone.value)) {
      phone.setAttribute("aria-invalid", "true");
      msg.textContent = "Enter a 10-digit phone number, like (555) 555-0123.";
      phone.focus();
      return;
    }
    msg.textContent = "You’re on the list. Demo only, so no text is coming.";
    form.querySelector("button").textContent = "On the list";
  });
})();
