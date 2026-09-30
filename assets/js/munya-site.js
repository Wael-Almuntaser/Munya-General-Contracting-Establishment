(function ($) {
  "use strict";

  var $header = $(".munya-header");
  if ($header.length) {
    function updateHeader() {
      if ($(window).scrollTop() > 24) {
        $header.addClass("munya-header--scrolled");
      } else {
        $header.removeClass("munya-header--scrolled");
      }
    }
    updateHeader();
    $(window).on("scroll", updateHeader);
  }

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
  });

  if (window.location.hash === "#employees" || window.location.hash === "#management") {
    var hash = window.location.hash.replace("#", "");
    var $targetTab = $('[aria-controls="' + hash + '"]');
    if ($targetTab.length) {
      $targetTab.trigger("click");
    }
  }
})(jQuery);
