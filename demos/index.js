/* globals $ */
import addMillerColumnPlugin from '../dist/index-es.js';

addMillerColumnPlugin($);

$('div.columns').millerColumns({
    current ($item, $cols) {
        console.log('User selected:', $item);
    }
});
