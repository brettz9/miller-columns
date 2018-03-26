# miller-columns

## ?

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
