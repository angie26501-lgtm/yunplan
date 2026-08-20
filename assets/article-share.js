(function () {
  'use strict';

  if (document.querySelector('[data-article-share-root]')) return;

  const canonical = document.querySelector('link[rel="canonical"]');
  const shareUrl = canonical && canonical.href
    ? canonical.href
    : window.location.href.split('#')[0].split('?')[0];
  const titleMeta = document.querySelector('meta[property="og:title"]');
  const descriptionMeta = document.querySelector('meta[property="og:description"], meta[name="description"]');
  const shareTitle = (titleMeta && titleMeta.content) || document.title;
  const shareText = (descriptionMeta && descriptionMeta.content) || '';

  const style = document.createElement('style');
  style.textContent = `
    .article-share{position:fixed;left:20px;bottom:max(20px,env(safe-area-inset-bottom));z-index:9997;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif;color:#234e52}
    .article-share__button{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(35,78,82,.18);border-radius:999px;background:#fff;color:#234e52;padding:11px 17px;font:600 15px/1.2 inherit;box-shadow:0 8px 24px rgba(25,55,58,.16);cursor:pointer}
    .article-share__button:hover,.article-share__button:focus-visible{background:#f7f3e9;outline:3px solid rgba(190,148,66,.25);outline-offset:2px}
    .article-share__panel{position:absolute;left:0;bottom:calc(100% + 10px);width:210px;padding:10px;border:1px solid rgba(35,78,82,.14);border-radius:16px;background:#fff;box-shadow:0 14px 38px rgba(25,55,58,.18)}
    .article-share__panel[hidden]{display:none}
    .article-share__title{margin:2px 8px 8px;font-size:13px;font-weight:700;color:#667a76}
    .article-share__option{display:flex;width:100%;align-items:center;gap:10px;border:0;border-radius:10px;background:transparent;color:#234e52;padding:10px 11px;text-align:left;text-decoration:none;font:500 15px/1.3 inherit;cursor:pointer;box-sizing:border-box}
    .article-share__option:hover,.article-share__option:focus-visible{background:#f7f3e9;outline:none}
    .article-share__icon{display:grid;width:25px;height:25px;place-items:center;border-radius:50%;background:#eaf1ed;font-size:13px;font-weight:700}
    .article-share__status{min-height:18px;margin:6px 8px 1px;font-size:12px;color:#5f716e}
    @media (max-width:640px){.article-share{left:14px;bottom:max(14px,env(safe-area-inset-bottom))}.article-share__button{padding:10px 14px;font-size:14px}.article-share__panel{width:min(210px,calc(100vw - 28px))}}
    @media print{.article-share{display:none!important}}
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'article-share';
  root.setAttribute('data-article-share-root', '');
  root.innerHTML = `
    <div class="article-share__panel" id="article-share-panel" role="dialog" aria-label="分享這篇文章" hidden>
      <p class="article-share__title">分享這篇文章</p>
      <button class="article-share__option" type="button" data-share-native>
        <span class="article-share__icon" aria-hidden="true">↗</span><span>更多分享方式</span>
      </button>
      <a class="article-share__option" data-share-line href="#">
        <span class="article-share__icon" aria-hidden="true">L</span><span>分享到 LINE</span>
      </a>
      <a class="article-share__option" data-share-facebook href="#">
        <span class="article-share__icon" aria-hidden="true">f</span><span>分享到 Facebook</span>
      </a>
      <button class="article-share__option" type="button" data-share-copy>
        <span class="article-share__icon" aria-hidden="true">⧉</span><span>複製文章連結</span>
      </button>
      <p class="article-share__status" data-share-status aria-live="polite"></p>
    </div>
    <button class="article-share__button" type="button" aria-expanded="false" aria-controls="article-share-panel">
      <span aria-hidden="true">↗</span><span>分享文章</span>
    </button>
  `;
  document.body.appendChild(root);

  const trigger = root.querySelector('.article-share__button');
  const panel = root.querySelector('.article-share__panel');
  const nativeButton = root.querySelector('[data-share-native]');
  const copyButton = root.querySelector('[data-share-copy]');
  const status = root.querySelector('[data-share-status]');
  const lineLink = root.querySelector('[data-share-line]');
  const facebookLink = root.querySelector('[data-share-facebook]');

  lineLink.href = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
  facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  function setOpen(open) {
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) {
      status.textContent = '';
      panel.querySelector('button:not([hidden]), a').focus();
    }
  }

  async function copyLink() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = shareUrl;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand('copy');
        input.remove();
        if (!copied) throw new Error('copy failed');
      }
      status.textContent = '連結已複製，可以貼給朋友了。';
    } catch (_) {
      status.textContent = '無法自動複製，請從網址列複製。';
    }
  }

  trigger.addEventListener('click', function () {
    setOpen(panel.hidden);
  });
  copyButton.addEventListener('click', copyLink);
  nativeButton.addEventListener('click', async function () {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      setOpen(false);
    } catch (error) {
      if (error && error.name !== 'AbortError') status.textContent = '暫時無法開啟分享，請改用下方選項。';
    }
  });
  document.addEventListener('click', function (event) {
    if (!panel.hidden && !root.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      trigger.focus();
    }
  });
}());
