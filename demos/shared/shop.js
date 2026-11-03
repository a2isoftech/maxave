/* Shared shop behaviour for the MAX AVE layout demos.
   Hooks (add to any element):
     data-quick="<id>"   open the product quick-view
     data-add="<id>"     add the default size to the cart and open the cart
     data-cart           open the cart drawer
     data-cart-count     element whose text shows the item count            */
(function () {
  const D = window.MAXAVE;
  const KEY = "maxave-cart";
  const IMG = window.MAXAVE_IMG_PREFIX || "../assets/bottles/";
  const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Bahawalpur", "Sargodha", "Sukkur", "Other"];

  let cart = load();
  let step = "cart"; // cart | details | pay | done
  let details = {};
  let payMethod = "cod";
  let lastOrder = null;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {}
    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      const n = count();
      el.textContent = n;
      el.toggleAttribute("data-empty", n === 0);
    });
  }
  const count = () => cart.reduce((a, l) => a + l.qty, 0);
  const subtotal = () => cart.reduce((a, l) => a + D.find(l.id).sizes[l.size].price * l.qty, 0);
  const shipping = () => (subtotal() >= D.freeShippingOver || subtotal() === 0 ? 0 : D.shippingFee);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function add(id, size, qty) {
    size = size || 0; qty = qty || 1;
    const hit = cart.find((l) => l.id === id && l.size === size);
    if (hit) hit.qty += qty; else cart.push({ id, size, qty });
    save();
  }

  /* ---------- DOM scaffold ---------- */
  const root = document.createElement("div");
  root.className = "ms-root";
  root.innerHTML = `
    <div class="ms-scrim"></div>
    <aside class="ms-drawer" aria-label="Cart" aria-hidden="true">
      <div class="ms-head"><h3></h3><button class="ms-x" data-close aria-label="Close">×</button></div>
      <div class="ms-steps"><span></span><span></span><span></span></div>
      <div class="ms-body"></div>
      <div class="ms-foot"></div>
    </aside>
    <section class="ms-modal" role="dialog" aria-modal="true" aria-hidden="true"></section>
    <div class="jc-wrap" aria-hidden="true"><div class="jc-card"></div></div>`;
  document.addEventListener("DOMContentLoaded", () => { document.body.appendChild(root); save(); });

  const $ = (s) => root.querySelector(s);
  const scrim = () => $(".ms-scrim");
  const drawer = () => $(".ms-drawer");
  const modal = () => $(".ms-modal");

  function closeAll() {
    [scrim(), drawer(), modal()].forEach((el) => el.classList.remove("on"));
    drawer().setAttribute("aria-hidden", "true");
    modal().setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "";
  }
  function lock() { document.documentElement.style.overflow = "hidden"; scrim().classList.add("on"); }

  /* ---------- quick view ---------- */
  function quick(id) {
    const p = D.find(id); if (!p) return;
    let size = 0, qty = 1, side = "front";
    const m = modal();
    const render = () => {
      m.innerHTML = `
        <button class="ms-x" data-close aria-label="Close">×</button>
        <div class="ms-stage">
          <img src="${IMG}${side}-${p.color}.png" alt="MAX AVE ${esc(p.name)} bottle, ${side} view">
          <div class="ms-flip"><button data-side="front" class="${side === "front" ? "on" : ""}">Front</button><button data-side="back" class="${side === "back" ? "on" : ""}">Back</button></div>
        </div>
        <div class="ms-info">
          <div class="ms-kicker">${esc(p.base)} · ${esc(p.tag)}</div>
          <h2>MAX AVE ${esc(p.name)}</h2>
          <div class="ms-grade">SAE ${esc(p.grade)}</div>
          <p>${esc(p.long)}</p>
          <div class="ms-specs">
            <div><span>Suits</span>${esc(p.fits)}</div>
            <div><span>Change every</span>${esc(p.interval)}</div>
            <div><span>Base oil</span>${esc(p.base)}</div>
            <div><span>Clutch</span>${p.category === "scooter" ? "Dry / CVT" : p.category === "two-stroke" ? "Premix / auto-lube" : "Wet-clutch safe"}</div>
          </div>
          <div class="ms-kicker" style="margin-bottom:8px">Size</div>
          <div class="ms-sizes">${p.sizes.map((s, i) => `<button data-size="${i}" class="${i === size ? "on" : ""}">${s.label}</button>`).join("")}</div>
          <div class="ms-bigprice">${D.rs(p.sizes[size].price)}</div>
          <div class="ms-buyrow">
            <div class="ms-qty"><button data-q="-1" aria-label="Less">−</button><span>${qty}</span><button data-q="1" aria-label="More">+</button></div>
            <button class="ms-btn" data-addnow>Add to cart</button>
          </div>
          <button class="ms-btn ghost" data-buynow>Buy now</button>
          <div class="ms-pays"><span>✓ Cash on Delivery</span><span>✓ JazzCash</span><span>✓ Free delivery over ${D.rs(D.freeShippingOver)}</span></div>
        </div>`;
    };
    render();
    m.onclick = (e) => {
      const t = e.target.closest("button"); if (!t) return;
      if (t.dataset.side) { side = t.dataset.side; render(); }
      else if (t.dataset.size) { size = +t.dataset.size; render(); }
      else if (t.dataset.q) { qty = Math.max(1, qty + +t.dataset.q); render(); }
      else if ("addnow" in t.dataset) { add(p.id, size, qty); m.classList.remove("on"); openCart(); }
      else if ("buynow" in t.dataset) { add(p.id, size, qty); m.classList.remove("on"); step = "details"; openCart(); }
      else if ("close" in t.dataset) closeAll();
    };
    lock();
    m.classList.add("on");
    m.setAttribute("aria-hidden", "false");
  }

  /* ---------- drawer ---------- */
  function openCart() {
    if (step === "done") step = "cart";
    lock();
    renderDrawer();
    drawer().classList.add("on");
    drawer().setAttribute("aria-hidden", "false");
  }

  function summary() {
    return `<div class="ms-sum">
      <div><span>Subtotal</span><span>${D.rs(subtotal())}</span></div>
      <div><span>Delivery</span><span>${shipping() ? D.rs(shipping()) : "Free"}</span></div>
      <div class="tot"><span>Total</span><span>${D.rs(subtotal() + shipping())}</span></div>
    </div>`;
  }

  function renderDrawer() {
    const head = $(".ms-head h3"), body = $(".ms-body"), foot = $(".ms-foot");
    const idx = { cart: 1, details: 2, pay: 3, done: 3 }[step];
    root.querySelectorAll(".ms-steps span").forEach((s, i) => s.classList.toggle("on", i < idx));

    if (step === "cart") {
      head.textContent = `Your cart (${count()})`;
      if (!cart.length) {
        body.innerHTML = `<div class="ms-empty">Your cart is empty.<br>Pick an oil to get started.</div>`;
        foot.innerHTML = `<button class="ms-btn ghost" data-close>Continue shopping</button>`;
        return;
      }
      body.innerHTML = cart.map((l, i) => {
        const p = D.find(l.id), s = p.sizes[l.size];
        return `<div class="ms-line">
          <img src="${IMG}front-${p.color}.png" alt="">
          <div><b>MAX AVE ${esc(p.name)}</b><small>${esc(p.grade)} · ${s.label}</small><br>
            <div class="ms-qty"><button data-ln="${i}" data-d="-1" aria-label="Less">−</button><span>${l.qty}</span><button data-ln="${i}" data-d="1" aria-label="More">+</button></div></div>
          <div class="ms-price">${D.rs(s.price * l.qty)}<button class="ms-rm" data-rm="${i}">Remove</button></div>
        </div>`;
      }).join("");
      const left = D.freeShippingOver - subtotal();
      foot.innerHTML = summary() +
        `<p class="ms-note">${left > 0 ? `Add ${D.rs(left)} more for free delivery.` : "You've unlocked free delivery."}</p>
         <button class="ms-btn" data-go="details">Checkout</button>`;
    }

    if (step === "details") {
      head.textContent = "Delivery details";
      body.innerHTML = `<form class="ms-form" novalidate>
        <label>Full name<input name="name" autocomplete="name" value="${esc(details.name || "")}" required></label>
        <label>Mobile number<input name="phone" inputmode="tel" placeholder="03XX XXXXXXX" autocomplete="tel" value="${esc(details.phone || "")}" required></label>
        <div class="row">
          <label>City<select name="city">${CITIES.map((c) => `<option ${details.city === c ? "selected" : ""}>${c}</option>`).join("")}</select></label>
          <label>Postal code<input name="zip" inputmode="numeric" value="${esc(details.zip || "")}" placeholder="Optional"></label>
        </div>
        <label>Full address<textarea name="addr" rows="3" required>${esc(details.addr || "")}</textarea></label>
        <label>Order notes<input name="notes" value="${esc(details.notes || "")}" placeholder="Landmark, preferred time…"></label>
        <div class="ms-err"></div>
      </form>`;
      foot.innerHTML = summary() + `<button class="ms-btn" data-go="pay">Continue to payment</button><button class="ms-btn ghost" data-go="cart">Back to cart</button>`;
    }

    if (step === "pay") {
      head.textContent = "Payment";
      body.innerHTML = `<div class="ms-pay">
        <button class="ms-opt ${payMethod === "cod" ? "on" : ""}" data-pm="cod"><span class="ms-radio"></span>
          <span><b>Cash on Delivery</b><small>Pay the rider in cash when your order arrives.</small></span><span class="ms-badge-cod">COD</span></button>
        <button class="ms-opt ${payMethod === "jc" ? "on" : ""}" data-pm="jc"><span class="ms-radio"></span>
          <span><b>JazzCash Mobile Account</b><small>Approve the payment instantly from your JazzCash app.</small></span><span class="ms-badge-jc">Jazz<i>Cash</i></span></button>
        <div class="ms-receipt">
          <div><span>Deliver to</span><span>${esc(details.name)}</span></div>
          <div><span></span><span style="text-align:right">${esc(details.addr)}, ${esc(details.city)}</span></div>
          <div><span>Mobile</span><span>${esc(details.phone)}</span></div>
          <div><span>Estimated delivery</span><span>2 – 4 working days</span></div>
        </div>
      </div>`;
      foot.innerHTML = summary() + `<button class="ms-btn" data-place>${payMethod === "cod" ? "Place order" : "Pay " + D.rs(subtotal() + shipping()) + " with JazzCash"}</button><button class="ms-btn ghost" data-go="details">Back</button>`;
    }

    if (step === "done") {
      const o = lastOrder;
      head.textContent = "Order confirmed";
      body.innerHTML = `<div class="ms-done">
        <div class="ms-check">✓</div>
        <h4>Thank you, ${esc(o.name.split(" ")[0])}!</h4>
        <p>Your order <b>${o.id}</b> has been placed.</p>
        <p>${o.method === "cod" ? "Please keep " + D.rs(o.total) + " ready for the rider." : "Payment received via JazzCash."}</p>
        <div class="ms-receipt">
          <div><span>Order</span><span>${o.id}</span></div>
          <div><span>Payment</span><span>${o.method === "cod" ? "Cash on Delivery" : "JazzCash · " + o.txn}</span></div>
          <div><span>Total</span><span>${D.rs(o.total)}</span></div>
          <div><span>Delivery to</span><span>${esc(o.city)}</span></div>
        </div>
        <p style="margin-top:18px;font-size:13px">We'll call you on ${esc(o.phone)} to confirm. Questions? <a href="${D.phoneHref}" style="color:inherit">${D.phone}</a></p>
      </div>`;
      foot.innerHTML = `<button class="ms-btn" data-close>Continue shopping</button>`;
    }
  }

  function readDetails() {
    const f = root.querySelector(".ms-form");
    const fd = Object.fromEntries(new FormData(f).entries());
    details = fd;
    const phone = (fd.phone || "").replace(/[\s-]/g, "");
    if (!fd.name || fd.name.trim().length < 3) return "Please enter your full name.";
    if (!/^(\+92|0092|0)?3\d{9}$/.test(phone)) return "Enter a valid Pakistani mobile number (03XX XXXXXXX).";
    if (!fd.addr || fd.addr.trim().length < 8) return "Please enter your full delivery address.";
    return "";
  }

  function placeOrder(txn) {
    lastOrder = {
      id: "MXA-" + Math.floor(100000 + Math.random() * 900000),
      method: payMethod, txn,
      total: subtotal() + shipping(),
      name: details.name, phone: details.phone, city: details.city
    };
    cart = []; save();
    step = "done"; renderDrawer();
  }

  root.addEventListener("click", (e) => {
    if (e.target.classList.contains("ms-scrim")) return closeAll();
    const t = e.target.closest("button"); if (!t || !drawer().contains(t)) {
      if (t && "close" in t.dataset) closeAll();
      return;
    }
    if ("close" in t.dataset) return closeAll();
    if (t.dataset.ln) {
      const l = cart[+t.dataset.ln]; l.qty += +t.dataset.d;
      if (l.qty < 1) cart.splice(+t.dataset.ln, 1);
      save(); return renderDrawer();
    }
    if (t.dataset.rm) { cart.splice(+t.dataset.rm, 1); save(); return renderDrawer(); }
    if (t.dataset.pm) { payMethod = t.dataset.pm; return renderDrawer(); }
    if (t.dataset.go) {
      if (step === "details" && t.dataset.go === "pay") {
        const err = readDetails();
        if (err) { root.querySelector(".ms-err").textContent = err; return; }
      } else if (step === "details") readDetails();
      step = t.dataset.go; return renderDrawer();
    }
    if ("place" in t.dataset) {
      if (payMethod === "cod") placeOrder();
      else jazzcash(subtotal() + shipping(), (txn) => placeOrder(txn));
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeJC(); closeAll(); } });

  /* ---------- JazzCash sandbox ---------- */
  let jcTimer;
  function closeJC() { clearInterval(jcTimer); const w = $(".jc-wrap"); if (w) { w.classList.remove("on"); w.setAttribute("aria-hidden", "true"); } }
  function jazzcash(amount, onPaid) {
    const w = $(".jc-wrap"), card = $(".jc-card");
    const top = `<div class="jc-top"><div class="jc-brand">Jazz<i>Cash</i></div><span class="jc-sandbox">SANDBOX</span>
      <div class="jc-merchant"><div>Paying<br><b style="font-weight:600">MAX AVE Lubricants</b></div><div style="text-align:right">Amount<strong>${D.rs(amount)}</strong></div></div></div>`;
    const foot = `<div class="jc-foot">Demo checkout · no real money is charged</div>`;
    const stepAccount = () => {
      card.innerHTML = top + `<div class="jc-body">
        <h5>Pay with JazzCash Mobile Account</h5>
        <p>Enter your JazzCash account number and the last 6 digits of your CNIC. You'll receive a payment request to approve.</p>
        <label class="jc-field">Mobile account number<div class="jc-pre"><span>+92</span><input id="jc-m" inputmode="numeric" maxlength="10" placeholder="3XX XXXXXXX" value="${esc((details.phone || "").replace(/\D/g, "").replace(/^(92|0)/, "").slice(0, 10))}"></div></label>
        <label class="jc-field">CNIC (last 6 digits)<input id="jc-c" inputmode="numeric" maxlength="6" placeholder="••••••"></label>
        <div class="jc-err"></div>
        <button class="jc-btn" id="jc-go">Send payment request</button>
        <button class="jc-btn alt" id="jc-cancel">Cancel</button></div>` + foot;
      card.querySelector("#jc-cancel").onclick = closeJC;
      card.querySelector("#jc-go").onclick = () => {
        const m = card.querySelector("#jc-m").value.replace(/\D/g, ""), c = card.querySelector("#jc-c").value.replace(/\D/g, "");
        if (!/^3\d{9}$/.test(m)) return (card.querySelector(".jc-err").textContent = "Enter a valid 10-digit mobile account number.");
        if (c.length !== 6) return (card.querySelector(".jc-err").textContent = "Enter the last 6 digits of your CNIC.");
        stepWait(m);
      };
    };
    const stepWait = (m) => {
      let s = 60;
      card.innerHTML = top + `<div class="jc-body jc-wait">
        <div class="jc-phone"><b></b></div>
        <h5>Approve on your phone</h5>
        <p>A payment request was sent to <b>+92 ${m.slice(0, 3)} ${m.slice(3)}</b>.<br>Open the JazzCash app or dial <b>*786#</b> and enter your MPIN to approve.</p>
        <div class="jc-timer">01:00</div>
        <button class="jc-btn" id="jc-sim">Simulate approval (demo)</button>
        <button class="jc-btn alt" id="jc-cancel">Cancel payment</button></div>` + foot;
      const tEl = card.querySelector(".jc-timer");
      clearInterval(jcTimer);
      jcTimer = setInterval(() => {
        s--; tEl.textContent = "00:" + String(Math.max(s, 0)).padStart(2, "0");
        if (s <= 0) { clearInterval(jcTimer); card.querySelector(".jc-body").insertAdjacentHTML("afterbegin", `<div class="jc-err">Request timed out. Please try again.</div>`); }
      }, 1000);
      card.querySelector("#jc-cancel").onclick = closeJC;
      card.querySelector("#jc-sim").onclick = () => {
        clearInterval(jcTimer);
        const txn = "T" + Date.now().toString().slice(-10);
        card.innerHTML = top + `<div class="jc-body jc-wait"><div class="jc-ok">✓</div><h5>Payment successful</h5>
          <p>Transaction ID <b>${txn}</b><br>${D.rs(amount)} paid to MAX AVE Lubricants.</p>
          <button class="jc-btn" id="jc-done">Return to merchant</button></div>` + foot;
        card.querySelector("#jc-done").onclick = () => { closeJC(); onPaid(txn); };
      };
    };
    stepAccount();
    w.classList.add("on");
    w.setAttribute("aria-hidden", "false");
  }

  /* ---------- global hooks ---------- */
  document.addEventListener("click", (e) => {
    const q = e.target.closest("[data-quick]");
    if (q && !root.contains(q)) { e.preventDefault(); return quick(q.dataset.quick); }
    const a = e.target.closest("[data-add]");
    if (a && !root.contains(a)) { e.preventDefault(); add(a.dataset.add, 0, 1); step = "cart"; return openCart(); }
    const c = e.target.closest("[data-cart]");
    if (c && !root.contains(c)) { e.preventDefault(); return openCart(); }
  });

  window.MaxShop = { quick, add, openCart };
})();
