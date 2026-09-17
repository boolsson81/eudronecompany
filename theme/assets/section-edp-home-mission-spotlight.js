/**
 * Tab behavior for the mission-spotlight section: clicking a pill swaps the
 * feature panel below instead of navigating away.
 */
(function () {
  'use strict';

  function activate(root, index) {
    var tabs = root.querySelectorAll('[data-mission-tab]');
    var panels = root.querySelectorAll('[data-mission-panel]');

    tabs.forEach(function (tab, i) {
      var selected = i === index;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach(function (panel, i) {
      if (i === index) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  function wireSection(root) {
    if (!root || root.dataset.missionWired === '1') return;
    root.dataset.missionWired = '1';

    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-mission-tab]'));
    if (!tabs.length) return;

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activate(root, index);
      });

      tab.addEventListener('keydown', function (event) {
        var nextIndex = null;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = tabs.length - 1;
        }

        if (nextIndex !== null) {
          event.preventDefault();
          activate(root, nextIndex);
          tabs[nextIndex].focus();
        }
      });
    });
  }

  function wireAll(scope) {
    var root = scope || document;
    var sections = root.querySelectorAll
      ? root.querySelectorAll('[data-mission-spotlight]')
      : [];
    Array.prototype.forEach.call(sections, wireSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      wireAll(document);
    });
  } else {
    wireAll(document);
  }

  document.addEventListener('shopify:section:load', function (event) {
    wireAll(event.target);
  });

  document.addEventListener('shopify:block:select', function (event) {
    var root = event.target.closest ? event.target.closest('[data-mission-spotlight]') : null;
    if (!root) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-mission-tab]'));
    var index = tabs.indexOf(event.target);
    if (index !== -1) activate(root, index);
  });
})();
