/* The Light — анімація появи першого екрана (GSAP) */
(function () {
  var pre = document.querySelector(".pre");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Без GSAP або з «менше руху» — просто показуємо готовий екран
  var root = document.documentElement;
  if (!window.gsap || reduce) {
    root.classList.remove("intro");
    pre.remove();
    document.querySelector(".badge svg").style.setProperty("--spin", "running");
    return;
  }

  var q = function (s) { return document.querySelectorAll(s); };
  var hero = document.querySelector(".hero");
  var img = document.querySelector(".hero__bg img");

  // 1. Розбиваємо заголовок на літери, а лід — на слова
  q(".title i").forEach(function (w) {
    var t = w.textContent; w.textContent = "";
    Array.from(t).forEach(function (c) {
      var b = document.createElement("b"); b.className = "ch"; b.textContent = c; w.appendChild(b);
    });
  });
  var lead = document.querySelector(".mid__lead");
  lead.innerHTML = lead.textContent.trim().split(/\s+/).map(function (w) {
    return '<span class="wd">' + w + "</span>";
  }).join(" ");

  // 2. Початкові стани
  var bg = document.querySelector(".hero__bg");
  var slit = { v: 50 }; // відступ «щілини» від верху й низу, %
  var setSlit = function () { bg.style.clipPath = "inset(" + slit.v + "% 0 " + slit.v + "% 0)"; };
  setSlit();
  gsap.set(img, { scale: 1.38, filter: "brightness(.2) saturate(.5) blur(6px)" });
  gsap.set(".pre__logo", { xPercent: -50, yPercent: -100, opacity: 0, filter: "blur(10px)", y: 12 });
  gsap.set(".ch", { yPercent: 118, rotate: 7, transformOrigin: "0% 100%" });
  gsap.set(".hdr > *", { y: -24, opacity: 0 });
  gsap.set(".mid__rule", { scaleX: 0 });
  gsap.set([".mid__intro p", ".mid__label"], { y: 14, opacity: 0 });
  gsap.set(".wd", { y: 22, opacity: 0, filter: "blur(8px)" });
  gsap.set(".mid__cta", { scale: .6, opacity: 0, transformOrigin: "100% 50%" });
  gsap.set(".badge", { scale: .3, rotate: -160, opacity: 0 });
  root.classList.remove("intro");

  var countEl = document.querySelector(".pre__count span");
  var counter = { v: 0 };
  var pad = function (n) { return ("00" + Math.round(n)).slice(-3); };

  // 3. Чекаємо фото й шрифти (не довше 3 с), щоб «розкриття» було плавним
  var ready = Promise.race([
    Promise.all([img.decode ? img.decode().catch(function () {}) : 0, document.fonts ? document.fonts.ready : 0]),
    new Promise(function (r) { setTimeout(r, 3000); })
  ]);

  // Лічильник іде одразу, але на 100 стає лише коли все завантажено
  var loading = gsap.to(counter, { v: 86, duration: 1.6, ease: "power2.out", onUpdate: function () { countEl.textContent = pad(counter.v); } });
  gsap.to(".pre__logo", { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.1, ease: "power3.out" });
  gsap.to(".pre__line", { scaleX: 1, duration: 1.7, ease: "power3.inOut" });

  ready.then(function () { setTimeout(play, Math.max(0, 1700 - performance.now())); });

  function play() {
    loading.kill();
    var tl = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: idle });

    tl.to(counter, { v: 100, duration: .45, ease: "power2.out", onUpdate: function () { countEl.textContent = pad(counter.v); } })
      .to([".pre__count", ".pre__cap"], { yPercent: -40, opacity: 0, duration: .6, ease: "power3.in" }, "+=.1")
      .to(".pre__logo", { opacity: 0, filter: "blur(8px)", y: -16, duration: .5, ease: "power2.in" }, "<")

      // Лінія світла розходиться — кадр «відкривається», як повіки
      .addLabel("open", "-=.1")
      .to(slit, { v: 0, duration: 1.7, ease: "expo.inOut", onUpdate: setSlit, onComplete: function () { bg.style.clipPath = ""; } }, "open")
      .to(".pre__line", { scaleY: 3, opacity: 0, duration: 1.2, ease: "power2.inOut" }, "open+=.3")
      .to(img, { scale: 1.06, duration: 3.2, ease: "expo.out" }, "open")
      // «Вмикається світло» у місті
      .to(img, { filter: "brightness(1) saturate(1) blur(0px)", duration: 2.2, ease: "power2.inOut" }, "open+=.3")
      .fromTo(".hero__sweep", { xPercent: -55, opacity: 1 }, { xPercent: 55, duration: 2.1, ease: "power2.inOut" }, "open+=.9")
      .set(".hero__sweep", { opacity: 0 })

      // Заголовок: літери піднімаються одна за одною
      .addLabel("type", "open+=1.15")
      .to(".w1 .ch", { yPercent: 0, rotate: 0, duration: 1.4, stagger: .045 }, "type")
      .to(".w2 .ch", { yPercent: 0, rotate: 0, duration: 1.4, stagger: .045 }, "type+=.18")
      .to(".w3 .ch", { yPercent: 0, rotate: 0, duration: 1.4, stagger: .045 }, "type+=.32")

      // Інтерфейс
      .addLabel("ui", "type+=.35")
      .to(".hdr > *", { y: 0, opacity: 1, duration: 1.1, stagger: .08 }, "ui")
      .to(".mid__rule", { scaleX: 1, duration: 1.4, ease: "expo.inOut" }, "ui")
      .to([".mid__intro p", ".mid__label"], { y: 0, opacity: 1, duration: 1, stagger: .1 }, "ui+=.35")
      .to(".wd", { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.1, stagger: .022 }, "ui+=.4")
      .to(".mid__cta", { scale: 1, opacity: 1, duration: 1, ease: "back.out(2)" }, "ui+=.8")
      .to(".badge", { scale: 1, rotate: 0, opacity: 1, duration: 1.6, ease: "expo.out" }, "ui+=.9")

      // Хвиля світла проходить по літерах заголовка
      .set(".title span", { overflow: "visible" }, "type+=1.5")
      .to(".ch", {
        keyframes: [
          { textShadow: "0 0 34px rgba(255,226,180,.95), 0 0 10px rgba(255,248,235,.9)", color: "#fff6e6", duration: .35, ease: "power2.out" },
          { textShadow: "0 0 0px rgba(255,226,180,0), 0 0 0px rgba(255,248,235,0)", color: "#ffffff", duration: .9, ease: "power2.inOut" }
        ],
        stagger: .05
      }, "type+=1.55");
  }

  // 4. «Жива» сцена: обертання бейджа, паралакс і світло за курсором
  function idle() {
    pre.remove();
    q(".ch").forEach(function (c) { c.style.textShadow = ""; c.style.color = ""; });
    gsap.set(".wd", { clearProps: "filter,transform" });
    gsap.set(img, { filter: "none" });
    document.querySelector(".badge svg").style.setProperty("--spin", "running");

    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var glow = document.querySelector(".hero__glow");
    var gx = gsap.quickTo(glow, "x", { duration: .9, ease: "power3.out" });
    var gy = gsap.quickTo(glow, "y", { duration: .9, ease: "power3.out" });
    var ix = gsap.quickTo(img, "x", { duration: 1.6, ease: "power3.out" });
    var iy = gsap.quickTo(img, "y", { duration: 1.6, ease: "power3.out" });
    var words = [".w1", ".w2", ".w3"].map(function (s, i) {
      var el = document.querySelector(s), k = [10, -16, 22][i];
      return { x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3.out" }), k: k };
    });

    gsap.to(glow, { opacity: .85, duration: 1.2 });
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      gx(e.clientX - r.left); gy(e.clientY - r.top);
      ix(nx * -26); iy(ny * -18);
      words.forEach(function (w) { w.x(nx * w.k); });
    });
    hero.addEventListener("pointerleave", function () { gsap.to(glow, { opacity: 0, duration: .8 }); });
    hero.addEventListener("pointerenter", function () { gsap.to(glow, { opacity: .85, duration: .8 }); });
  }
})();
