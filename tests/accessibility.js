// https://github.com/DevExpress/testcafe
// https://devexpress.github.io/testcafe/documentation/test-api/
// https://github.com/testcafe-community/axe
import {axeCheck} from '@testcafe-community/axe';

/**
* @external AxeResult
*/
/**
 * @external TestcafeTest
*/

/* eslint-disable jsdoc/imports-as-dependencies -- Bug with no explicit `types` */
/**
 * @param {typeof import('testcafe').t} t
 * @returns {Promise<ReturnType<import('@testcafe-community/axe').AxeCheck>>}
 */
async function axeCheckWithConfig (t) {
  /* eslint-enable jsdoc/imports-as-dependencies -- Bug with no explicit `types` */
  return await axeCheck(
    t,
    // context: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#context-parameter
    undefined,
    // https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#options-parameter
    {
      rules: {
        // 'meta-viewport': {enabled: false}
      }
    }
    // , (err, results) {} // https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#results-object
  );
}

fixture`TestCafe Axe accessibility tests`.
  page`http://127.0.0.1:8092/demos/`;

test('Entry page', async (t) => {
  await axeCheckWithConfig(t); // , axeContent, axeOptions: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#api-name-axerun
});
