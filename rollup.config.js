import {babel} from '@rollup/plugin-babel';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

/**
 * @external RollupConfig
 * @type {object}
 * @see {@link https://rollupjs.org/guide/en#big-list-of-options}
 */

/**
 * @param {object} cfg
 * @param {boolean} [cfg.minifying]
 * @param {"umd"|"es"} [cfg.format]
 * @returns {import('rollup').RollupOptions}
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
    // @ts-expect-error Bug?
    nonMinified.plugins.push(terser());
  }
  return nonMinified;
}

export default [
  getRollupObject(),
  getRollupObject({minifying: true}),
  getRollupObject({minifying: false, format: 'es'}),
  getRollupObject({minifying: true, format: 'es'})
];
