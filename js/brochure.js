/**
 * Brochure (heroo.jpeg) — Vanilla JS
 * Lightbox + zoom, lazy load, optional GSAP ScrollTrigger parallax
 *
 * CDN (optional, in index.html):
 * - gsap@3.12.5 + ScrollTrigger — parallax on showcase frame only
 */
(function () {
  "use strict";

  var BROCHURE_SRC = "image/heroo.jpeg";
  var WA_SHARE =
    "https://wa.me/?text=" +
    encodeURIComponent("مؤسسة منئ للمقاولات العامة — اطلع على البروشور: ");

  var lightbox = document.getElementById("brochure-lightbox");
  if (!lightbox) {
    return;
  }

  var lbImg = lightbox.querySelector(".brochure-lightbox__img");
  var lbZoomIn = lightbox.querySelector("[data-brochure-zoom='in']");
  var lbZoomOut = lightbox.querySelector("[data-brochure-zoom='out']");
  var lbDownload = lightbox.querySelector("[data-brochure-download]");
  var lbClose = lightbox.querySelector(".brochure-lightbox__close");
  var lbStage = lightbox.querySelector(".brochure-lightbox__stage");

  var scale = 1;
  var minScale = 1;
  var maxScale = 3;
  var touchStartX = 0;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setScale(next) {
    scale = Math.min(maxScale, Math.max(minScale, next));
    if (lbImg) {
      lbImg.style.transform = "scale(" + scale + ")";
    }
    lightbox.setAttribute("data-zoom", String(Math.round(scale * 100)));
  }

  function openLightbox() {
    if (!lbImg) {
      return;
    }
    lbImg.src = BROCHURE_SRC;
    lbImg.alt = "بروشور مؤسسة منئ للمقاولات العامة — عرض كامل";
    setScale(1);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (lbClose) {
      lbClose.focus();
    }
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setScale(1);
  }

  document.querySelectorAll("[data-brochure-open]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openLightbox();
    });
  });

  if (lbClose) {
    lbClose.addEventListener("click", closeLightbox);
  }
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target === lbStage) {
      closeLightbox();
    }
  });

  if (lbZoomIn) {
    lbZoomIn.addEventListener("click", function () {
      setScale(scale + 0.25);
    });
  }
  if (lbZoomOut) {
    lbZoomOut.addEventListener("click", function () {
      setScale(scale - 0.25);
    });
  }

  if (lbDownload) {
    lbDownload.setAttribute("href", BROCHURE_SRC);
    lbDownload.setAttribute("download", "munya-brochure.jpeg");
  }

  var shareBtn = document.querySelector("[data-brochure-share]");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var url = WA_SHARE + encodeURIComponent(window.location.href.split("#")[0]);
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) {
      return;
    }
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "+" || e.key === "=") {
      setScale(scale + 0.25);
    } else if (e.key === "-") {
      setScale(scale - 0.25);
    }
  });

  if (lbStage) {
    lbStage.addEventListener(
      "wheel",
      function (e) {
        if (!lightbox.classList.contains("is-open") || !e.ctrlKey) {
          return;
        }
        e.preventDefault();
        setScale(scale + (e.deltaY < 0 ? 0.15 : -0.15));
      },
      { passive: false }
    );
  }

  lightbox.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );
  lightbox.addEventListener(
    "touchend",
    function (e) {
      if (scale > 1) {
        return;
      }
      var dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 60) {
        closeLightbox();
      }
    },
    { passive: true }
  );

  /* Lazy load brochure slices */
  if ("IntersectionObserver" in window) {
    var lazyObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          var img = entry.target;
          var src = img.getAttribute("data-src");
          if (src) {
            img.src = src;
            img.removeAttribute("data-src");
          }
          img.addEventListener("load", function () {
            img.classList.add("is-loaded");
          });
          lazyObs.unobserve(img);
        });
      },
      { rootMargin: "120px" }
    );
    document.querySelectorAll(".brochure-slice[data-src]").forEach(function (img) {
      lazyObs.observe(img);
    });
  } else {
    document.querySelectorAll(".brochure-slice[data-src]").forEach(function (img) {
      img.src = img.getAttribute("data-src");
      img.classList.add("is-loaded");
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".brochure-reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
    );
    revealEls.forEach(function (el) {
      revObs.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* GSAP parallax (optional) */
  if (!prefersReduced && window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    var frame = document.querySelector("[data-brochure-parallax]");
    if (frame) {
      window.gsap.to(frame, {
        y: -28,
        ease: "none",
        scrollTrigger: {
          trigger: frame,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }
  }
})();
