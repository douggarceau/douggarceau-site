(() => {
  const book = '/the-names-he-carried/';
  const image = book + 'design/shieldhill-book-card.jpg';
  const panel = document.createElement('dialog');
  panel.className = 'book-share-panel';
  panel.setAttribute('aria-labelledby', 'book-share-title');
  panel.innerHTML = `<button type="button" data-dismiss aria-label="Close sharing options">×</button>
    <img src="${image}" width="1200" height="630" loading="lazy" alt="The Names He Carried, with Shieldhill and Laurence’s book cover">
    <div class="share-interior"><h2 id="book-share-title">Share this page</h2>
    <input class="share-link" aria-label="Link to this page" readonly spellcheck="false">
    <div class="share-choices"><button type="button" data-copy>Copy link</button>
    <button type="button" data-send hidden>Share link…</button>
    <button type="button" data-photo hidden>Share image…</button>
    <a href="${image}" download="The-Names-He-Carried.jpg">Save image</a></div>
    <p role="status" aria-live="polite"></p></div>`;

  const input = panel.querySelector('input');
  const status = panel.querySelector('[role=status]');
  const photo = panel.querySelector('[data-photo]');
  let activeTrigger;
  let imageFile;
  let loadingFile;
  let pageTitle;

  function linkToPage() {
    const url = new URL(location.href);
    for (const key of ['v','edition']) url.searchParams.delete(key);
    if ((url.pathname === book || url.pathname === book + 'index.html') &&
        !url.search && (!url.hash || url.hash === '#start')) {
      return new URL(book + 'share/', url).href;
    }
    return url.href;
  }

  async function preparePhoto() {
    if (!navigator.canShare || !navigator.share || typeof File === 'undefined') return;
    if (!loadingFile) {
      loadingFile = fetch(image).then(async response => {
        if (!response.ok) throw new Error('Image unavailable');
        const blob = await response.blob();
        return new File([blob], 'The-Names-He-Carried.jpg', {type: 'image/jpeg'});
      }).catch(() => { loadingFile = null; return null; });
    }
    imageFile = await loadingFile;
    photo.hidden = !imageFile || !navigator.canShare({files:[imageFile]});
  }

  function fallbackSelection() {
    input.focus();
    input.select();
    input.setSelectionRange(0,input.value.length);
  }

  panel.querySelector('[data-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(input.value);
      status.textContent = 'Link copied.';
    } catch {
      fallbackSelection();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch {}
      status.textContent = copied ? 'Link copied.' : 'The link is selected. Use Copy on your device.';
    }
  });

  async function send(data) {
    try {
      await navigator.share(data);
      panel.close();
    } catch (error) {
      if (error.name !== 'AbortError') status.textContent = 'You can copy the link or save the image below.';
    }
  }
  panel.querySelector('[data-send]').addEventListener('click', () => send({title:pageTitle,url:input.value}));
  photo.addEventListener('click', () => { if (imageFile) send({files:[imageFile],text:input.value}); });
  panel.querySelector('[data-dismiss]').addEventListener('click', () => panel.close());
  panel.addEventListener('close', () => activeTrigger?.focus());
  panel.addEventListener('click', e => { if (e.target === panel) {
    const r = panel.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) panel.close();
  }});

  for (const button of document.querySelectorAll('[data-book-share]')) {
    button.hidden = false;
    button.addEventListener('click', () => {
      activeTrigger = button;
      const link = linkToPage();
      pageTitle = document.querySelector('#view .opener h2, #view .pg-person h2, main h1, header h1')?.textContent.trim() || document.title;
      if (typeof panel.showModal !== 'function') {
        if (navigator.share) navigator.share({title:pageTitle,url:link}).catch(() => {});
        else window.prompt('Copy this link',link);
        return;
      }
      if (!panel.isConnected) document.body.append(panel);
      input.value = link;
      status.textContent = '';
      panel.querySelector('[data-send]').hidden = typeof navigator.share !== 'function';
      panel.showModal();
      panel.querySelector('[data-copy]').focus();
      preparePhoto().catch(() => { photo.hidden = true; });
    });
  }
})();
