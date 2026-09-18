/**
 * MIT License.
 *
 * @copyright 2014 White Magic Software, Inc.
 * @copyright 2018 Brett Zamir
 */
export type Settings = {
    delay: JQuery.Duration | string;
    outsideClickBehavior: "reset" | "select-parent" | "none";
    breadcrumbRoot: string;
    breadcrumb: (this: HTMLElement, $columns?: JQuery<HTMLElement>) => void;
    current: (li: JQuery<HTMLLIElement>, $columns: JQuery<HTMLElement>) => void;
    preview: null | ((li: JQuery<HTMLLIElement>, $columns: JQuery<HTMLElement>) => void);
    onPreview: null | ((ev: JQuery.ClickEvent<HTMLUListElement, undefined, HTMLUListElement, HTMLUListElement>, li: JQuery<HTMLUListElement>, $columns: JQuery<HTMLElement>) => void);
    animation: (li: JQuery<HTMLLIElement>, $columns: JQuery<HTMLElement>) => void;
    reset: ($columns: JQuery<HTMLElement>, resetByUser: boolean) => void;
    scroll?: ($column: JQuery<HTMLElement> | null, $columns: JQuery<HTMLElement>) => void;
};
/**
 * @param {typeof jQuery} $
 * @param {object} cfg
 * @param {string} [cfg.namespace]
 * @param {Exclude<import('load-stylesheets').Stylesheets, string>} [cfg.stylesheets]
 * @returns {Promise<typeof jQuery>}
 */
declare function addMillerColumnPlugin($: typeof jQuery, { namespace, stylesheets }?: {
    namespace?: string;
    stylesheets?: Exclude<import('load-stylesheets').Stylesheets, string>;
}): Promise<typeof jQuery>;
export type millerColumns = import('./millerColumns.ts').millerColumns;
/**
 * @typedef {import('./millerColumns.ts').millerColumns} millerColumns
 */
export default addMillerColumnPlugin;
