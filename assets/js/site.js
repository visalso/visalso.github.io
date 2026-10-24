(function () {
  'use strict';

  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');

  if (!toggle) return;

  var label = toggle.querySelector('[data-theme-label]');
  var lever = toggle.querySelector('[data-switch-lever]');

  function render(theme) {
    root.dataset.theme = theme;

    var next = theme === 'dark' ? 'light' : 'dark';

    if (label) {
      label.textContent = next === 'light' ? 'Light' : 'Dark';
    }

    toggle.setAttribute(
      'aria-label',
      'Switch to ' + next + ' theme'
    );

    if (lever) {
      lever.setAttribute(
        'd',
        theme === 'light'
          ? 'M10 16H22'
          : 'M10 16L22 6'
      );
    }
  }

  render(root.dataset.theme === 'light' ? 'light' : 'dark');

  toggle.hidden = false;

  toggle.addEventListener('click', function () {
    var theme = root.dataset.theme === 'dark' ? 'light' : 'dark';

    render(theme);

    try {
      localStorage.setItem('visal-theme', theme);
    } catch (error) {}
  });
}());
