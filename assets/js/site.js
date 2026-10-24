(function () {
  'use strict';

  var root = document.documentElement;
  var toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;

  var label = toggle.querySelector('[data-theme-label]');
  var scheme = window.matchMedia('(prefers-color-scheme: dark)');
  var explicitChoice = false;

  try {
    var saved = localStorage.getItem('visal-theme');
    explicitChoice = saved === 'dark' || saved === 'light';
  } catch (error) {}

  function render(theme) {
    root.dataset.theme = theme;
    var next = theme === 'dark' ? 'light' : 'dark';
    label.textContent = next === 'light' ? 'Light' : 'Dark';
    toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }

  render(root.dataset.theme === 'dark' ? 'dark' : 'light');
  toggle.hidden = false;

  toggle.addEventListener('click', function () {
    var theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    explicitChoice = true;
    render(theme);
    try { localStorage.setItem('visal-theme', theme); } catch (error) {}
  });

  function followSystem(event) {
    if (!explicitChoice) render(event.matches ? 'dark' : 'light');
  }

  if (scheme.addEventListener) scheme.addEventListener('change', followSystem);
  else if (scheme.addListener) scheme.addListener(followSystem);
}());

