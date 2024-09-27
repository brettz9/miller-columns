// https://github.com/DevExpress/testcafe
// https://devexpress.github.io/testcafe/documentation/test-api/
// https://github.com/helen-dikareva/axe-testcafe
import {axeCheck, createReport} from 'axe-testcafe';

/**
* @external AxeResult
*/
/**
 * @external TestcafeTest
*/
/**
 * @param {external.TestcafeTest} t
 * @returns {Promise<AxeResult>}
 */
async function axeCheckWithConfig (t) {
  const /* error, */ {violations} = await axeCheck(
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
  await t.expect(violations.length === 0).ok(createReport(violations));
}

fixture`TestCafe Axe accessibility tests`.
  page`http://127.0.0.1:8092/demos/`;

test('Entry page', async (t) => {
  await axeCheckWithConfig(t); // , axeContent, axeOptions: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#api-name-axerun
});
