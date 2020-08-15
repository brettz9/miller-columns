/* globals $ -- jQuery doesn't support ESM currently */
/* eslint-disable no-console -- Logging for demo */
import addMillerColumnPlugin from '../dist/index-es.js';

(async () => {
await addMillerColumnPlugin($, {stylesheets: ['../miller-columns.css']});

$('div.miller-columns').millerColumns({
  current ($item, $cols) {
    console.log('User selected:', $item);
  },
  reset ($cols) {
    console.log('Reset called');
  },
  preview ($item) {
    return 'Preview: ' + $item.text();
  },
  scroll ($item, $cols) {
    console.log('Scrolling...');
  }
});
})();
