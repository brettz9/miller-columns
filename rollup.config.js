import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import {minify} from 'uglify-es';

function getRollupObject ({minifying, format = 'umd'} = {}) {
    const nonMinified = {
        input: 'src/index.js',
        output: {
            format,
            file: `dist/index-${format}${minifying ? '.min' : ''}.js`,
            name: 'addMillerColumnPlugin'
        },
        plugins: [
            babel(), nodeResolve()
        ]
    };
    if (minifying) {
        nonMinified.plugins.push(uglify(null, minify));
    }
    return nonMinified;
};

export default [
    getRollupObject(),
    getRollupObject({minifying: true}),
    getRollupObject({minifying: false, format: 'es'}),
    getRollupObject({minifying: true, format: 'es'})
];
