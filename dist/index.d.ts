export default addMillerColumnPlugin;
export type Settings = {
    delay: JQuery.Duration | string;
    resetOnOutsideClick: boolean;
    breadcrumb: () => void;
    current: (li: JQuery<HTMLLIElement>, $columns: JQuery<HTMLElement>) => void;
    preview: null | ((li: JQuery<HTMLLIElement>, $columns: JQuery<HTMLElement>) => void);
    animation: (li: JQuery<HTMLLIElement>, $columns: JQuery<HTMLElement>) => void;
    reset: ($columns: JQuery<HTMLElement>) => void;
    scroll?: ($column: JQuery<HTMLElement> | null, $columns: JQuery<HTMLElement>) => void;
};
/**
* @external jQuery
*/
/**
 * @param {jQuery} $
 * @param {object} cfg
 * @param {string} [cfg.namespace]
 * @param {string[]} [cfg.stylesheets]
 * @returns {Promise<jQuery>}
 */
declare function addMillerColumnPlugin($: JQueryStatic, { namespace, stylesheets }?: {
    namespace?: string | undefined;
    stylesheets?: string[] | undefined;
}): Promise<JQueryStatic>;
