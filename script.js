/* =====================================================
   جمعية أثر للديمقراطية والحوكمة - السلوك
   الفهرس: السنة · قائمة الجوال · التمرير · الظهور · المؤشر
   · النماذج · تبويبات لوحة التحكم
   ===================================================== */
"use strict";

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- السنة في التذييل ----- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ----- قائمة الجوال ----- */
  const menuBtn = $("#menuBtn");
  const nav = $("#nav");
  if (menuBtn && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
    };
    menuBtn.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setOpen(false);
        menuBtn.focus();
      }
    });
  }

  /* ----- ظل الرأس + زر الرجوع للأعلى ----- */
  const header = $(".header");
  const toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("show", y > 600);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" }));
  }

  /* ----- ظهور العناصر أثناء التمرير (يُعطَّل عند تقليل الحركة) ----- */
  if (!calm && "IntersectionObserver" in window) {
    const targets = $$(".section-head, .card, .tile, .cta-box, .form, .stat, .text-block > *, .two-cols h2, .app-sub");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("in");
        io.unobserve(el);
        // تنظيف بعد انتهاء الانتقال حتى لا تتعارض مع تأثيرات المرور
        setTimeout(() => {
          el.classList.remove("reveal", "in");
          el.style.transitionDelay = "";
        }, 1100);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    targets.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.matches(".card, .tile, .stat"));
      const index = siblings.indexOf(el);
      if (index > 0) el.style.transitionDelay = `${Math.min(index * 70, 350)}ms`;
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  /* ----- حركة خفيفة لتركيبة البصمة مع المؤشر ----- */
  const art = $("[data-parallax]");
  if (art && !calm && window.matchMedia("(hover: hover)").matches) {
    const hero = art.closest(".hero");
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      art.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      art.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  }

  /* ----- النماذج: التحقق ورسائل النجاح والخطأ ----- */
  const rules = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    tel: (v) => v.trim() === "" || /^[0-9+\-\s]{8,15}$/.test(v),
  };

  const validate = (field) => {
    const input = $("input, select, textarea", field);
    const error = $(".error", field);
    let ok = true;
    const value = input.value;
    if (input.required && value.trim() === "") ok = false;
    else if (rules[input.type] && !rules[input.type](value)) ok = false;
    else if (input.minLength > 0 && value !== "" && value.length < input.minLength) ok = false;
    else if (input.dataset.match) {
      const other = document.getElementById(input.dataset.match);
      if (other && value !== other.value) ok = false;
    }

    field.classList.toggle("invalid", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    if (error) {
      if (!ok) input.setAttribute("aria-describedby", error.id);
      else input.removeAttribute("aria-describedby");
    }
    return ok;
  };

  $$("form.form").forEach((form) => {
    const fields = $$(".field", form);
    const success = $(".success", form);

    fields.forEach((field) => {
      const input = $("input, select, textarea", field);
      input.addEventListener("blur", () => validate(field));
      input.addEventListener("input", () => {
        if (field.classList.contains("invalid")) validate(field);
        if (success) success.classList.remove("show");
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const invalid = fields.filter((field) => !validate(field));
      if (invalid.length) {
        $("input, select, textarea", invalid[0]).focus();
        return;
      }
      // لاحقاً: يُرسل النموذج إلى الباك اند (ASP.NET) هنا
      if (success) success.classList.add("show");
      form.reset();
    });
  });

  /* ----- تبويبات لوحة التحكم (مع التنقل بالأسهم) ----- */
  const tabs = $$('[role="tab"]');
  if (tabs.length) {
    const select = (tab, focus = false) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).classList.toggle("active", on);
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        const rtl = document.dir === "rtl" || document.documentElement.dir === "rtl";
        const next = rtl ? "ArrowLeft" : "ArrowRight";
        const prev = rtl ? "ArrowRight" : "ArrowLeft";
        let target = null;
        if (e.key === next) target = tabs[(i + 1) % tabs.length];
        else if (e.key === prev) target = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") target = tabs[0];
        else if (e.key === "End") target = tabs[tabs.length - 1];
        if (target) {
          e.preventDefault();
          select(target, true);
        }
      });
    });
  }

  /* ----- معرض الأنشطة: يقرأ gallery-data.js ويعرض ما فيه ----- */
  const stage = $("#galleryStage");
  const data = window.ATHAR_GALLERY;
  if (stage && Array.isArray(data) && data.length) {
    const esc = (t = "") => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    stage.innerHTML = data.map((it, i) => {
      const media = it.src
        ? `<img src="${esc(it.src)}" alt="${esc(it.alt)}" loading="${i ? "lazy" : "eager"}">`
        : `<div class="thumb cover wide" role="img" aria-label="مساحة مخصصة لصورة نشاط"></div>`;
      const title = it.href ? `<a href="${esc(it.href)}">${esc(it.title)}</a>` : esc(it.title);
      return `<figure class="slide${i ? "" : " active"}">${media}<figcaption><strong>${title}</strong><span>${esc(it.date)}</span></figcaption></figure>`;
    }).join("");

    const slides = $$(".slide", stage);
    const ctrl = $("#galleryCtrl");
    if (slides.length > 1 && ctrl) {
      ctrl.hidden = false;
      const dots = $("#gDots");
      let cur = 0;
      dots.innerHTML = slides.map((_, i) => `<button type="button" class="g-dot" aria-label="الصورة ${i + 1} من ${slides.length}"></button>`).join("");
      const dotEls = $$(".g-dot", dots);
      const show = (n) => {
        cur = (n + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle("active", i === cur));
        dotEls.forEach((d, i) => d.setAttribute("aria-current", String(i === cur)));
      };
      dotEls.forEach((d, i) => d.addEventListener("click", () => show(i)));
      $("#gPrev").addEventListener("click", () => show(cur - 1));
      $("#gNext").addEventListener("click", () => show(cur + 1));
      show(0);
    }
  }
})();
