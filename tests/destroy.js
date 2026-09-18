// https://github.com/DevExpress/testcafe
// https://devexpress.github.io/testcafe/documentation/test-api/
import {Selector, ClientFunction} from 'testcafe';

fixture`TestCafe destroy() tests`.
  page`http://127.0.0.1:8092/demos/`;

const getOuterHTML = ClientFunction(() => document.querySelector('div.miller-columns').outerHTML);

const normalize = (html) => html.replaceAll(/\s+/gv, ' ').trim();

const getPristineHTML = async () => {
  // The plugin auto-initializes on page load, so the pristine markup must be
  // fetched straight from the server rather than read back from the browser.
  const res = await fetch('http://127.0.0.1:8092/demos/');
  const rawPage = await res.text();
  const match = (/<div class="miller-columns"[^]*?<\/div>/v).exec(rawPage);
  return normalize(match[0]);
};

test('destroy() restores the exact original DOM', async (t) => {
  const pristineHTML = await getPristineHTML();
  const initialHTML = normalize(await getOuterHTML());

  await t.expect(initialHTML).notEql(pristineHTML, 'Plugin should have already transformed the DOM on load (columns/classes added)');
  await t.expect(Selector('.miller-column').count).gt(1, 'Should show multiple columns after init');

  // Interact: click into a nested column and let its scroll animation finish
  await t.click(Selector('div.miller-columns li a').withText('zFirst 4'));
  await t.wait(700);

  const midHTML = normalize(await getOuterHTML());
  await t.expect(midHTML).notEql(initialHTML, 'DOM should change further after interacting (selection/expansion)');

  await t.click(Selector('#destroy-btn'));
  await t.wait(300);

  const afterDestroyHTML = normalize(await getOuterHTML());
  await t.expect(afterDestroyHTML).eql(pristineHTML, 'DOM should be restored to the exact pristine markup after destroy()');

  // No leftover miller- classes/elements
  await t.expect(Selector('.miller-column').count).eql(0, 'No miller-column classes should remain');
  await t.expect(Selector('.miller-parent').count).eql(0, 'No miller-parent classes should remain');
  await t.expect(Selector('.miller-selected').count).eql(0, 'No miller-selected classes should remain');
  await t.expect(Selector('.miller-preview').count).eql(0, 'No miller-preview elements should remain');
});

test('destroy() during an in-flight scroll animation does not throw', async (t) => {
  const pristineHTML = await getPristineHTML();

  // Trigger the scroll animation (default delay is 500ms) then destroy
  // immediately, before the animation's completion callback has run.
  await t.click(Selector('div.miller-columns li a').withText('zFirst 4'));
  await t.click(Selector('#destroy-btn'));

  // Wait past the animation's original delay: if the completion callback
  // were still wired up to the pre-destroy DOM, it would throw here.
  await t.wait(700);

  const afterDestroyHTML = normalize(await getOuterHTML());
  await t.expect(afterDestroyHTML).eql(pristineHTML, 'DOM should still be fully restored when destroyed mid-animation');
});
