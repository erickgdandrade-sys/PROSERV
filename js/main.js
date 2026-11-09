/* PROSERV SERVIÇOS — interações e animações */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
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

  /* ---------- particles (hero) - leve, so em telas grandes ---------- */
  (function particles() {
    var c = $(".hero__particles");
    if (!c) return;
    if (reduce || !window.matchMedia("(min-width: 1101px) and (hover: hover)").matches) { c.style.display = "none"; return; }
    var ctx = c.getContext("2d"), pts = [], W, H, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      W = c.offsetWidth; H = c.offsetHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(W * H / 40000); pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .15, vy: (Math.random() - .5) * .15, r: Math.random() * 1.4 + .4, red: Math.random() < .2 });
    }
    size(); window.addEventListener("resize", size);
    var visible = true;
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(c);
    (function loop() {
      requestAnimationFrame(loop); if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = p.red ? "rgba(217,20,30,.6)" : "rgba(242,242,244,.35)"; ctx.fill();
      }
    })();
  })();

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

  /* ---------- animacoes (suaves) ---------- */
  var started = false;
  function intro() {
    if (started) return; started = true;
    if (!hasGsap || reduce) { $$(".reveal").forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; }); return; }

    gsap.registerPlugin(ScrollTrigger);
    var tl = gsap.timeline({ defaults: { ease: "power2.out", duration: .7 } });
    tl.from(".hero__eyebrow", { y: 12, opacity: 0 }, 0)
      .from(".hero__title .w", { y: 20, opacity: 0, stagger: .05 }, .1)
      .from(".hero__bar", { scaleX: 0 }, .35)
      .from(".hero__lead", { y: 12, opacity: 0 }, .4)
      .from(".hero__actions > *", { y: 12, opacity: 0, stagger: .08 }, .5)
      .from(".hero__scroll", { opacity: 0 }, .7);

    // escudo desenhado uma vez, sem movimento na rolagem
    $$(".hero__shield path").forEach(function (p, i) {
      var len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.8, delay: .2 + i * .3, ease: "power1.inOut" });
    });

    // revelacoes ao rolar
    ScrollTrigger.batch(".reveal", {
      start: "top 92%", once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: .6, ease: "power2.out", stagger: .06, overwrite: true }); }
    });
    gsap.from(".card", { y: 24, opacity: 0, duration: .6, ease: "power2.out", stagger: .08, scrollTrigger: { trigger: ".cards", start: "top 90%", once: true } });
  }

  if (document.readyState !== "loading") intro();
  else document.addEventListener("DOMContentLoaded", intro);
  setTimeout(intro, 1500);
})();
