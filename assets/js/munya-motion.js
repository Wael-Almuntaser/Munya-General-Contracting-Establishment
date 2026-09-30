(function ($) {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    document.documentElement.classList.add("munya-motion-off");
  }

  /* Preloader — min 1.5s, progress bar */
  var $preloader = $("#munya-preloader");
  var start = Date.now();
  var minMs = 1500;
  var $bar = $preloader.find(".munya-preloader__bar");
  var progress = 0;
  var progressTimer = setInterval(function () {
    progress = Math.min(progress + 4 + Math.random() * 8, 92);
    $bar.css("width", progress + "%");
  }, 80);

  function hidePreloader() {
    clearInterval(progressTimer);
    $bar.css("width", "100%");
    setTimeout(function () {
      $preloader.addClass("is-done");
      $("body").removeClass("munya-preloader-active");
    }, 280);
  }

  function tryHidePreloader() {
    var elapsed = Date.now() - start;
    var wait = Math.max(0, minMs - elapsed);
    setTimeout(hidePreloader, wait);
  }

  if ($preloader.length) {
    $("body").addClass("munya-preloader-active");
    if (document.readyState === "complete") {
      tryHidePreloader();
    } else {
      $(window).on("load", tryHidePreloader);
      setTimeout(tryHidePreloader, minMs + 800);
    }
  }

  /* Hero title word stagger */
  var $heroTitle = $("#munya-hero-title, .munya-hero__title").first();
  if ($heroTitle.length && !reducedMotion && !$heroTitle.find(".munya-hero-word").length) {
    var raw = $heroTitle.text().trim();
    var parts = raw.split(/(\s+)/);
    var html = "";
    var wordIndex = 0;
    parts.forEach(function (part) {
      if (/^\s+$/.test(part)) {
        html += '<span class="munya-hero-word munya-hero-word--gap" aria-hidden="true">&nbsp;</span>';
        return;
      }
      var delay = wordIndex * 0.1;
      html +=
        '<span class="munya-hero-word" style="animation-delay:' +
        delay +
        's">' +
        part +
        "</span>";
      wordIndex += 1;
    });
    $heroTitle.html(html);
  }

  /* Scroll progress */
  var $progressBar = $(".munya-scroll-progress__bar");
  function updateScrollProgress() {
    var doc = document.documentElement;
    var scrollTop = doc.scrollTop || document.body.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    var pct = height > 0 ? (scrollTop / height) * 100 : 0;
    $progressBar.css("width", pct + "%");
  }

  /* Parallax */
  var parallaxEls = document.querySelectorAll("[data-munya-parallax]");
  function updateParallax() {
    if (reducedMotion || !parallaxEls.length) {
      return;
    }
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) {
        return;
      }
      var strength = parseFloat(el.getAttribute("data-munya-parallax")) || 0.08;
      var offset = (rect.top + rect.height / 2 - vh / 2) * strength;
      el.style.transform = "translate3d(0, " + offset + "px, 0)";
    });
  }

  var scrollRaf = null;
  function onScrollMotion() {
    updateScrollProgress();
    if (scrollRaf) {
      return;
    }
    scrollRaf = window.requestAnimationFrame(function () {
      updateParallax();
      scrollRaf = null;
    });
  }

  $(window).on("scroll", onScrollMotion);
  updateScrollProgress();
  updateParallax();

  /* Intersection Observer — reveal once */
  if ("IntersectionObserver" in window && !reducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          var el = entry.target;
          el.classList.add("is-inview");
          revealObserver.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    document.querySelectorAll(".munya-reveal, .munya-reveal-media, .munya-heading-reveal").forEach(function (el) {
      revealObserver.observe(el);
    });

    /* Auto-setup sections */
    $("main section, .munya-about-wrap > section").each(function () {
      var $sec = $(this);
      if ($sec.hasClass("munya-hero") || $sec.hasClass("munya-reveal") || $sec.hasClass("munya-final-cta")) {
        return;
      }
      $sec.addClass("munya-reveal");

      var $head = $sec.find("h2, .munya-portfolio__title, .munya-contact__title").first();
      if ($head.length) {
        $head.addClass("munya-heading-reveal munya-gradient-text");
        revealObserver.observe($head[0]);
      }

      var staggerSelectors =
        ".munya-bento__tile, .munya-value-slide, .munya-service-card, .munya-project, .munya-cert-card, .munya-stats__item, .munya-contact-list li, .munya-reveal-stagger > *";
      var $items = $sec.find(staggerSelectors);
      $items.each(function (i) {
        $(this)
          .addClass("munya-reveal-item")
          .css("transition-delay", i * 0.07 + "s");
      });

      $sec.find(".munya-intro__media, .munya-about-asym__figure, .munya-bento__visual").addClass("munya-reveal-media");
      $sec.find(".munya-reveal-media").each(function () {
        revealObserver.observe(this);
      });

      revealObserver.observe($sec[0]);
    });
  } else {
    $(".munya-reveal, .munya-reveal-media, .munya-heading-reveal").addClass("is-inview");
  }

  /* Custom cursor */
  if (window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches && !reducedMotion) {
    var $cursor = $(".munya-cursor");
    var $dot = $(".munya-cursor-dot");
    if ($cursor.length) {
      $("body").addClass("munya-cursor-on");
      var cx = 0;
      var cy = 0;
      $(document).on("mousemove", function (e) {
        cx = e.clientX;
        cy = e.clientY;
        $cursor.css({ left: cx, top: cy });
        $dot.css({ left: cx, top: cy });
      });
      $(document).on("mouseenter", "a, button, .munya-project__link, input, select, textarea, label", function () {
        $("body").addClass("is-cursor-hover");
      });
      $(document).on("mouseleave", "a, button, .munya-project__link, input, select, textarea, label", function () {
        $("body").removeClass("is-cursor-hover");
      });
    }
  }

  /* Dark sections noise + mesh */
  $(".munya-stats, .footer.munya-footer--dark").addClass("munya-noise");
  $(".munya-section:not(.munya-hero)").slice(0, 6).addClass("munya-mesh-corner");
})(jQuery);
