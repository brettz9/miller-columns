declare global {
    interface JQuery {
        millerColumns(options: Partial<import('../src/index.js').Settings>): JQuery;
    }
}
export type millerColumns = JQuery['millerColumns'];
export {};
