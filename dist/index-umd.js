(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.MillerColumns = factory());
}(this, (function () { 'use strict';

    /**
     * MIT License
     *
     * Copyright 2014 White Magic Software, Inc.
     */

    function index ($) {
        let settings;
        const columnSelector = 'ul';
        const itemSelector = 'li';

        /** Returns a list of the currently selected items. */
        function chain() {
            return $('.column > .selected');
        }

        /** Add the breadcrumb path using the chain of selected items. */
        function breadcrumb() {
            const $breadcrumb = $('div.breadcrumb').empty();

            chain().each(function () {
                const $crumb = $(this);
                $('<span>').text($crumb.text().trim()).click(function () {
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
                    if ($ancestor.length && $this.data('ancestor') == null) {
                        // Use addBack to reset all selection chains.
                        $(this).siblings().addBack().data('ancestor', $ancestor);
                    }

                    if ($child.length) {
                        queue.push($child);
                        $(this).data('child', $child).addClass('parent');
                    }

                    // Causes item siblings to have a flattened DOM lineage.
                    $(this).parent(columnSelector).appendTo($columns).addClass('column');
                });
            }
        }

        /** Hide columns (not the first). */
        function collapse() {
            $('.column:gt(0)').addClass('collapse');
        }

        /** Returns the last selected item (i.e., the current cursor). */
        function current() {
            return chain().last();
        }

        /** Hide columns (not the first), remove selections, update breadcrumb. */
        function reset($columns) {
            collapse();
            chain().removeClass('selected');
            breadcrumb();

            // Upon reset ensure no value is returned to the calling code.
            settings.current(null, $columns);
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
            const $ancestor = current().data('ancestor');

            if ($ancestor) {
                $ancestor.click();
            }
        }

        /** Select item right of the current selection, or down if no right item. */
        function moveR() {
            const $child = current().data('child');

            if ($child) {
                $child.children(itemSelector).first().click();
            } else {
                moveD();
            }
        }

        function getKeyPress($columns) {
            return function keypress(ev) {
                // Was an attempt made to move the currently selected item (the cursor)?
                let moved = false;

                switch (ev.which) {
                    case 27:
                        // escape
                        reset($columns);
                        break;
                    case 38:
                        // arrow up
                        moveU();
                        moved = true;
                        break;
                    case 40:
                        // arrow down
                        moveD();
                        moved = true;
                        break;
                    case 37:
                        // arrow left
                        moveL();
                        moved = true;
                        break;
                    case 39:
                        // arrow right
                        moveR();
                        moved = true;
                        break;
                }

                // If no item is selected, then jump to the first item.
                if (moved && current().length === 0) {
                    $('.column').first().children().first().click();
                }

                if (moved) {
                    ev.preventDefault();
                }
            };
        }

        $.fn.millerColumns = function (options) {
            const defaults = {
                current: $item => {},
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
                    const that = this;
                    const $this = $(that);
                    reset($columns);

                    const $child = $this.data('child');
                    let $ancestor = $this;

                    if ($child) {
                        $child.removeClass('collapse').children().removeClass('selected');
                    }

                    // Reveal (uncollapse) all ancestors to the clicked item.
                    while ($ancestor) {
                        $ancestor.addClass('selected').parent().removeClass('collapse');
                        $ancestor = $ancestor.data('ancestor');
                    }

                    settings.animation.call(that, $this, $columns);
                    settings.breadcrumb.call(that);
                    settings.current.call(that, $this, $columns);

                    // Don't allow the underlying element
                    // to receive the click event.
                    ev.stopPropagation();
                });

                $columns.on('keydown', getKeyPress($columns));
                $columns.on('click', () => {
                    if (settings.resetOnOutsideClick) {
                        reset($columns);
                    }
                });
                // $('div.breadcrumb').on('click', moveL);

                // The last set of columns on the page recieves focus.
                // $columns.focus();
            });
        };
    }

    return index;

})));
