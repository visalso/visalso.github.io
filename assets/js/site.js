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
    if (label) label.textContent = next === 'light' ? 'Light' : 'Dark';
    toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    if (lever) {
      lever.setAttribute('d', theme === 'light' ? 'M10 16H22' : 'M10 16L22 6');
    }
  }

  render(root.dataset.theme === 'light' ? 'light' : 'dark');
  toggle.hidden = false;

  toggle.addEventListener('click', function () {
    var theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    render(theme);
    try { localStorage.setItem('visal-theme', theme); } catch (error) {}
  });
}());

(function () {
  'use strict';

  var publications = document.querySelector('[data-publications]');
  if (!publications) return;

  var papers = Array.prototype.slice.call(publications.querySelectorAll('article[data-paper-type]'));
  var years = Array.prototype.slice.call(publications.querySelectorAll('section[data-publication-year]'));
  var filters = publications.querySelector('[data-publication-filters]');
  var filterButtons = filters
    ? Array.prototype.slice.call(filters.querySelectorAll('button[data-paper-filter]'))
    : [];
  var status = publications.querySelector('[data-publication-status]');
  var empty = publications.querySelector('[data-publication-empty]');
  var names = {
    all: ['publication', 'publications'],
    journal: ['journal article', 'journal articles'],
    preprint: ['preprint', 'preprints'],
    proceedings: ['proceedings contribution', 'proceedings contributions']
  };

  function applyFilter(filter) {
    var visible = 0;
    papers.forEach(function (paper) {
      paper.hidden = filter !== 'all' && paper.getAttribute('data-paper-type') !== filter;
      if (!paper.hidden) visible += 1;
    });
    years.forEach(function (year) {
      var yearPapers = Array.prototype.slice.call(year.querySelectorAll('article[data-paper-type]'));
      year.hidden = !yearPapers.some(function (paper) { return !paper.hidden; });
    });
    filterButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-paper-filter') === filter));
    });
    if (empty) empty.hidden = visible !== 0;
    if (status) {
      status.textContent = 'Showing ' + visible + ' ' + names[filter][visible === 1 ? 0 : 1] + '.';
    }
  }

  filterButtons.forEach(function (button) {
    var filter = button.getAttribute('data-paper-filter');
    if (!Object.prototype.hasOwnProperty.call(names, filter)) return;
    var count = filter === 'all' ? papers.length : papers.filter(function (paper) {
      return paper.getAttribute('data-paper-type') === filter;
    }).length;
    var countLabel = button.querySelector('[data-filter-count]');
    if (countLabel) countLabel.textContent = String(count);
    button.addEventListener('click', function () { applyFilter(filter); });
  });
  applyFilter('all');
  if (filters) filters.hidden = false;

  papers.forEach(function (paper) {
    var panels = Array.prototype.slice.call(paper.querySelectorAll('.paper__panel'));
    var toggles = Array.prototype.slice.call(paper.querySelectorAll('button[data-paper-toggle]'));
    toggles.forEach(function (button) {
      var panelId = button.getAttribute('aria-controls');
      var panel = panels.filter(function (candidate) { return candidate.id === panelId; })[0];
      if (!panel) return;
      button.setAttribute('aria-expanded', String(!panel.hidden));
      button.addEventListener('click', function () {
        panel.hidden = !panel.hidden;
        button.setAttribute('aria-expanded', String(!panel.hidden));
      });
      button.hidden = false;
    });

    panels.forEach(function (panel) {
      var button = panel.querySelector('button[data-copy-bibtex]');
      var code = panel.querySelector('code[data-bibtex]');
      if (!button || !code) return;
      var copyStatus = panel.querySelector('[data-copy-status]');
      var pre = panel.querySelector('pre');

      function manualCopy() {
        button.disabled = false;
        var selected = false;
        try {
          if (pre) pre.focus();
          var selection = window.getSelection();
          if (selection) {
            var range = document.createRange();
            range.selectNodeContents(code);
            selection.removeAllRanges();
            selection.addRange(range);
            selected = true;
          }
        } catch (error) {}
        if (copyStatus) {
          copyStatus.textContent = selected
            ? 'Automatic copy is unavailable. The BibTeX text is selected; copy it manually.'
            : 'Automatic copy is unavailable. Select the BibTeX text and copy it manually.';
        }
      }

      button.addEventListener('click', function () {
        var text = code.textContent.trim();
        if (copyStatus) copyStatus.textContent = '';
        if (!text) {
          if (copyStatus) copyStatus.textContent = 'No BibTeX is available for this publication.';
          return;
        }
        button.disabled = true;
        try {
          if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            manualCopy();
            return;
          }
          Promise.resolve(navigator.clipboard.writeText(text)).then(function () {
            button.disabled = false;
            if (copyStatus) copyStatus.textContent = 'BibTeX copied.';
          }, manualCopy);
        } catch (error) {
          manualCopy();
        }
      });
      button.hidden = false;
    });
  });
}());

// Render mathematical notation in expandable abstracts
document.addEventListener('click', function (event) {
  const button = event.target.closest('[data-paper-toggle]');
  if (!button) return;

  const id = button.getAttribute('aria-controls');
  if (!id || !id.startsWith('abstract-')) return;

  requestAnimationFrame(function () {
    const panel = document.getElementById(id);

    if (
      panel &&
      !panel.hidden &&
      window.MathJax &&
      typeof window.MathJax.typesetPromise === 'function'
    ) {
      window.MathJax.typesetPromise([panel]).catch(console.error);
    }
  });
});
