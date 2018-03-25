/* globals $ */
import addMillerColumnPlugin from '../dist/index-es.js';

addMillerColumnPlugin($);

$('div.columns').millerColumns({
    current ($item) {
        console.log('User selected:', $item);
    }
});
