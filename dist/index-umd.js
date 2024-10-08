(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.addMillerColumnPlugin = factory());
})(this, (function () { 'use strict';

  /**
   * @param {string|string[]} stylesheets
   * @param {{
   *   before?: HTMLElement,
   *   after?: HTMLElement,
   *   favicon?: boolean,
   *   image?: boolean,
   *   canvas?: boolean,
   *   acceptErrors?: boolean|((info: {
   *     error: ErrorEvent,
   *     stylesheetURL: string,
   *     options: {},
   *     resolve: (value: any) => void,
   *     reject: (reason?: any) => void
   *   }) => (reason?: any) => void)
   * }} cfg
   * @returns {Promise<HTMLLinkElement[]>}
   */
  function loadStylesheets(stylesheets, {
    before: beforeDefault,
    after: afterDefault,
    favicon: faviconDefault,
    canvas: canvasDefault,
    image: imageDefault = true,
    acceptErrors
  } = {}) {
    stylesheets = Array.isArray(stylesheets) ? stylesheets : [stylesheets];

    /**
     * @typedef {{
     *   before?: HTMLElement,
     *   after?: HTMLElement,
     *   favicon?: boolean,
     *   image?: boolean,
     *   canvas?: boolean,
     * }} Options
     */

    /**
     * @param {string|[stylesheetURL: string, options: Options]} stylesheetURLInfo
     * @returns {Promise<HTMLLinkElement>}
     */
    function setupLink(stylesheetURLInfo) {
      /** @type {Options} */
      let options = {};

      /** @type {string} */
      let stylesheetURL;
      if (Array.isArray(stylesheetURLInfo)) {
        [stylesheetURL, options = {}] = stylesheetURLInfo;
      } else {
        stylesheetURL = stylesheetURLInfo;
      }
      let {
        favicon = faviconDefault
      } = options;
      const {
        before = beforeDefault,
        after = afterDefault,
        canvas = canvasDefault,
        image = imageDefault
      } = options;
      function addLink() {
        if (before) {
          before.before(link);
        } else if (after) {
          after.after(link);
        } else {
          document.head.append(link);
        }
      }
      const link = document.createElement('link');

      // eslint-disable-next-line promise/avoid-new -- No native option
      return new Promise((resolve, reject) => {
        let rej = reject;
        if (acceptErrors) {
          rej = typeof acceptErrors === 'function' ? error => {
            acceptErrors({
              error,
              stylesheetURL,
              options,
              resolve,
              reject
            });
          } : resolve;
        }
        if (stylesheetURL.endsWith('.css')) {
          favicon = false;
        } else if (stylesheetURL.endsWith('.ico')) {
          favicon = true;
        }
        if (favicon) {
          link.rel = 'shortcut icon';
          link.type = 'image/x-icon';
          if (image === false) {
            link.href = stylesheetURL;
            addLink();
            resolve(link);
            return;
          }
          const cnv = document.createElement('canvas');
          cnv.width = 16;
          cnv.height = 16;
          const context = cnv.getContext('2d');
          const img = document.createElement('img');
          // eslint-disable-next-line promise/prefer-await-to-callbacks -- No API
          img.addEventListener('error', error => {
            reject(error);
          });
          img.addEventListener('load', () => {
            if (!context) {
              throw new Error('Canvas context could not be found');
            }
            context.drawImage(img, 0, 0);
            link.href = canvas ? cnv.toDataURL('image/x-icon') : stylesheetURL;
            addLink();
            resolve(link);
          });
          img.src = stylesheetURL;
          return;
        }
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = stylesheetURL;
        addLink();
        // eslint-disable-next-line promise/prefer-await-to-callbacks -- No API
        link.addEventListener('error', error => {
          rej(error);
        });
        link.addEventListener('load', () => {
          resolve(link);
        });
      });
    }
    return Promise.all(stylesheets.map(stylesheetURL => setupLink(stylesheetURL)));
  }

  /* eslint-disable no-unused-vars -- Convenient */
  /**
   * MIT License.
   *
   * @copyright 2014 White Magic Software, Inc.
   * @copyright 2018 Brett Zamir
   */


  // Todo: Replace the `moduleURL` with `import.meta` `moduleURL` once
  //  implemented; https://github.com/tc39/proposal-import-meta
  const moduleURL = new URL('node_modules/miller-columns/src/index.js', location);
  const defaultCSSURL = new URL('../miller-columns.css', moduleURL).href;

  /**
   * @param {string} s
   * @returns {string}
   */
  function escapeRegex(s) {
    return s.replaceAll(/[-[\]{}()*+?.,\\^$|#\s]/g, String.raw`\$&`);
  }

  /**
  * @external jQuery
  */

  /**
   * @param {jQuery} $
   * @param {PlainObject} cfg
   * @param {string} cfg.namespace
   * @param {string[]} cfg.stylesheets
   * @returns {jQuery}
   */
  async function addMillerColumnPlugin($, {
    namespace = 'miller',
    stylesheets = ['@default']
  } = {}) {
    let settings;
    const columnSelector = `ul:not(.${namespace}-no-columns),ol:not(.${namespace}-no-columns)`;
    const itemSelector = 'li';
    if (stylesheets) {
      await loadStylesheets(stylesheets.map(s => {
        return s === '@default' ? defaultCSSURL : s;
      }));
    }

    /**
     * Returns a list of the currently selected items.
     * @returns {jQuery}
     */
    function chain() {
      return $(`.${namespace}-column > .${namespace}-selected`);
    }

    /**
     * Add the breadcrumb path using the chain of selected items.
     * @returns {void}
     */
    function breadcrumb() {
      const $breadcrumb = $(`.${namespace}-breadcrumbs`).empty();
      chain().each(function () {
        const $crumb = $(this);
        $(`<span class="${namespace}-breadcrumb">`).text($crumb.text().trim()).click(function () {
          $crumb.click();
        }).appendTo($breadcrumb);
      });
    }

    /**
    * Ensure the viewport shows the entire newly expanded item.
    *
    * @param {jQuery} $column
    * @param {jQuery} $columns
    * @returns {void}
    */
    function animation($column, $columns) {
      let width = 0;
      chain().not($column).each(function () {
        width += $(this).outerWidth(true);
      });
      $columns.stop().animate({
        scrollLeft: width
      }, settings.delay, function () {
        // Why isn't this working when we instead use this `last` on the `animate` above?
        const last = $columns.find(`.${namespace}-column:not(.${namespace}-collapse)`).last();
        // last[0].scrollIntoView(); // Scrolls vertically also unfortunately
        last[0].scrollLeft = width;
        if (settings.scroll) {
          settings.scroll.call(this, $column, $columns);
        }
      });
    }

    /**
    * Convert nested lists into columns using breadth-first traversal.
    *
    * @param {jQuery} $columns
    * @returns {void}
    */
    function unnest($columns) {
      const queue = [];
      let $node;

      // Push the root unordered list item into the queue.
      queue.push($columns.children());
      while (queue.length) {
        $node = queue.shift();
        $node.children(itemSelector).each(function (item, el) {
          const $this = $(this);
          const $child = $this.children(columnSelector),
            $ancestor = $this.parent().parent();

          // Retain item hierarchy (because it is lost after flattening).
          // eslint-disable-next-line eqeqeq, no-eq-null -- Check either without duplication
          if ($ancestor.length && $this.data(`${namespace}-ancestor`) == null) {
            // Use addBack to reset all selection chains.
            $(this).siblings().addBack().data(`${namespace}-ancestor`, $ancestor);
          }
          if ($child.length) {
            queue.push($child);
            $(this).data(`${namespace}-child`, $child).addClass(`${namespace}-parent`);
          }

          // Causes item siblings to have a flattened DOM lineage.
          $(this).parent(columnSelector).appendTo($columns).addClass(`${namespace}-column`);
        });
      }
    }

    /**
     * Hide columns (not the first).
     * @returns {void}
     */
    function collapse() {
      $(`.${namespace}-column:gt(0)`).addClass(`${namespace}-collapse`);
    }

    /**
     * Returns the last selected item (i.e., the current cursor).
     * @returns {jQuery}
     */
    function current() {
      return chain().last();
    }

    /**
     * @param {jQuery} $columns
     * @returns {void}
     */
    function scrollIntoView($columns) {
      animation(null, $columns);
    }

    /**
     * @param {jQuery} $columns
     * @returns {void}
     */
    function userReset($columns) {
      reset($columns);
      scrollIntoView($columns);
    }

    /**
    * Hide columns (not the first), remove selections, update breadcrumb.
    *
    * @param {jQuery} $columns
    * @returns {void}
    */
    function reset($columns) {
      collapse();
      chain().removeClass(`${namespace}-selected`);
      breadcrumb();

      // Upon reset ensure no value is returned to the calling code.
      settings.reset($columns);
      if (settings.preview) {
        $(`.${namespace}-preview`).remove();
      }
    }

    /**
     * Select item above current selection.
     * @returns {void}
     */
    function moveU() {
      current().prev().click();
    }

    /**
     * Select item below current selection.
     * @returns {void}
     */
    function moveD() {
      current().next().click();
    }

    /**
     * Select item left of the current selection.
     * @returns {void}
     */
    function moveL() {
      const $ancestor = current().data(`${namespace}-ancestor`);
      if ($ancestor) {
        $ancestor.click();
      }
    }

    /**
     * Select item right of the current selection, or down if no right item.
     * @returns {void}
     */
    function moveR() {
      const $child = current().data(`${namespace}-child`);
      if ($child) {
        $child.children(itemSelector).first().click();
      } else {
        moveD();
      }
    }

    /**
    * @callback MillerColumnsKeyPress
    * @param {Event} e
    * @returns {void}
    */

    /**
     * @param {jQuery} $columns
     * @returns {MillerColumnsKeyPress}
     */
    function getKeyPress($columns) {
      let buffer = '';
      let lastTime;
      /**
       * @param {string} key
       * @returns {void}
       */
      function checkLastPressed(key) {
        const currTime = new Date();
        if (!lastTime || currTime - lastTime < 500) {
          buffer += key;
        } else {
          buffer = key;
        }
        lastTime = currTime;
      }
      return function keypress(ev) {
        const {
          key
        } = ev;
        // Was an attempt made to move the currently selected item (the cursor)?
        let moved = false;
        switch (key) {
          case 'Escape':
            userReset($columns);
            break;
          case 'ArrowUp':
            moveU();
            moved = true;
            break;
          case 'ArrowDown':
            moveD();
            moved = true;
            break;
          case 'ArrowLeft':
            moveL();
            moved = true;
            break;
          case 'ArrowRight':
            moveR();
            moved = true;
            break;
          default:
            if (key.length === 1) {
              checkLastPressed(key);
              const matching = $columns.find(`${itemSelector}.${namespace}-selected`).last().siblings().filter(function () {
                return new RegExp('^' + escapeRegex(buffer), 'i').test($(this).text().trim());
              });
              matching.first().click();
            }
            moved = true;
            break;
        }

        // If no item is selected, then jump to the first item.
        if (moved && current().length === 0) {
          $(`.${namespace}-column`).first().children().first().click();
        }
        if (moved) {
          ev.preventDefault();
        }
      };
    }
    $.fn.millerColumns = function (options) {
      const defaults = {
        current($item) {/* */},
        reset($columns) {/* */},
        preview: null,
        breadcrumb,
        animation,
        delay: 500,
        resetOnOutsideClick: true
      };
      settings = $.extend(defaults, options);
      return this.each(function () {
        const $columns = $(this);
        unnest($columns);
        collapse();

        // Expand the requested child node on click.
        // eslint-disable-next-line unicorn/no-array-callback-reference -- jQuery
        $columns.find(itemSelector).on('click', function (ev) {
          const $this = $(this);
          reset($columns);
          const $child = $this.data(`${namespace}-child`);
          let $ancestor = $this;
          if ($child) {
            $child.removeClass(`${namespace}-collapse`).children().removeClass(`${namespace}-selected`);
          }

          // Reveal (uncollapse) all ancestors to the clicked item.
          while ($ancestor) {
            $ancestor.addClass(`${namespace}-selected`).parent().removeClass(`${namespace}-collapse`);
            $ancestor = $ancestor.data(`${namespace}-ancestor`);
          }
          settings.animation.call(this, $this, $columns);
          settings.breadcrumb.call(this);
          settings.current.call(this, $this, $columns);
          if (settings.preview) {
            const isFinalCol = $this.hasClass(`${namespace}-selected`) && !$this.hasClass(`${namespace}-parent`);
            if (isFinalCol) {
              const content = settings.preview.call(this, $this, $columns);
              $this.parent().parent().append(`<ul class="${namespace}-column ${namespace}-preview">
                                <li>${content}</li>
                            </ul>`);
            }
          }

          // Don't allow the underlying element
          // to receive the click event.
          ev.stopPropagation();
        });
        $columns.on('keydown', getKeyPress($columns));
        $columns.on('click', () => {
          if (settings.resetOnOutsideClick) {
            userReset($columns);
          }
        });

        // The last set of columns on the page receives focus.
        // $columns.focus();
      });
    };
    return $;
  }

  return addMillerColumnPlugin;

}));
