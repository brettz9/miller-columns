/* globals $ */
import addMillerColumnPlugin from '../dist/index-es.js';

(async () => {
await addMillerColumnPlugin($, {stylesheets: ['../miller-columns.css']});

$('div.miller-columns').millerColumns({
    current ($item, $cols) {
        console.log('User selected:', $item);
    }
});
})();
