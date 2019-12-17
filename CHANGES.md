# miller-columns

## ?

- npm: Update devDeps

## 0.8.1

- npm: Include `package-lock.json` updates

## 0.8.0

- Linting (ESLint): Add a recommended extension (js); lint MD and HTML; apply ash-nazg
- Maintenance: Add `.editorconfig`
- Testing: Update Axe API (though now failing)
- npm: Update opn-cli->open-cli, devDeps

## 0.7.0

- Breaking change: Dropped reporting of resets to `current` settings handler
    and instead report to a new `reset` settings handler (which takes a single
    argument only of the columns object).
- Fix: Ensure scrolling to furthermost column
- Enhancement: Add `preview` setting callback to allow shaping of a preview
    pane
- Enhancement: Add `scroll` setting callback to be informed of scrolling

## 0.6.0

- Breaking change: Remove `yarn.lock`
- Fix (and simplify) key selection (had been selecting items in
    non-highlighted columns)
- npm: Update devDeps; remove unused
- Linting (ESLint): "Standard" update; testcafe
- Build: Update to terser for current minification support
- Testing: Add testcafe skeleton for UI (and accessibility) testing
- Docs: Remove outdated info

## 0.5.0

- Breaking change: Namespace all classes and jQuery's internal `data`
    with `miller-`.
- Breaking change: Switch from `breadcrumb` to `breadcrumbs` though
    loosen need for this to be on a `<div>` and add a `breadcrumb`
    class to the `<span>`'s representing individual breadcrumbs
- Refactoring: Consistent CSS spacing

## 0.4.0

- Enhancement: Use `loadStylesheets` to give option to load the CSS (along
    with other user-related styles) dynamically and modularly (though in
    parallel).

## 0.3.1

- Fix: Avoid adding special keys like modifiers to buffer

## 0.3.0

- Enhancement: Support jumping (case-insensitively) alphabetically by typing
    letters (with a buffer to allow selection based on multiple characters)

## 0.2.3

- Fix: Display quirk with unselected column still taking up space
- Breaking change: Allow use of `<ol>` (as well as `<ul>`).
- Enhancement: Allow avoiding of `<ul>` (or `<ol>`) if a
    `no-columns` class is applied.

## 0.2.2

- Fix: Ensure reset scrolls back horizontally

## 0.2.1

- Breaking change: Rename UMD global from `MillerColumns` to
    `addMillerColumnPlugin`. (No global needed for ES6)

## 0.2.0

- Breaking change: Call `animation` with column first then columns for
    parity with new `current` behavior
- Breaking change: Pass `null` instead of `undefined` as first argument to
    `current` upon reset
- Enhancement: Pass columns object as second argument to `current` (even for
    `reset`)
- Enhancement: Make `resetOnOutsideClick` (default: true) option to avoid
    reset behavior

## 0.1.0

- Initial commit: ES6 Modules adaptation of
<http://jsfiddle.net/yckart/cbtnemc7/>
