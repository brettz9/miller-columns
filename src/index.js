/* eslint-disable no-unused-vars -- Convenient */
/**
 * MIT License.
 *
 * @copyright 2014 White Magic Software, Inc.
 * @copyright 2018 Brett Zamir
 */

import loadStylesheets from 'load-stylesheets';

/**
 * @typedef {{
 *   delay: JQuery.Duration | string,
 *   outsideClickBehavior: "reset"|"select-parent"|"none",
 *   breadcrumbRoot: string,
 *   breadcrumb: (this: HTMLElement, $columns?: JQuery<HTMLElement>) => void,
 *   current: (li: JQuery<HTMLLIElement>, $columns: JQuery<HTMLElement>) => void,
 *   preview: null|((li: JQuery<HTMLLIElement>, $columns: JQuery<HTMLElement>) => void),
 *   animation: (li: JQuery<HTMLLIElement>, $columns: JQuery<HTMLElement>) => void,
 *   reset: ($columns: JQuery<HTMLElement>) => void,
 *   scroll?: ($column: JQuery<HTMLElement>|null, $columns: JQuery<HTMLElement>) => void
 * }} Settings
 */

const defaultCSSURL = new URL('../miller-columns.css', import.meta.url).href;

/**
 * @param {string} s
 * @returns {string}
 */
function escapeRegex (s) {
  return s.replaceAll(/[\-\[\]\{\}\(\)*+?.,\\^$\|#\s]/gv, String.raw`\$&`);
}

/**
 * @param {jQuery} $
 * @param {object} cfg
 * @param {string} [cfg.namespace]
 * @param {Exclude<import('load-stylesheets').Stylesheets, string>} [cfg.stylesheets]
 * @returns {Promise<jQuery>}
 */
async function addMillerColumnPlugin ($, {namespace = 'miller', stylesheets = ['@default']} = {}) {
  /** @type {Settings} */
  let settings;
  const columnSelector = `ul:not(.${namespace}-no-columns),ol:not(.${namespace}-no-columns)`;
  const itemSelector = 'li';
  if (stylesheets) {
    await loadStylesheets(stylesheets.map((s) => {
      return s === '@default' ? defaultCSSURL : s;
    }));
  }

  /**
   * Returns a list of the currently selected items.
   * @returns {JQuery<HTMLElement>}
   */
  function chain () {
    return $(`.${namespace}-column > .${namespace}-selected`);
  }

  /**
   * Add the breadcrumb path using the chain of selected items.
   * @param {JQuery<HTMLElement>} [$columns] - Optional columns element for root link
   * @returns {void}
   */
  function breadcrumb ($columns) {
    const $breadcrumb = $(`.${namespace}-breadcrumbs`).empty();

    // Add root link if breadcrumbRoot option is set
    if (settings.breadcrumbRoot) {
      $(`<span class="${namespace}-breadcrumb ${namespace}-breadcrumb-root">`).
        text(settings.breadcrumbRoot).
        on('click', function () {
          if ($columns) {
            reset($columns);
            scrollIntoView($columns);
          }
        }).appendTo($breadcrumb);
    }

    chain().each(function () {
      const $crumb = $(this);
      $(`<span class="${namespace}-breadcrumb">`).
        text($crumb.text().trim()).
        on('click', function () {
          $crumb.trigger('click');
        }).appendTo($breadcrumb);
    });
  }

  /**
   * Ensure the viewport shows the entire newly expanded item.
   *
   * @param {JQuery<HTMLElement>|null} $column
   * @param {JQuery<HTMLElement>} $columns
   * @returns {void}
   */
  function animation ($column, $columns) {
    let width = 0;
    ($column ? chain().not($column) : chain()).each(function () {
      width += /** @type {number} */ ($(this).outerWidth(true));
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
   * @param {JQuery<HTMLElement>} $columns
   * @param {JQuery<HTMLElement>} [$startNode] - Optional starting node for partial unnesting
   * @returns {void}
   */
  function unnest ($columns, $startNode) {
    const queue = [];
    let $node;

    // Push the root unordered list item into the queue.
    queue.push($startNode || $columns.children());

    while (queue.length) {
      $node = /** @type {JQuery<HTMLElement>} */ (queue.shift());

      $node.children(itemSelector).each(function () {
        const $this = $(this);
        const $child = $this.children(columnSelector);
        const $ancestor = $this.parent().parent();

        // Retain item hierarchy (because it is lost after flattening).
        // Only set ancestor if it's actually a list item and not already set
        // eslint-disable-next-line eqeqeq, no-eq-null -- Check either without duplication
        if ($ancestor.length && $ancestor.is(itemSelector) && ($this.data(`${namespace}-ancestor`) == null)) {
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
  function collapse () {
    $(`.${namespace}-column:gt(0)`).addClass(`${namespace}-collapse`);
  }

  /**
   * Returns the last selected item (i.e., the current cursor).
   * @returns {JQuery<HTMLElement>}
   */
  function current () {
    return chain().last();
  }

  /**
   * @param {JQuery<HTMLElement>} $columns
   * @returns {void}
   */
  function scrollIntoView ($columns) {
    animation(null, $columns);
  }

  /**
   * @param {JQuery<HTMLElement>} $columns
   * @returns {void}
   */
  function userReset ($columns) {
    reset($columns);
    scrollIntoView($columns);
  }

  /**
   * Hide columns (not the first), remove selections, update breadcrumb.
   *
   * @param {JQuery<HTMLElement>} $columns
   * @returns {void}
   */
  function reset ($columns) {
    collapse();
    chain().removeClass(`${namespace}-selected`);
    breadcrumb($columns);

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
  function moveU () {
    const elem = current().prev();
    elem[0]?.scrollIntoView({block: 'nearest'});
    elem.trigger('click');
  }

  /**
   * Select item below current selection.
   * @returns {void}
   */
  function moveD () {
    const elem = current().next();
    elem[0]?.scrollIntoView({block: 'nearest', inline: 'start'});
    elem.trigger('click');
  }

  /**
   * Select item left of the current selection.
   * @returns {void}
   */
  function moveL () {
    const $current = current();
    const $ancestor = $current.data(`${namespace}-ancestor`);
    const $child = $current.data(`${namespace}-child`);

    // If current item has children and they are visible, but we're at root level,
    // do nothing - we're already on the parent and just expanded it
    if ($child && !$child.hasClass(`${namespace}-collapse`) && !$ancestor) {
      return;
    }

    // Move to ancestor if it exists
    if ($ancestor) {
      $ancestor[0]?.scrollIntoView({block: 'nearest'});
      $ancestor.trigger('click');
    }
  }

  /**
   * Select item right of the current selection, or down if no right item.
   * @returns {void}
   */
  function moveR () {
    const $child = current().data(`${namespace}-child`);

    if ($child) {
      const elem = $child.children(itemSelector).first();
      elem[0]?.scrollIntoView({block: 'nearest'});
      elem.trigger('click');
    } else {
      moveD();
    }
  }

  /**
   * @callback MillerColumnsKeyPress
   * @param {KeyboardEvent} e
   * @returns {void}
   */

  /**
   * @param {JQuery<HTMLElement>} $columns
   * @returns {MillerColumnsKeyPress}
   */
  function getKeyPress ($columns) {
    let buffer = '';
    /** @type {number} */
    let lastTime;

    /**
     * @param {string} key
     * @returns {void}
     */
    function checkLastPressed (key) {
      const currTime = Date.now();
      if (!lastTime || currTime - lastTime < 500) {
        buffer += key;
      } else {
        buffer = key;
      }
      lastTime = currTime;
    }

    return function keypress (ev) {
      // eslint-disable-next-line prefer-destructuring -- TS
      const key = /** @type {Event & {key: string}} */ (ev).key;
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
        if (!ev.metaKey && !ev.altKey) {
          if (key.length === 1) {
            checkLastPressed(key);
            const matching = $columns.
              find(`${itemSelector}.${namespace}-selected`).
              last().
              siblings().
              filter(function () {
                return new RegExp('^' + escapeRegex(buffer), 'iv').
                  test($(this).text().trim());
              });
            const elem = matching.first();
            elem[0]?.scrollIntoView({block: 'nearest'});
            elem.trigger('click');
          }
          moved = true;
        }
        break;
      }

      // If no item is selected, then jump to the first item.
      if (moved && (current().length === 0)) {
        $(`.${namespace}-column`).first().children().first().trigger('click');
      }

      if (moved) {
        ev.preventDefault();
      }
    };
  }

  /**
   * @param {Partial<Settings>} options
   */
  $.fn.millerColumns = function (options) {
    /** @type {Settings} */
    const defaults = {
      current ($item) { /* noop */ },
      reset ($columns) { /* noop */ },
      preview: null,
      breadcrumbRoot: 'Root',
      breadcrumb,
      animation,
      delay: 500,
      outsideClickBehavior: 'select-parent'
    };

    settings = $.extend(defaults, options);

    const $result = this.each(function () {
      const $columns = $(this);

      // Store original HTML for restoration
      const originalHTML = $columns.html();
      $columns.data(`${namespace}-original-html`, originalHTML);

      unnest($columns);
      collapse();
      breadcrumb($columns); // Initialize breadcrumbs with Root link

      // Store keypress handler for later removal
      const keypressHandler = getKeyPress($columns);

      // Expand the requested child node on click.
      // Use event delegation to handle dynamically added items
      $columns.on('click', itemSelector, function (ev) {
        const $this = $(this);
        reset($columns);

        const $child = $this.data(`${namespace}-child`);
        let $ancestor = $this;

        if ($child) {
          $child[0]?.scrollIntoView({block: 'nearest'});
          $child.removeClass(`${namespace}-collapse`).
            children().
            removeClass(`${namespace}-selected`);
        }

        // Reveal all ancestors
        while ($ancestor) {
          $ancestor.
            addClass(`${namespace}-selected`).
            parent().
            removeClass(`${namespace}-collapse`);
          $ancestor = $ancestor.data(`${namespace}-ancestor`);
        }

        settings.animation.call(this, $this, $columns);
        settings.breadcrumb.call(this, $columns);
        settings.current.call(this, $this, $columns);

        if (settings.preview) {
          const isFinalCol = $this.hasClass(`${namespace}-selected`) &&
            !$this.hasClass(`${namespace}-parent`);
          if (isFinalCol) {
            const content = settings.preview.call(this, $this, $columns);
            $this.parent().parent().append(
              `<ul class="${namespace}-column ${namespace}-preview">
                <li>${content}</li>
              </ul>`
            );
          }
        }

        // Don't allow the underlying element
        // to receive the click event.
        ev.stopPropagation();
      });

      $columns[0].addEventListener('keydown', keypressHandler);

      $columns.on('click', (e) => {
        switch (settings.outsideClickBehavior) {
        case 'reset':
          userReset($columns);
          break;
        case 'select-parent': {
          const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
          const node = caretPosition?.offsetNode;
          let elem = /** @type {Element|null} */ (node?.nodeType === 1 ? node : node?.parentElement);
          while (elem) {
            if (elem.matches(`ul.${namespace}-column:not(.${namespace}-collapse)`)) {
              $(elem).prevAll(
                `ul.${namespace}-column:not(.${namespace}-collapse)`
              ).first().find(`li.${namespace}-selected`).trigger('click');
              break;
            }
            elem = elem.parentElement;
          }
          break;
        }
        default:
          break;
        }
      });

      // Store handler reference for cleanup
      $columns.data(`${namespace}-keypress-handler`, keypressHandler);

      // The last set of columns on the page receives focus.
      // $columns.focus();
    });

    /**
     * Add a new item dynamically to the miller columns structure.
     * The item can contain nested lists which will be automatically unnested.
     *
     * @param {string|JQuery<HTMLLIElement>} item - HTML string or jQuery element for the new list item
     * @param {JQuery<HTMLLIElement>} [$parent] - Optional parent item to add this as a child.
     *                                             If not provided, adds to root level.
     * @returns {JQuery<HTMLLIElement>} The newly added item
     */
    $result.addItem = function (item, $parent) {
      const $item = /** @type {JQuery<HTMLLIElement>} */ (typeof item === 'string' ? $(item) : item);
      const $columns = $result;

      if (!$parent) {
        // Add to root level (first column)
        const $rootColumn = $columns.find(`.${namespace}-column`).first();

        if ($rootColumn.length) {
          // Append to existing root column
          $rootColumn.append($item);

          // If the item has nested children, process them
          const $child = $item.children(columnSelector);
          if ($child.length) {
            // Set up the parent-child relationship
            $item.data(`${namespace}-child`, $child).addClass(`${namespace}-parent`);
            // Process the child list to unnest it
            unnest($columns, $child);
          }
        } else {
          // No columns exist yet, create initial structure
          const $tempWrapper = $('<ul>').append($item);
          $columns.append($tempWrapper);
          unnest($columns, $tempWrapper);
        }
      } else {
        // Add as child of existing parent
        let $childList = $parent.data(`${namespace}-child`);

        if (!$childList) {
          // Parent doesn't have children yet, create a new list with the item
          $childList = $('<ul>').append($item);
          $parent.append($childList);
          $parent.data(`${namespace}-child`, $childList).addClass(`${namespace}-parent`);

          // Set the ancestor relationship for the new item
          $item.data(`${namespace}-ancestor`, $parent);

          // The new list needs to be processed by unnest to become a column
          unnest($columns, $childList);

          // After unnesting, get the updated reference to the child list
          $childList = $parent.data(`${namespace}-child`);
        } else {
          // Parent already has children - $childList is already a column
          // Just append the new item directly to it
          $childList.append($item);

          // Set the ancestor relationship for the new item
          $item.data(`${namespace}-ancestor`, $parent);
        }

        // If the new item has nested children, process them
        const $child = $item.children(columnSelector);
        if ($child.length) {
          // Set up the parent-child relationship
          $item.data(`${namespace}-child`, $child).addClass(`${namespace}-parent`);
          // Process the child list to unnest it
          unnest($columns, $child);
        }
      }

      return $item;
    };

    /**
     * Rebuild children for a parent item after external changes.
     * @param {JQuery<HTMLLIElement>} $parent
     * @param {(string|JQuery<HTMLLIElement>)[]} newItems
     * @returns {JQuery<HTMLLIElement>}
     */
    $result.refreshChildren = function ($parent, newItems) {
      if (!$parent || !$parent.length) {
        return $parent;
      }
      const $existing = $parent.data(`${namespace}-child`);
      if ($existing && $existing.length) {
        $existing.remove();
        $parent.removeData(`${namespace}-child`).removeClass(`${namespace}-parent`);
      }
      const $liItems = newItems.map((it) => (typeof it === 'string' ? $(it) : it));
      const $newList = $('<ul>').append($liItems);
      $parent.append($newList);
      unnest($result, $newList);
      $parent.trigger('click');
      return $parent;
    };

    /**
     * Destroy and restore original structure.
     * @returns {JQuery<HTMLElement>}
     */
    $result.destroy = function () {
      const $columns = $result;

      $columns.each(function () {
        const $col = $(this);
        // Remove keydown event listener
        const keypressHandler = $col.data(`${namespace}-keypress-handler`);
        if (keypressHandler) {
          this.removeEventListener('keydown', keypressHandler);
        }

        // Remove click event handlers
        $col.off('click');

        // Remove all miller-columns CSS classes from columns
        $col.find(`.${namespace}-column`).removeClass(`${namespace}-column ${namespace}-collapse`);

        // Remove all miller-parent classes and miller-selected classes
        $col.find(`.${namespace}-parent`).removeClass(`${namespace}-parent`);
        $col.find(`.${namespace}-selected`).removeClass(`${namespace}-selected`);

        // Remove all data attributes
        $col.find('li').each(function () {
          const $item = $(this);
          $item.removeData(`${namespace}-ancestor`);
          $item.removeData(`${namespace}-child`);
        });

        // Remove preview columns
        $col.find(`.${namespace}-preview`).remove();

        // Restore original HTML structure
        const originalHTML = $col.data(`${namespace}-original-html`);
        if (originalHTML) {
          $col.html(originalHTML);
          $col.removeData(`${namespace}-original-html`);
        }

        $col.removeData(`${namespace}-keypress-handler`);
      });

      delete $result.addItem;
      delete $result.destroy;
      delete $result.refreshChildren;

      return $result;
    };

    return $result;
  };

  return $;
}

/**
 * @typedef {import('./millerColumns.ts').millerColumns} millerColumns
 */

export default addMillerColumnPlugin;
