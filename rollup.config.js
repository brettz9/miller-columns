import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

/**
 * @external RollupConfig
 * @type {PlainObject}
 * @see {@link https://rollupjs.org/guide/en#big-list-of-options}
 */

/**
 * @param {PlainObject} cfg
 * @param {boolean} cfg.minifying
 * @param {"umd"|"es"} cfg.format
 * @returns {RollupConfig}
 */
function getRollupObject ({minifying, format = 'umd'} = {}) {
  const nonMinified = {
    input: 'src/index.js',
    output: {
      format,
      file: `dist/index-${format}${minifying ? '.min' : ''}.js`,
      name: 'addMillerColumnPlugin'
    },
    plugins: [
      babel({
        babelHelpers: 'bundled'
      }), nodeResolve()
    ]
  };
  if (minifying) {
    nonMinified.plugins.push(terser());
  }
  return nonMinified;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default [
  getRollupObject(),
  getRollupObject({minifying: true}),
  getRollupObject({minifying: false, format: 'es'}),
  getRollupObject({minifying: true, format: 'es'})
];
