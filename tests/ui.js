// https://github.com/DevExpress/testcafe
// https://devexpress.github.io/testcafe/documentation/test-api/
// https://github.com/helen-dikareva/axe-testcafe
import {Selector} from 'testcafe';

fixture`TestCafe UI tests`.
  page`http://127.0.0.1:8092/demos/`;

// Todo: Replace with something meaningful
test('Shows children', async (t) => {
  await t.
    expect(Selector('body').exists).ok('Has body');
});
