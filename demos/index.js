/* globals $ -- jQuery doesn't support ESM currently */
/* eslint-disable no-unused-vars -- Convenient */
/* eslint-disable no-console -- Logging for demo */
import addMillerColumnPlugin from '../src/index.js';

await addMillerColumnPlugin($, {stylesheets: ['../miller-columns.css']});

const $columns = $('div.miller-columns').millerColumns({
  current ($item, $cols) {
    console.log('User selected:', $item);
  },
  reset ($cols) {
    console.log('Reset called');
  },
  preview ($item) {
    return 'Preview: ' + $item.text();
  },
  scroll ($item, $cols) {
    console.log('Scrolling...');
  }
});

// Demo: Add dynamic items programmatically
// Add a simple item to the root level
setTimeout(() => {
  console.log('Adding dynamic root item...');
  if ($columns.addItem) {
    $columns.addItem('<li><a href="#">Dynamically Added Root Item</a></li>');
  }
}, 2000);

// Add an item with nested children (they will be automatically unnested)
setTimeout(() => {
  console.log('Adding dynamic item with nested children...');
  if ($columns.addItem) {
    $columns.addItem(`
      <li><a href="#">Dynamic Item with Children</a>
        <ul>
          <li><a href="#">Dynamic Child 1</a></li>
          <li><a href="#">Dynamic Child 2</a>
            <ul>
              <li><a href="#">Dynamic Grandchild 1</a></li>
              <li><a href="#">Dynamic Grandchild 2</a></li>
            </ul>
          </li>
        </ul>
      </li>
    `);
  }
}, 4000);

// Add a child to an existing item
setTimeout(() => {
  console.log('Adding child to existing item...');
  // Find the "First 2" item and add a child to it
  const $parent = /** @type {JQuery<HTMLLIElement>} */ ($('.miller-column li').filter(function () {
    return $(this).text().trim().startsWith('First 2');
  }).first());

  if ($parent.length && $columns.addItem) {
    $columns.addItem('<li><a href="#">Dynamically Added Child</a></li>', $parent);
  }
}, 6000);

// Destroy button handler
$('#destroy-btn').on('click', () => {
  console.log('Destroying miller-columns...');
  if ($columns.destroy) {
    $columns.destroy();
    console.log('Miller-columns destroyed and original structure restored');
  }
});
