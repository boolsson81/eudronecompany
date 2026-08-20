/**
 * EuroDroneParts — single source of truth for --header-height
 */
(function () {
  'use strict';

  function getHeaderGroup() {
    return (
      document.getElementById('shopify-section-group-header-group') ||
      document.querySelector('.shopify-section-group.shopify-section-group-header-group')
    );
  }

  function updateHeaderHeight() {
    var headerGroup = getHeaderGroup();
    if (!headerGroup) return;

    document.documentElement.style.setProperty('--header-height', headerGroup.offsetHeight + 'px');
    document.body.classList.add('edp-header-fixed');
  }

  window.edpUpdateHeaderHeight = updateHeaderHeight;

  function isDesignMode() {
    return (
      (typeof Shopify !== 'undefined' && Shopify.designMode) ||
      document.documentElement.classList.contains('shopify-design-mode')
    );
  }

  function initFixedHeader() {
    var headerGroup = getHeaderGroup();
    if (!headerGroup || headerGroup.dataset.edpFixedHeaderBound === 'true') return;
    headerGroup.dataset.edpFixedHeaderBound = 'true';

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    window.addEventListener('orientationchange', updateHeaderHeight);
    document.addEventListener('shopify:section:load', updateHeaderHeight);
    document.addEventListener('shopify:section:reorder', updateHeaderHeight);

    if (typeof ResizeObserver !== 'undefined') {
      var observer = new ResizeObserver(updateHeaderHeight);
      observer.observe(headerGroup);
    }
  }

  function init() {
    if (!isDesignMode()) {
      initFixedHeader();
    }
  }

  updateHeaderHeight();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', function () {
    if (!isDesignMode()) {
      initFixedHeader();
    }
  });
})();
