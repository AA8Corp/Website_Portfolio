(() => {
  const $ = (id) => document.getElementById(id);
  const usd = (n) => `$${Math.round(n).toLocaleString("en-US")}`;

  /* Rate calculator */
  const form = document.querySelector(".quote-form");
  const ticketId = `BB-Q-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  $("ticket-id").textContent = ticketId;

  const updateRate = () => {
    const miles = Number($("miles").value);
    const pallets = Number($("pallets").value);
    const speed = Number(form.querySelector('input[name="speed"]:checked').value);
    const inside = $("inside").checked ? 45 : 0;

    const base = Math.max(79, 49 + miles * 1.85);
    const palletCost = (pallets - 1) * 12;
    const subtotal = base + palletCost;
    const speedDelta = subtotal * (speed - 1);
    const total = Math.max(89, subtotal + speedDelta + inside);

    $("miles-out").textContent = `${miles} mi`;
    $("pallets-out").textContent = String(pallets);
    $("l-base").textContent = usd(base);
    $("l-pallets").textContent = usd(palletCost);
    $("l-speed").textContent = speedDelta < 0 ? `−${usd(-speedDelta)}` : usd(speedDelta);
    $("l-inside").textContent = usd(inside);
    $("price").textContent = usd(total);
  };
  form.addEventListener("input", updateRate);
  updateRate();

  $("book").addEventListener("click", () => {
    $("book-note").textContent = `Truck held for ${ticketId}. Demo only, no booking created.`;
  });

  /* Tracking demo */
  const trackForm = document.querySelector(".track-form");
  const input = $("track-id");
  const result = $("track-result");
  const hint = $("track-hint");
  const hintDefault = hint.innerHTML;

  document.querySelector("[data-fill]").addEventListener("click", () => {
    input.value = "BB-240817";
    input.focus();
  });

  trackForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = input.value.trim().toUpperCase();
    if (!/^BB-\d{6}$/.test(id)) {
      result.hidden = true;
      input.setAttribute("aria-invalid", "true");
      hint.innerHTML = `<span class="track-error">Load numbers look like BB-240817: “BB-” and six digits.</span>`;
      return;
    }
    input.removeAttribute("aria-invalid");
    hint.innerHTML = hintDefault;
    hint.querySelector("[data-fill]").addEventListener("click", () => { input.value = "BB-240817"; input.focus(); });
    $("tr-id").textContent = id;
    result.hidden = false;
    result.focus();
  });
})();
