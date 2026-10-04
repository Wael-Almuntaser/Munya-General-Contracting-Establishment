/**
 * Dekor & Gypsum section — Vanilla JS
 * Lightbox, video fullscreen, tabs, lazy images, scroll reveal, parallax
 */
(function () {
  "use strict";

  var section = document.getElementById("dekor-gypsum");
  if (!section) {
    return;
  }

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Lazy load gallery images ── */
  section.querySelectorAll(".dekor-gallery-btn__img").forEach(function (img) {
    if (img.complete && img.naturalWidth) {
      img.classList.add("is-loaded");
    } else {
      img.addEventListener("load", function () {
        img.classList.add("is-loaded");
      });
    }
  });

  /* ── Tabs (filter captions / panel highlight) ── */
  var tabs = section.querySelectorAll(".dekor-tabs__btn");
  var tabPanels = section.querySelectorAll("[data-dekor-panel]");
  tabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-dekor-tab");
      tabs.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      tabPanels.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-dekor-panel") !== id;
      });
    });
  });

  /* ── Inline video + fullscreen modal ── */
  var frame = section.querySelector(".dekor-video-frame");
  var inlineVideo = section.querySelector(".dekor-video--inline");
  var playBtn = section.querySelector(".dekor-video__play");
  var videoModal = document.getElementById("dekor-video-modal");
  var modalVideo = videoModal && videoModal.querySelector(".dekor-video-modal__video");
  var modalClose = videoModal && videoModal.querySelector(".dekor-video-modal__close");

  var tryPlay = function () {};

  if (inlineVideo) {
    inlineVideo.muted = true;
    inlineVideo.loop = true;
    inlineVideo.playsInline = true;
    inlineVideo.setAttribute("playsinline", "");
    tryPlay = function () {
      var p = inlineVideo.play();
      if (p && p.catch) {
        p.catch(function () {});
      }
    };
    if ("IntersectionObserver" in window) {
      var vidObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              tryPlay();
              frame && frame.classList.add("is-playing");
            } else {
              inlineVideo.pause();
            }
          });
        },
        { threshold: 0.35 }
      );
      vidObs.observe(inlineVideo);
    } else {
      tryPlay();
    }
  }

  function openVideoModal() {
    if (!videoModal || !modalVideo) {
      return;
    }
    modalVideo.src = inlineVideo ? inlineVideo.querySelector("source").src : modalVideo.src;
    modalVideo.currentTime = inlineVideo ? inlineVideo.currentTime : 0;
    modalVideo.muted = false;
    modalVideo.controls = true;
    modalVideo.loop = false;
    videoModal.classList.add("is-open");
    videoModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalVideo.play();
  }

  function closeVideoModal() {
    if (!videoModal || !modalVideo) {
      return;
    }
    modalVideo.pause();
    videoModal.classList.remove("is-open");
    videoModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (inlineVideo) {
      inlineVideo.muted = true;
      tryPlay();
    }
  }

  if (playBtn) {
    playBtn.addEventListener("click", openVideoModal);
  }
  if (modalClose) {
    modalClose.addEventListener("click", closeVideoModal);
  }
  if (videoModal) {
    videoModal.addEventListener("click", function (e) {
      if (e.target === videoModal) {
        closeVideoModal();
      }
    });
  }

  /* ── Lightbox ── */
  var lightbox = document.getElementById("dekor-lightbox");
  var lbImg = lightbox && lightbox.querySelector(".dekor-lightbox__img");
  var lbCap = lightbox && lightbox.querySelector(".dekor-lightbox__cap");
  var lbClose = lightbox && lightbox.querySelector(".dekor-lightbox__close");
  var lbPrev = lightbox && lightbox.querySelector(".dekor-lightbox__nav--prev");
  var lbNext = lightbox && lightbox.querySelector(".dekor-lightbox__nav--next");
  var galleryBtns = section.querySelectorAll(".dekor-gallery-btn");
  var galleryItems = [];
  var lbIndex = 0;
  var seenGallery = Object.create(null);

  galleryBtns.forEach(function (btn) {
    var src = btn.getAttribute("data-full") || (btn.querySelector("img") && btn.querySelector("img").src);
    if (!src || seenGallery[src]) {
      return;
    }
    seenGallery[src] = true;
    galleryItems.push({
      src: src,
      cap: btn.getAttribute("data-caption") || "",
    });
    btn.addEventListener("click", function () {
      var idx = galleryItems.findIndex(function (item) {
        return item.src === src;
      });
      openLightbox(idx >= 0 ? idx : 0);
    });
  });

  function openLightbox(index) {
    if (!lightbox || !lbImg) {
      return;
    }
    lbIndex = index;
    renderLightbox();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lbClose && lbClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) {
      return;
    }
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function renderLightbox() {
    var item = galleryItems[lbIndex];
    if (!item) {
      return;
    }
    lbImg.src = item.src;
    lbImg.alt = item.cap;
    if (lbCap) {
      lbCap.textContent = item.cap;
    }
  }

  function lbStep(dir) {
    lbIndex = (lbIndex + dir + galleryItems.length) % galleryItems.length;
    renderLightbox();
  }

  if (lbClose) {
    lbClose.addEventListener("click", closeLightbox);
  }
  if (lbPrev) {
    lbPrev.addEventListener("click", function () {
      lbStep(-1);
    });
  }
  if (lbNext) {
    lbNext.addEventListener("click", function () {
      lbStep(1);
    });
  }
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!lightbox || !lightbox.classList.contains("is-open")) {
      if (e.key === "Escape" && videoModal && videoModal.classList.contains("is-open")) {
        closeVideoModal();
      }
      return;
    }
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      lbStep(1);
    } else if (e.key === "ArrowLeft") {
      lbStep(-1);
    }
  });

  /* Swipe lightbox */
  if (lightbox && "ontouchstart" in window) {
    var touchX = 0;
    lightbox.addEventListener(
      "touchstart",
      function (e) {
        touchX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      "touchend",
      function (e) {
        var dx = e.changedTouches[0].screenX - touchX;
        if (Math.abs(dx) > 50) {
          lbStep(dx > 0 ? -1 : 1);
        }
      },
      { passive: true }
    );
  }

  /* ── Parallax video frame ── */
  if (frame && !prefersReduced) {
    window.addEventListener(
      "scroll",
      function () {
        var rect = frame.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.top < vh && rect.bottom > 0) {
          var p = (rect.top - vh * 0.5) * 0.04;
          frame.style.transform = "translate3d(0, " + p + "px, 0)";
        }
      },
      { passive: true }
    );
  }

  /* ── Scroll reveal + stagger steps ── */
  var revealEls = section.querySelectorAll(".dekor-reveal");
  var steps = section.querySelectorAll(".dekor-step");

  if ("IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) {
      revObs.observe(el);
    });

    var stepObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            steps.forEach(function (step, i) {
              window.setTimeout(function () {
                step.classList.add("is-visible");
              }, i * 120);
            });
            stepObs.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    if (steps.length) {
      stepObs.observe(steps[0].parentElement);
    }
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
    steps.forEach(function (step) {
      step.classList.add("is-visible");
    });
  }
})();
