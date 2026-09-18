// https://github.com/DevExpress/testcafe
// https://devexpress.github.io/testcafe/documentation/test-api/
// https://github.com/testcafe-community/axe
import {checkForViolations} from '@testcafe-community/axe';

/**
 * @param {typeof import('testcafe').t} t
 * @returns {Promise<import('@testcafe-community/axe').AxeCheck>}
 */
async function axeCheckWithConfig (t) {
  return await checkForViolations(
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
  page`http://127.0.0.1:8092/demos/`.
  clientScripts({module: 'axe-core/axe.min.js'});

test('Entry page', async (t) => {
  await axeCheckWithConfig(t); // , axeContent, axeOptions: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#api-name-axerun
});
