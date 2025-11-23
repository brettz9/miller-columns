declare global {
    interface JQuery {
        millerColumns(options: Partial<import('./index.js').Settings>): JQuery;
    }
}
export type millerColumns = JQuery['millerColumns'];
export {};
