(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.addMillerColumnPlugin = factory());
}(this, (function () { 'use strict';

    function loadStylesheets(stylesheets, {
        before: beforeDefault, after: afterDefault, favicon: faviconDefault,
        canvas: canvasDefault, image: imageDefault = true,
        acceptErrors
    } = {}) {
        stylesheets = Array.isArray(stylesheets) ? stylesheets : [stylesheets];

        function setupLink(stylesheetURL) {
            let options = {};
            if (Array.isArray(stylesheetURL)) {
                [stylesheetURL, options = {}] = stylesheetURL;
            }
            let { favicon = faviconDefault } = options;
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
                    document.head.appendChild(link);
                }
            }

            const link = document.createElement('link');
            return new Promise((resolve, reject) => {
                let rej = reject;
                if (acceptErrors) {
                    rej = typeof acceptErrors === 'function' ? error => {
                        acceptErrors({ error, stylesheetURL, options, resolve, reject });
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
                    img.addEventListener('error', error => {
                        reject(error);
                    });
                    img.addEventListener('load', () => {
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
                link.addEventListener('error', error => {
                    rej(error);
                });
                link.addEventListener('load', () => {
                    resolve(link);
                });
            });
        }

        return Promise.all(stylesheets.map(setupLink));
    }

    /**
     * MIT License
     *
     * Copyright 2014 White Magic Software, Inc.
     * Copyright 2018 Brett Zamir
     */

    // Todo: Replace the `moduleURL` with `import.meta` `moduleURL` once
    //  implemented; https://github.com/tc39/proposal-import-meta
    const moduleURL = new URL('node_modules/miller-columns/src/index.js', location);

    const defaultCSSURL = new URL('../miller-columns.css', moduleURL).href;

    function escapeRegex(s) {
        return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    var index = (async function ($, { namespace = 'miller', stylesheets = ['@default'] } = {}) {
        let settings;
        const columnSelector = `ul:not(.${namespace}-no-columns),ol:not(.${namespace}-no-columns)`;
        const itemSelector = 'li';
        if (stylesheets) {
            await loadStylesheets(stylesheets.map(s => {
                return s === '@default' ? defaultCSSURL : s;
            }));
        }

        /** Returns a list of the currently selected items. */
        function chain() {
            return $(`.${namespace}-column > .${namespace}-selected`);
        }

        /** Add the breadcrumb path using the chain of selected items. */
        function breadcrumb() {
            const $breadcrumb = $(`.${namespace}-breadcrumbs`).empty();

            chain().each(function () {
                const $crumb = $(this);
                $(`<span class="${namespace}-breadcrumb">`).text($crumb.text().trim()).click(function () {
                    $crumb.click();
                }).appendTo($breadcrumb);
            });
        }

        /** Ensure the viewport shows the entire newly expanded item. */
        function animation($column, $columns) {
            let width = 0;
            chain().not($column).each(function () {
                width += $(this).outerWidth(true);
            });
            $columns.stop().animate({
                scrollLeft: width
            }, settings.delay);
        }

        /** Convert nested lists into columns using breadth-first traversal. */
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

        /** Hide columns (not the first). */
        function collapse() {
            $(`.${namespace}-column:gt(0)`).addClass(`${namespace}-collapse`);
        }

        /** Returns the last selected item (i.e., the current cursor). */
        function current() {
            return chain().last();
        }

        function scrollIntoView($columns) {
            animation(null, $columns);
        }

        function userReset($columns) {
            reset($columns);
            scrollIntoView($columns);
        }

        /** Hide columns (not the first), remove selections, update breadcrumb. */
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

        /** Select item above current selection. */
        function moveU() {
            current().prev().click();
        }

        /** Select item below current selection. */
        function moveD() {
            current().next().click();
        }

        /** Select item left of the current selection. */
        function moveL() {
            const $ancestor = current().data(`${namespace}-ancestor`);

            if ($ancestor) {
                $ancestor.click();
            }
        }

        /** Select item right of the current selection, or down if no right item. */
        function moveR() {
            const $child = current().data(`${namespace}-child`);

            if ($child) {
                $child.children(itemSelector).first().click();
            } else {
                moveD();
            }
        }

        function getKeyPress($columns) {
            let buffer = '';
            let lastTime;
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
                const { key } = ev;
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
                current: $item => {},
                reset: $columns => {},
                preview: $item => {},
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
    });

    return index;

})));
