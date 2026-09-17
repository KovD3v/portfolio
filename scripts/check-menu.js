// Paste into the browser console on any portfolio page. No test dependencies.
(() => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const dialog = document.querySelector('#palette');
  const trigger = document.querySelector('[data-open-palette]');
  const input = dialog.querySelector('input');
  const list = dialog.querySelector('.p-list');
  const options = [...dialog.querySelectorAll('[role="option"]')];
  const rendered = () => options.filter(item => item.getClientRects().length);
  const search = value => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  dialog.close();
  trigger.focus();
  trigger.click();
  assert(dialog.open && document.activeElement === input, 'Menu must focus search');
  search('zzzzzzzz');
  assert(rendered().length === 0, 'Unmatched options must not be rendered');
  assert(!dialog.querySelector('.p-empty').hidden, 'Missing empty state');
  assert(!input.hasAttribute('aria-activedescendant'), 'Empty results must clear selection');
  search('Amber');
  assert(rendered().length === 1 && rendered()[0].dataset.text === 'Amber', 'Search must show only the match');
  assert(dialog.querySelector('.p-empty').hidden, 'Empty state must clear after a match');
  search('');
  assert(rendered().length === options.length, 'Clearing search must restore all options');
  assert(options.every(item => item.style.order === ''), 'Clearing search must restore original order');
  for (let i = 1; i < options.length; i++) {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  }
  const selected = document.getElementById(input.getAttribute('aria-activedescendant'));
  const itemRect = selected.getBoundingClientRect(), listRect = list.getBoundingClientRect();
  assert(selected === options.at(-1), 'Arrow keys must reach the last option');
  assert(itemRect.top >= listRect.top - 1 && itemRect.bottom <= listRect.bottom + 1, 'Keyboard selection must stay visible');
  dialog.querySelector('.p-close').click();
  assert(!dialog.open && document.activeElement === trigger, 'Close must restore focus to the menu trigger');
  return 'Passed: menu filtering, empty state, reset, keyboard scrolling, close and focus restoration.';
})();
