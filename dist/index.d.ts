export default addMillerColumnPlugin;
export type Settings = {
    delay: JQuery.Duration | string;
    outsideClickBehavior: "reset" | "select-parent" | "none";
    breadcrumbRoot: string;
    breadcrumb: (this: HTMLElement, $columns?: JQuery<HTMLElement>) => void;
    current: (li: JQuery<HTMLLIElement>, $columns: JQuery<HTMLElement>) => void;
    preview: null | ((li: JQuery<HTMLLIElement>, $columns: JQuery<HTMLElement>) => void);
    animation: (li: JQuery<HTMLLIElement>, $columns: JQuery<HTMLElement>) => void;
    reset: ($columns: JQuery<HTMLElement>) => void;
    scroll?: ($column: JQuery<HTMLElement> | null, $columns: JQuery<HTMLElement>) => void;
};
export type millerColumns = import("./millerColumns.ts").millerColumns;
/**
 * @param {jQuery} $
 * @param {object} cfg
 * @param {string} [cfg.namespace]
 * @param {Exclude<import('load-stylesheets').Stylesheets, string>} [cfg.stylesheets]
 * @returns {Promise<jQuery>}
 */
declare function addMillerColumnPlugin($: JQueryStatic, { namespace, stylesheets }?: {
    namespace?: string | undefined;
    stylesheets?: (string | [stylesheetURL: string, options: import("load-stylesheets").Options])[] | undefined;
}): Promise<JQueryStatic>;
