declare global {
    interface JQuery {
        millerColumns(options: Partial<import('./index.js').Settings>): JQuery;
        addItem?(item: string | JQuery<HTMLLIElement>, $parent?: JQuery<HTMLLIElement>): JQuery<HTMLLIElement>;
        refreshChildren?($parent: JQuery<HTMLLIElement>, newItems: Array<string | JQuery<HTMLLIElement>>): JQuery<HTMLLIElement>;
        destroy?(): JQuery<HTMLElement>;
    }
}
export type millerColumns = JQuery['millerColumns'];
export {};
