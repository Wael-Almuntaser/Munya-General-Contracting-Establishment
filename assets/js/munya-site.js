(function () {
  "use strict";
  document.documentElement.setAttribute("data-bs-theme", "light");
  try {
    localStorage.setItem("theme", "light");
  } catch (ignore) {}
})();

(function ($) {
  "use strict";

  var WA_PHONE = "966558533792";
  var WA_GREETING =
    "السلام عليكم، أرغب بالاستفسار عن خدمات المقاولات";

  function waUrl(text) {
    var base = "https://wa.me/" + WA_PHONE;
    if (!text) {
      return base;
    }
    return base + "?text=" + encodeURIComponent(text);
  }

  $(".munya-wa-link--prefill").each(function () {
    this.href = waUrl(WA_GREETING);
  });

  $(".munya-wa-link:not(.munya-wa-link--prefill)").each(function () {
    if (this.href.indexOf("text=") === -1) {
      this.href = waUrl(WA_GREETING);
    }
  });

  var $header = $(".munya-header");
  var $backTop = $("#munya-back-top");

  function onScrollUi() {
    var scrollTop = $(window).scrollTop();
    if ($header.length) {
      if (scrollTop > 24) {
        $header.addClass("munya-header--scrolled");
      } else {
        $header.removeClass("munya-header--scrolled");
      }
    }
    if ($backTop.length) {
      if (scrollTop > 420) {
        $backTop.removeAttr("hidden").addClass("is-visible");
      } else {
        $backTop.attr("hidden", true).removeClass("is-visible");
      }
    }
  }

  onScrollUi();
  $(window).on("scroll", onScrollUi);

  $backTop.on("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  $("[data-munya-tabs]").each(function () {
    var $root = $(this);
    var $tabs = $root.find("[data-munya-tab]");

    $tabs.on("click", function () {
      var $tab = $(this);
      var panelId = $tab.attr("aria-controls");
      if (!panelId) {
        return;
      }

      $tabs.attr("aria-selected", "false").attr("tabindex", "-1");
      $tab.attr("aria-selected", "true").attr("tabindex", "0");

      $root.find("[role=tabpanel]").attr("hidden", true);
      $("#" + panelId).removeAttr("hidden");
    });

    $tabs.on("keydown", function (ev) {
      var key = ev.key;
      if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Home" && key !== "End") {
        return;
      }
      ev.preventDefault();
      var $current = $tabs.filter('[aria-selected="true"]');
      var index = $tabs.index($current);
      if (key === "Home") {
        index = 0;
      } else if (key === "End") {
        index = $tabs.length - 1;
      } else if (key === "ArrowRight") {
        index = (index + 1) % $tabs.length;
      } else {
        index = (index - 1 + $tabs.length) % $tabs.length;
      }
      $tabs.eq(index).trigger("click").trigger("focus");
    });
  });

  if (window.location.hash === "#employees" || window.location.hash === "#management") {
    var hash = window.location.hash.replace("#", "");
    var $targetTab = $('[aria-controls="' + hash + '"]');
    if ($targetTab.length) {
      $targetTab.trigger("click");
    }
  }

  var $stats = $(".munya-stats");
  if ($stats.length && "IntersectionObserver" in window) {
    var statsAnimated = false;

    function animateCount($el) {
      var target = parseInt($el.attr("data-count"), 10);
      var suffix = $el.attr("data-suffix") || "";
      if (isNaN(target)) {
        return;
      }
      var duration = 1400;
      var start = null;

      function step(timestamp) {
        if (!start) {
          start = timestamp;
        }
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(target * eased);
        $el.text(value + suffix);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      }

      window.requestAnimationFrame(step);
    }

    var statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            $stats.find(".munya-count[data-count]").each(function () {
              animateCount($(this));
            });
            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );

    statsObserver.observe($stats[0]);
  }

  var $portfolioFilters = $(".munya-portfolio-filters");
  if ($portfolioFilters.length) {
    var $projects = $(".munya-project");
    var $empty = $("#munya-projects-empty");

    function applyPortfolioFilter(filter) {
      var visible = 0;
      $projects.each(function () {
        var $item = $(this);
        var cat = $item.attr("data-category");
        var show = filter === "all" || cat === filter;
        $item.toggleClass("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });
      if ($empty.length) {
        $empty.prop("hidden", visible > 0);
      }
    }

    $portfolioFilters.on("click", ".munya-portfolio-filters__btn", function () {
      var $btn = $(this);
      var filter = $btn.attr("data-filter");

      $portfolioFilters.find(".munya-portfolio-filters__btn").removeClass("is-active").attr("aria-selected", "false");
      $btn.addClass("is-active").attr("aria-selected", "true");

      applyPortfolioFilter(filter);
    });

    $portfolioFilters.on("keydown", ".munya-portfolio-filters__btn", function (ev) {
      var $buttons = $portfolioFilters.find(".munya-portfolio-filters__btn");
      var index = $buttons.index(this);
      if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
        ev.preventDefault();
        var next =
          ev.key === "ArrowRight"
            ? (index + 1) % $buttons.length
            : (index - 1 + $buttons.length) % $buttons.length;
        $buttons.eq(next).trigger("click").trigger("focus");
      }
    });
  }

  if ($.fn.magnificPopup && $(".munya-project-gallery").length) {
    $(".munya-project-gallery").magnificPopup({
      type: "image",
      mainClass: "mfp-fade",
      removalDelay: 200,
      gallery: {
        enabled: true,
        navigateByImgClick: true,
        preload: [0, 1],
      },
      image: {
        titleSrc: function (item) {
          return item.el.attr("title") || "";
        },
      },
      zoom: {
        enabled: true,
        duration: 300,
      },
    });
  }
})(jQuery);
