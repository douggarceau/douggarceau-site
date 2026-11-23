// The book and the case register count different kinds of entries.
window.researchInventory = (() => {
  const base = new URL('.', document.currentScript.src);
  const files = new Map();
  function read(path) {
    if (!files.has(path)) {
      files.set(path, fetch(new URL(path, base), {cache: 'no-cache'}).then(response => {
        if (!response.ok) throw new Error('Could not load ' + path);
        return response.json();
      }).catch(error => {
        files.delete(path);
        throw error;
      }));
    }
    return files.get(path);
  }
  return {
    book: () => read('book.json'),
    exhibits: () => read('cold-case-file/items.json'),
    references: () => read('cold-case-file/register.json')
  };
})();

customElements.define('source-counts', class extends HTMLElement {
  connectedCallback() {
    // An element inserted by the HTML parser may precede its child links.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.refresh(), {once: true});
    } else {
      this.refresh();
    }
  }

  refresh() {
    const update = (key, value, chapter) => {
      const link = this.querySelector('[data-list="' + key + '"]');
      if (!link) return;
      link.querySelector('b').textContent = value;
      if (chapter) link.hash = 'chapter-' + chapter.n;
    };

    Promise.all([researchInventory.exhibits(), researchInventory.references()])
      .then(([exhibits, references]) => {
        update('register', exhibits.length + references.filter(x => x.kind !== 'Family testimony').length);
      })
      .catch(() => update('register', ''));

    researchInventory.book().then(({chapters}) => {
      for (const [key, title, selector] of [
        ['notes', 'Notes', '.notes li'],
        ['bibliography', 'Bibliography', '.apx > p:not(.lede)']
      ]) {
        const chapter = chapters.find(item => item.title === title);
        const template = document.createElement('template');
        template.innerHTML = chapter?.html || '';
        update(key, chapter ? template.content.querySelectorAll(selector).length : '', chapter);
      }
    }).catch(() => {
      update('notes', '');
      update('bibliography', '');
    });
  }
});
