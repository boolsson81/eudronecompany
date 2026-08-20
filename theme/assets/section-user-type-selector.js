/**
 * Remove uniform image backgrounds (white or dark gray) for premium-dark cards.
 */
(function () {
  'use strict';

  var SELECTOR = '.user-type-card__image--dark-bg';
  var SAMPLE = 8;
  var MIN_REMOVAL_RATIO = 0.08;
  var MIN_EDGE_TRANSPARENT_RATIO = 0.55;

  function isEnabled(root) {
    var el = root && root.closest ? root.closest('[data-remove-background]') : null;
    if (!el && root && root.querySelector) {
      el = root.querySelector('[data-remove-background]');
    }
    if (!el) {
      el = document.querySelector('.user-type-selector[data-remove-background]');
    }
    return !el || el.getAttribute('data-remove-background') !== 'false';
  }

  function sampleBackgroundColor(data, width, height) {
    var rSum = 0;
    var gSum = 0;
    var bSum = 0;
    var count = 0;
    var band = Math.max(4, Math.min(SAMPLE, Math.floor(Math.min(width, height) * 0.1)));
    var x;
    var y;

    function addPixel(px, py) {
      if (px < 0 || py < 0 || px >= width || py >= height) return;
      var i = (py * width + px) * 4;
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
      count += 1;
    }

    for (x = 0; x < width; x += 1) {
      for (y = 0; y < band; y += 1) addPixel(x, y);
      for (y = height - band; y < height; y += 1) addPixel(x, y);
    }

    for (y = band; y < height - band; y += 1) {
      for (x = 0; x < band; x += 1) addPixel(x, y);
      for (x = width - band; x < width; x += 1) addPixel(x, y);
    }

    if (!count) return null;
    return {
      r: Math.round(rSum / count),
      g: Math.round(gSum / count),
      b: Math.round(bSum / count),
    };
  }

  function thresholdForBackground(bg) {
    var avg = (bg.r + bg.g + bg.b) / 3;
    if (avg >= 190) return 55;
    if (avg >= 80) return 40;
    return 24;
  }

  function isBackgroundPixel(r, g, b, bg, threshold) {
    var dr = Math.abs(r - bg.r);
    var dg = Math.abs(g - bg.g);
    var db = Math.abs(b - bg.b);
    if (dr > threshold || dg > threshold || db > threshold) return false;

    var spread = Math.max(r, g, b) - Math.min(r, g, b);
    var avg = (bg.r + bg.g + bg.b) / 3;

    if (avg >= 190) return spread < 90;
    if (avg >= 80) return spread < 65;
    return spread < 40;
  }

  function removeBackgroundPixels(data, width, height, bg, threshold) {
    var changed = 0;
    var i;

    for (i = 0; i < data.length; i += 4) {
      if (isBackgroundPixel(data[i], data[i + 1], data[i + 2], bg, threshold)) {
        if (data[i + 3] !== 0) {
          data[i + 3] = 0;
          changed += 1;
        }
      }
    }

    return changed;
  }

  function floodFillBackground(data, width, height, bg, threshold) {
    var total = width * height;
    var mask = new Uint8Array(total);
    var queue = new Int32Array(total);
    var head = 0;
    var tail = 0;
    var changed = 0;

    function enqueue(x, y) {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      var p = y * width + x;
      if (mask[p]) return;
      var i = p * 4;
      if (!isBackgroundPixel(data[i], data[i + 1], data[i + 2], bg, threshold)) {
        mask[p] = 2;
        return;
      }
      mask[p] = 1;
      queue[tail++] = p;
    }

    var x;
    var y;
    for (x = 0; x < width; x += 1) {
      enqueue(x, 0);
      enqueue(x, height - 1);
    }
    for (y = 0; y < height; y += 1) {
      enqueue(0, y);
      enqueue(width - 1, y);
    }

    while (head < tail) {
      var p = queue[head++];
      var i = p * 4;
      if (data[i + 3] === 0) continue;
      data[i + 3] = 0;
      changed += 1;
      x = p % width;
      y = (p / width) | 0;
      enqueue(x + 1, y);
      enqueue(x - 1, y);
      enqueue(x, y + 1);
      enqueue(x, y - 1);
    }

    return changed;
  }

  function measureRemoval(data, width, height) {
    var total = width * height;
    var transparent = 0;
    var edgeTransparent = 0;
    var edgeTotal = 0;
    var band = Math.max(3, Math.floor(Math.min(width, height) * 0.06));
    var x;
    var y;

    for (y = 0; y < height; y += 1) {
      for (x = 0; x < width; x += 1) {
        var i = (y * width + x) * 4;
        if (data[i + 3] < 20) {
          transparent += 1;
          if (x < band || y < band || x >= width - band || y >= height - band) {
            edgeTransparent += 1;
          }
        }
        if (x < band || y < band || x >= width - band || y >= height - band) {
          edgeTotal += 1;
        }
      }
    }

    return {
      transparentRatio: transparent / total,
      edgeTransparentRatio: edgeTotal ? edgeTransparent / edgeTotal : 0,
    };
  }

  function removalIsStrongEnough(metrics) {
    return (
      metrics.transparentRatio >= MIN_REMOVAL_RATIO ||
      metrics.edgeTransparentRatio >= MIN_EDGE_TRANSPARENT_RATIO
    );
  }

  function rememberOriginalSrc(img) {
    if (!img.dataset.edpOriginalSrc) {
      img.dataset.edpOriginalSrc = img.currentSrc || img.src;
    }
  }

  function clearProcessedState(img) {
    img.classList.remove('user-type-card__image--processed');
    if (img.dataset.edpDarkBgObjectUrl) {
      URL.revokeObjectURL(img.dataset.edpDarkBgObjectUrl);
      delete img.dataset.edpDarkBgObjectUrl;
    }
  }

  function applyProcessedImage(img, outputUrl) {
    rememberOriginalSrc(img);
    clearProcessedState(img);
    if (outputUrl.indexOf('blob:') === 0) {
      img.dataset.edpDarkBgObjectUrl = outputUrl;
    }
    img.src = outputUrl;
    img.classList.add('user-type-card__image--processed');
    img.classList.add('user-type-card__image--flash');
    window.setTimeout(function () {
      img.classList.remove('user-type-card__image--flash');
    }, 700);
  }

  function canvasToOutputUrl(canvas) {
    return new Promise(function (resolve) {
      if (canvas.toBlob) {
        canvas.toBlob(function (blob) {
          if (blob) {
            resolve(URL.createObjectURL(blob));
            return;
          }
          resolve(canvas.toDataURL('image/png'));
        }, 'image/png');
        return;
      }
      resolve(canvas.toDataURL('image/png'));
    });
  }

  function processWithCanvas(source, img) {
    return new Promise(function (resolve) {
      try {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ ok: false, reason: 'no_canvas' });
          return;
        }

        canvas.width = source.naturalWidth;
        canvas.height = source.naturalHeight;
        if (!canvas.width || !canvas.height) {
          resolve({ ok: false, reason: 'empty_image' });
          return;
        }

        ctx.drawImage(source, 0, 0);

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = new Uint8ClampedArray(imageData.data);
        var bg = sampleBackgroundColor(data, canvas.width, canvas.height);
        if (!bg) {
          resolve({ ok: false, reason: 'no_background_sample' });
          return;
        }

        var threshold = thresholdForBackground(bg);
        var globalChanged = removeBackgroundPixels(data, canvas.width, canvas.height, bg, threshold);
        var floodChanged = floodFillBackground(data, canvas.width, canvas.height, bg, threshold + 8);
        var metrics = measureRemoval(data, canvas.width, canvas.height);

        if (!removalIsStrongEnough(metrics)) {
          resolve({
            ok: false,
            reason: 'insufficient_removal',
            changed: globalChanged + floodChanged,
            metrics: metrics,
            bg: bg,
          });
          return;
        }

        ctx.putImageData(new ImageData(data, canvas.width, canvas.height), 0, 0);

        canvasToOutputUrl(canvas).then(function (outputUrl) {
          applyProcessedImage(img, outputUrl);
          resolve({
            ok: true,
            changed: globalChanged + floodChanged,
            metrics: metrics,
          });
        });
      } catch (e) {
        resolve({ ok: false, reason: 'canvas_error', error: e });
      }
    });
  }

  function loadViaImage(url, crossOrigin) {
    return new Promise(function (resolve, reject) {
      var loader = new Image();
      if (crossOrigin) loader.crossOrigin = crossOrigin;
      loader.decoding = 'async';
      loader.onload = function () {
        resolve(loader);
      };
      loader.onerror = reject;
      loader.src = url;
    });
  }

  function loadSource(url) {
    if (typeof fetch === 'function' && typeof createImageBitmap === 'function') {
      return fetch(url, { mode: 'cors', credentials: 'omit' })
        .then(function (res) {
          if (!res.ok) throw new Error('fetch failed');
          return res.blob();
        })
        .then(function (blob) {
          return createImageBitmap(blob);
        })
        .then(function (bitmap) {
          var canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(bitmap, 0, 0);
          bitmap.close();
          var out = new Image();
          out.src = canvas.toDataURL('image/png');
          return new Promise(function (resolve) {
            out.onload = function () {
              resolve(out);
            };
            out.onerror = function () {
              resolve(out);
            };
          });
        });
    }

    return loadViaImage(url, 'anonymous').catch(function () {
      return loadViaImage(url, false);
    });
  }

  function ensureImageReady(img) {
    return new Promise(function (resolve, reject) {
      if (img.complete && img.naturalWidth) {
        resolve(img);
        return;
      }
      img.addEventListener(
        'load',
        function () {
          resolve(img);
        },
        { once: true }
      );
      img.addEventListener(
        'error',
        function () {
          reject(new Error('image_load_failed'));
        },
        { once: true }
      );
    });
  }

  function restoreOriginalImage(img) {
    rememberOriginalSrc(img);
    clearProcessedState(img);
    if (img.dataset.edpOriginalSrc && img.src !== img.dataset.edpOriginalSrc) {
      img.src = img.dataset.edpOriginalSrc;
      return ensureImageReady(img);
    }
    return Promise.resolve(img);
  }

  function processImage(img, force) {
    rememberOriginalSrc(img);

    if (!force && img.classList.contains('user-type-card__image--processed')) {
      return Promise.resolve({ ok: true, skipped: true });
    }

    var run = function (source) {
      return processWithCanvas(source, img).then(function (result) {
        if (result.ok) return result;

        var url = img.dataset.edpOriginalSrc || img.currentSrc || img.src;
        if (!url || url.indexOf('blob:') === 0 || source !== img) return result;

        return loadSource(url).then(function (fetchedSource) {
          return processWithCanvas(fetchedSource, img);
        });
      });
    };

    if (force) {
      return restoreOriginalImage(img).then(function (readyImg) {
        return run(readyImg);
      });
    }

    return ensureImageReady(img).then(function (readyImg) {
      return run(readyImg);
    });
  }

  function boot(root) {
    bindEditorActions();
    wireEditorButtons(root || document);
  }

  function forceReprocess(root) {
    if (!isEnabled(root)) return Promise.resolve([]);

    var scope = root && root.querySelectorAll ? root : document;
    var images = Array.prototype.slice.call(scope.querySelectorAll(SELECTOR));
    if (!images.length) return Promise.resolve([]);

    return Promise.all(
      images.map(function (img) {
        return processImage(img, true).then(function (result) {
          if (result && !result.ok) {
            clearProcessedState(img);
          }
          return result;
        });
      })
    );
  }

  function findSectionRoot(node) {
    return (
      (node && node.closest && node.closest('.user-type-selector')) ||
      (node && node.querySelector && node.querySelector('.user-type-selector')) ||
      document.querySelector('.user-type-selector')
    );
  }

  function updateStatus(section, message, type) {
    if (!section) return;
    var el = section.querySelector('[data-edp-bg-status]');
    if (!el) return;
    el.hidden = false;
    el.textContent = message;
    el.className =
      'user-type-selector__editor-status user-type-selector__editor-status--' + (type || 'info');
  }

  function summarizeResults(results) {
    var ok = 0;
    var failed = 0;
    results.forEach(function (result) {
      if (result && result.ok && !result.skipped) ok += 1;
      else failed += 1;
    });
    return { ok: ok, failed: failed };
  }

  function setButtonBusy(btn, busy, busyLabel) {
    if (!btn) return;
    if (busy) {
      if (!btn.dataset.edpDefaultLabel) {
        btn.dataset.edpDefaultLabel = btn.textContent.trim();
      }
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.textContent = busyLabel || 'Tar bort bakgrund...';
      return;
    }

    btn.disabled = false;
    btn.removeAttribute('aria-busy');
    if (btn.dataset.edpDefaultLabel) {
      btn.textContent = btn.dataset.edpDefaultLabel;
    }
  }

  function handleEditorAction(btn) {
    if (!btn || btn.disabled || btn.getAttribute('aria-busy') === 'true') return;
    if (btn.dataset.edpActionLock === '1') return;
    btn.dataset.edpActionLock = '1';

    var release = function () {
      btn.dataset.edpActionLock = '0';
    };

    var section = findSectionRoot(btn);
    updateStatus(section, 'Bearbetar bilder...', 'info');

    if (btn.hasAttribute('data-edp-bg-refresh-card')) {
      var card = btn.closest('.user-type-card');
      var img = card ? card.querySelector(SELECTOR) : null;
      if (!img) {
        updateStatus(section, 'Ingen bild hittades på kortet.', 'error');
        release();
        return;
      }

      setButtonBusy(btn, true, 'Tar bort...');
      processImage(img, true)
        .then(function (result) {
          if (result && result.ok && !result.skipped) {
            updateStatus(section, 'Bakgrund borttagen på kortbilden.', 'success');
          } else {
            updateStatus(
              section,
              'Kunde inte ta bort bakgrunden automatiskt. Ladda upp en PNG utan bakgrund eller använd filterläget (lämna knappen av).',
              'error'
            );
          }
        })
        .catch(function () {
          updateStatus(section, 'Ett fel uppstod vid bildbearbetning.', 'error');
        })
        .finally(function () {
          setButtonBusy(btn, false);
          release();
        });
      return;
    }

    if (btn.hasAttribute('data-edp-bg-refresh')) {
      setButtonBusy(btn, true, 'Tar bort bakgrund...');
      forceReprocess(section || document)
        .then(function (results) {
          var summary = summarizeResults(results);
          if (summary.ok > 0 && summary.failed === 0) {
            updateStatus(
              section,
              'Bakgrund borttagen på ' + summary.ok + ' bild' + (summary.ok > 1 ? 'er' : '') + '.',
              'success'
            );
          } else if (summary.ok > 0) {
            updateStatus(
              section,
              summary.ok + ' bilder bearbetade. ' + summary.failed + ' kunde inte bearbetas fullt ut.',
              'warn'
            );
          } else if (summary.failed > 0 && summary.ok === 0) {
            var customImages = (section || document).querySelectorAll(SELECTOR).length;
            if (!customImages) {
              updateStatus(
                section,
                'Inga egna bilder att bearbeta. Standardkort använder transparenta temabilder.',
                'info'
              );
            } else {
              updateStatus(
                section,
                'Kunde inte ta bort bakgrunden automatiskt. Ladda upp PNG utan bakgrund för bäst resultat.',
                'error'
              );
            }
          }
        })
        .catch(function () {
          updateStatus(section, 'Ett fel uppstod vid bildbearbetning.', 'error');
        })
        .finally(function () {
          setButtonBusy(btn, false);
          release();
        });
      return;
    }

    release();
  }

  function wireEditorButtons(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('[data-edp-bg-refresh], [data-edp-bg-refresh-card]').forEach(function (btn) {
      if (btn.dataset.edpEditorWired === '1') return;
      btn.dataset.edpEditorWired = '1';

      ['pointerdown', 'mousedown', 'touchstart'].forEach(function (type) {
        btn.addEventListener(
          type,
          function (event) {
            event.stopPropagation();
            if (typeof event.stopImmediatePropagation === 'function') {
              event.stopImmediatePropagation();
            }
          },
          true
        );
      });

      btn.addEventListener(
        'click',
        function (event) {
          event.preventDefault();
          event.stopPropagation();
          if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
          }
          handleEditorAction(btn);
        },
        true
      );
    });
  }

  function bindEditorActions() {
    wireEditorButtons(document);
  }

  function boot(root) {
    init(root || document);
    bindEditorActions();
    wireEditorButtons(root || document);
  }

  window.edpUserTypeSelector = {
    onButtonClick: handleEditorAction,
    removeBackground: handleEditorAction,
    wireEditorButtons: wireEditorButtons,
    reprocessSection: function (root) {
      return forceReprocess(findSectionRoot(root) || document);
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      boot(document);
    });
  } else {
    boot(document);
  }

  document.addEventListener('shopify:section:load', function (event) {
    boot(event.target);
  });
})();
