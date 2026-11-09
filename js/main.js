/* PROSERV SERVIÇOS — interações e animações */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  document.body.classList.add("is-loading");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- config (contatos) ---------- */
  var cfg = window.PROSERV_CONFIG || {};
  var digits = String(cfg.whatsapp || "").replace(/\D/g, "");
  var derived = {
    phoneDisplay: cfg.phoneDisplay,
    phoneHref: digits ? "https://wa.me/" + digits : "#contato",
    whatsHref: digits ? "https://wa.me/" + digits : "#contato",
    email: cfg.email,
    emailHref: cfg.email ? "mailto:" + cfg.email : "#contato",
    address: cfg.address,
    cnpjLine: cfg.cnpj ? " · CNPJ " + cfg.cnpj : ""
  };
  $$("[data-config]").forEach(function (el) { var v = derived[el.dataset.config]; if (v !== undefined && v !== null) el.textContent = v; });
  $$("[data-href]").forEach(function (el) { var v = derived[el.dataset.href]; if (v) el.setAttribute("href", v); if (v === "#contato") el.removeAttribute("target"); });
  var ano = $("#ano"); if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- header, menu, progress ---------- */
  var header = $(".header"), progress = $(".scroll-progress"), wa = $(".wa-float"), lastY = 0;
  function onScroll() {
    var y = window.scrollY, max = document.body.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", y > 30);
    header.classList.toggle("is-hidden", y > 500 && y > lastY && !doc.classList.contains("menu-open"));
    progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    wa.classList.toggle("is-in", y > 600);
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var burger = $(".burger");
  burger.addEventListener("click", function () {
    var open = doc.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  $$(".nav__link").forEach(function (a) { a.addEventListener("click", function () { doc.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); }); });

  // active link
  var links = $$(".nav__link");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + e.target.id); });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["inicio", "sobre", "servicos", "diferenciais", "segmentos", "contato"].forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });

  /* ---------- counters ---------- */
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    var end = +el.dataset.count, dur = reduce ? 0 : 1800, t0 = performance.now();
    (function tick(t) {
      var p = dur ? Math.min((t - t0) / dur, 1) : 1;
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  var cio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } }); }, { threshold: .6 });
  $$("[data-count]").forEach(function (el) { cio.observe(el); });

  /* ---------- hero split words ---------- */
  $$("[data-split] .line").forEach(function (line) {
    var html = line.innerHTML.replace(/(<em>)?([^\s<]+)(<\/em>)?/g, function (m, a, w, b) { return '<span class="w">' + (a || "") + w + (b || "") + "</span>"; });
    line.innerHTML = html;
  });

  /* ---------- particles (hero) ---------- */
  (function particles() {
    var c = $(".hero__particles"); if (!c || reduce) return;
    var ctx = c.getContext("2d"), pts = [], W, H, dpr = Math.min(window.devicePixelRatio || 1, 2), mouse = { x: -999, y: -999 };
    function size() {
      W = c.offsetWidth; H = c.offsetHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(W * H / 22000); pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.6 + .4, red: Math.random() < .25 });
    }
    size(); window.addEventListener("resize", size);
    c.parentElement.addEventListener("mousemove", function (e) { var r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    var visible = true;
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(c);
    (function loop() {
      requestAnimationFrame(loop); if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = p.red ? "rgba(217,20,30,.8)" : "rgba(242,242,244,.45)"; ctx.fill();
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], ex = p.x - q.x, ey = p.y - q.y, dd = ex * ex + ey * ey;
          if (dd < 11000) { ctx.strokeStyle = "rgba(242,242,244," + (0.08 * (1 - dd / 11000)) + ")"; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
      }
    })();
  })();

  /* ---------- card tilt + spotlight ---------- */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = "rotateX(" + ((.5 - y) * 8) + "deg) rotateY(" + ((x - .5) * 10) + "deg) translateZ(0)";
        card.style.setProperty("--mx", x * 100 + "%"); card.style.setProperty("--my", y * 100 + "%");
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
    $$(".magnetic").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * .25) + "px," + ((e.clientY - r.top - r.height / 2) * .35) + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- form → WhatsApp / e-mail ---------- */
  var form = $("#form-orcamento");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    $$("[required]", form).forEach(function (f) {
      var bad = !f.value.trim(); f.closest(".field").classList.toggle("is-invalid", bad); if (bad) ok = false;
    });
    var note = $(".form__note", form);
    if (!ok) { note.textContent = "Preencha os campos obrigatórios (*)."; return; }
    var d = new FormData(form);
    var msg = "Olá, Proserv! Gostaria de solicitar um orçamento.\n\n" +
      "Nome: " + d.get("nome") + "\n" + (d.get("empresa") ? "Empresa: " + d.get("empresa") + "\n" : "") +
      "Telefone: " + d.get("telefone") + "\n" + (d.get("email") ? "E-mail: " + d.get("email") + "\n" : "") +
      "Serviço: " + d.get("servico") + "\n" + (d.get("mensagem") ? "\n" + d.get("mensagem") : "");
    if (digits) {
      window.open("https://wa.me/" + digits + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
      note.textContent = "Abrindo o WhatsApp com a sua mensagem…";
    } else if (cfg.email) {
      window.location.href = "mailto:" + cfg.email + "?subject=" + encodeURIComponent("Solicitação de orçamento — " + d.get("nome")) + "&body=" + encodeURIComponent(msg);
      note.textContent = "Abrindo o seu e-mail com a mensagem pronta…";
    }
  });
  $$(".field input, .field select", form).forEach(function (f) { f.addEventListener("input", function () { f.closest(".field").classList.remove("is-invalid"); }); });

  /* ---------- GSAP motion ---------- */
  function intro() {
    var loader = $(".loader");
    loader.classList.add("is-done"); document.body.classList.remove("is-loading");
    if (!hasGsap || reduce) { $$(".reveal").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; }); return; }

    gsap.registerPlugin(ScrollTrigger);
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".hero__bg", { scale: 1.35, duration: 2.4, ease: "power2.out" }, 0)
      .from(".header", { yPercent: -100, opacity: 0, duration: 1 }, .2)
      .from(".hero__eyebrow", { x: -30, opacity: 0, duration: .8 }, .4)
      .from(".hero__title .w", { yPercent: 110, rotate: 4, duration: 1.1, stagger: .08 }, .45)
      .from(".hero__bar", { scaleX: 0, duration: .9 }, .95)
      .from(".hero__lead", { y: 24, opacity: 0, duration: .9 }, 1)
      .from(".hero__actions > *", { y: 24, opacity: 0, duration: .8, stagger: .1 }, 1.1)
      .from(".hero__scroll", { opacity: 0, duration: .8 }, 1.4);

    // shield draw
    $$(".hero__shield path").forEach(function (p, i) {
      var len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.6, delay: .6 + i * .5, ease: "power2.inOut" });
    });
    gsap.to(".hero__shield", { yPercent: -70, rotate: 6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    // hero parallax
    gsap.to(".hero__bg", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero__content", { yPercent: 25, opacity: .1, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

    // generic reveals (batched)
    ScrollTrigger.batch(".reveal", {
      start: "top 88%",
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: .09, overwrite: true }); }
    });
    $$(".bar").forEach(function (b) {
      if (b.classList.contains("hero__bar")) return;
      gsap.from(b, { scaleX: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: b, start: "top 90%" } });
    });

    // service cards
    gsap.from(".card", { y: 80, opacity: 0, rotateX: -12, duration: 1.1, ease: "power3.out", stagger: .12, scrollTrigger: { trigger: ".cards", start: "top 82%" } });

    // marquee speed + skew on scroll velocity
    var track = $(".marquee__track");
    ScrollTrigger.create({
      trigger: ".marquee", start: "top bottom", end: "bottom top",
      onUpdate: function (s) { var v = gsap.utils.clamp(-14, 14, s.getVelocity() / 140); gsap.to(track, { skewX: -v, duration: .4, overwrite: true }); }
    });
    gsap.fromTo(".marquee", { xPercent: 4 }, { xPercent: -4, ease: "none", scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: true } });

    // about: mask reveal + image parallax
    gsap.fromTo(".about__img", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.5, ease: "power4.inOut", scrollTrigger: { trigger: ".about__img", start: "top 80%" } });
    gsap.to(".about__img img", { yPercent: -12, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".about__badge", { scale: 0, rotate: -12, duration: 1, ease: "back.out(1.7)", scrollTrigger: { trigger: ".about__img", start: "top 60%" } });

    // lion watermark
    gsap.fromTo(".diffs__lion", { y: 120, rotate: -6 }, { y: -120, rotate: 4, ease: "none", scrollTrigger: { trigger: ".diffs", start: "top bottom", end: "bottom top", scrub: true } });

    // process line
    gsap.to(".process__line i", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".process__track", start: "top 75%", end: "bottom 55%", scrub: .6 } });
    gsap.from(".step__dot", { scale: 0, duration: .7, ease: "back.out(2)", stagger: .2, scrollTrigger: { trigger: ".process__track", start: "top 78%" } });

    // segments wave
    gsap.from(".seg .ico", { y: 20, opacity: 0, duration: .8, stagger: .08, ease: "power3.out", scrollTrigger: { trigger: ".segments__grid", start: "top 85%" } });

    // cta icon
    gsap.fromTo(".cta__icon", { rotate: -20, scale: .7 }, { rotate: 0, scale: 1, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "center center", scrub: true } });
  }

  if (document.readyState === "complete") setTimeout(intro, 350);
  else window.addEventListener("load", function () { setTimeout(intro, 350); });
  setTimeout(function () { if (!$(".loader").classList.contains("is-done")) intro(); }, 4000);
})();
