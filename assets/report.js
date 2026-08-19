/* ============================================================
   yunplan.tw 回報系統
   使用方式：在每頁 </body> 前加入
   <script src="/assets/report.js"></script>
   ============================================================ */
(function () {
  'use strict';

  // ── 設定區：只要改這裡 ──────────────────────────────
  var CFG = {
    // 部署 Apps Script 後把 /exec 網址貼進來（留空則改用 LINE 送出）
    api: '',
    line: 'https://lin.ee/pajsB7X'
  };
  // ────────────────────────────────────────────────

  var TYPES = [
    { v: 'news',    t: '我知道更新的消息', h: '政策、金額、流程有變動' },
    { v: 'exp',     t: '我想分享在地經驗', h: '走過這一段，有些事值得讓人知道' },
    { v: 'wrong',   t: '這裡的資訊怪怪的', h: '跟我實際遇到的不一樣' },
    { v: 'want',    t: '我在找的這裡沒有', h: '正在煩惱、但這裡還沒寫的' },
    { v: 'link',    t: '連結打不開',       h: '' },
    { v: 'other',   t: '其他',             h: '' }
  ];

  var CSS = `
  .yp-fab{position:fixed;right:16px;bottom:16px;z-index:9998;
    background:#9E7A34;color:#FFFDF9;border:none;border-radius:99px;
    padding:11px 18px;font-family:'Noto Sans TC',sans-serif;font-size:14px;font-weight:700;
    box-shadow:0 3px 14px rgba(74,59,42,.28);cursor:pointer;transition:.16s;
    display:flex;align-items:center;gap:7px;line-height:1}
  .yp-fab:hover{background:#8A6A44;transform:translateY(-1px)}
  .yp-fab svg{width:15px;height:15px;flex-shrink:0}
  @media (max-width:640px){.yp-fab{right:12px;bottom:12px;padding:10px 15px;font-size:13.5px}}

  .yp-mask{position:fixed;inset:0;background:rgba(40,32,22,.5);z-index:9999;
    display:none;align-items:center;justify-content:center;padding:16px;
    -webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}
  .yp-mask.on{display:flex}

  .yp-box{background:#FFFDF9;border-radius:10px;width:100%;max-width:480px;
    max-height:90vh;overflow-y:auto;box-shadow:0 12px 40px rgba(40,32,22,.3);
    font-family:'Noto Sans TC',sans-serif;color:#4A3B2A}
  .yp-hd{padding:22px 24px 16px;border-bottom:1px solid rgba(150,120,70,.2)}
  .yp-hd h3{font-family:'Noto Serif TC',serif;font-size:19px;font-weight:900;margin:0 0 8px;line-height:1.5}
  .yp-hd p{font-size:14px;line-height:1.8;color:rgba(74,59,42,.72);margin:0}
  .yp-bd{padding:20px 24px 24px}

  .yp-lb{display:block;font-size:14px;font-weight:700;color:#9E7A34;margin:0 0 9px}
  .yp-types{display:flex;flex-direction:column;gap:7px;margin-bottom:18px}
  .yp-t{background:#fff;border:1.5px solid rgba(150,120,70,.35);border-radius:7px;
    padding:11px 14px;text-align:left;font-family:inherit;font-size:14.5px;color:#4A3B2A;
    cursor:pointer;transition:.15s;line-height:1.5}
  .yp-t:hover{border-color:#C2A24E;background:#FBF6EC}
  .yp-t.on{border-color:#9E7A34;background:#FBF6EC;box-shadow:inset 0 0 0 1px #9E7A34}
  .yp-t b{display:block;font-weight:700}
  .yp-t span{display:block;font-size:12.5px;color:rgba(74,59,42,.5);margin-top:2px}

  .yp-box textarea{width:100%;font-family:inherit;font-size:15px;color:#4A3B2A;
    background:#fff;border:1.5px solid rgba(150,120,70,.35);border-radius:7px;
    padding:11px 13px;margin-bottom:16px;line-height:1.7;resize:vertical}
  .yp-box textarea{min-height:110px}
  .yp-box input[type="url"],.yp-box select{width:100%;font-family:inherit;font-size:14.5px;color:#4A3B2A;
    background:#fff;border:1.5px solid rgba(150,120,70,.35);border-radius:7px;
    padding:11px 13px;margin-bottom:16px;line-height:1.5}
  .yp-box textarea:focus,.yp-box input:focus,.yp-box select:focus{border-color:#9E7A34;outline:none}
  .yp-check{display:flex;align-items:flex-start;gap:8px;font-size:13px;line-height:1.7;
    color:rgba(74,59,42,.68);margin:-2px 0 17px;cursor:pointer}
  .yp-check input{margin-top:4px;accent-color:#9E7A34}

  .yp-page{background:#F1EADB;border-radius:6px;padding:10px 13px;margin-bottom:18px;
    font-size:12.5px;color:rgba(74,59,42,.6);line-height:1.7;word-break:break-all}

  .yp-btns{display:flex;gap:9px}
  .yp-btn{flex:1;border:none;border-radius:7px;padding:13px;font-family:inherit;
    font-size:15px;font-weight:700;cursor:pointer;transition:.15s}
  .yp-send{background:#9E7A34;color:#FFFDF9}
  .yp-send:hover{background:#8A6A44}
  .yp-send:disabled{opacity:.4;cursor:not-allowed}
  .yp-cancel{background:none;border:1.5px solid rgba(150,120,70,.35);color:rgba(74,59,42,.6);flex:0 0 auto;padding:13px 20px}
  .yp-cancel:hover{background:#F1EADB}

  .yp-ok{text-align:center;padding:34px 24px}
  .yp-ok .ic{font-size:38px;line-height:1;margin-bottom:14px}
  .yp-ok h3{font-family:'Noto Serif TC',serif;font-size:19px;font-weight:900;margin:0 0 10px}
  .yp-ok p{font-size:14.5px;line-height:1.85;color:rgba(74,59,42,.72);margin:0 0 20px}
  .yp-priv{font-size:12px;color:rgba(74,59,42,.45);line-height:1.7;margin-top:14px}

  .yp-inline{max-width:720px;margin:38px auto;padding:0 20px;font-family:'Noto Sans TC',sans-serif;color:#4A3B2A}
  .yp-inline-in{background:#FBF6EC;border:1px solid rgba(150,120,70,.28);border-left:4px solid #C2A24E;
    border-radius:0 7px 7px 0;padding:20px 22px}
  .yp-inline h3{font-family:'Noto Serif TC',serif;font-size:18px;margin:0 0 7px;line-height:1.5}
  .yp-inline p{font-size:14px;line-height:1.8;color:rgba(74,59,42,.72);margin:0}
  .yp-inline-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}
  .yp-inline-btn{border:1.5px solid #9E7A34;border-radius:6px;padding:9px 15px;background:#FFFDF9;
    color:#9E7A34;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer}
  .yp-inline-btn.primary{background:#9E7A34;color:#FFFDF9}
  .yp-inline-btn:hover{background:#8A6A44;color:#FFFDF9;border-color:#8A6A44}

  .yp-reader{max-width:720px;margin:38px auto;padding:0 20px;font-family:'Noto Sans TC',sans-serif;color:#4A3B2A}
  .yp-reader h2{font-family:'Noto Serif TC',serif;font-size:21px;margin:0 0 14px}
  .yp-reader-card{background:#FFFDF9;border:1px solid rgba(92,138,102,.3);border-radius:7px;
    padding:18px 20px;margin:0 0 12px}
  .yp-reader-meta{font-size:12.5px;color:#5C8A66;margin-bottom:7px}
  .yp-reader-body{font-size:14.5px;line-height:1.85;color:rgba(74,59,42,.8)}
  .yp-reader-source{font-size:12.5px;margin-top:9px}
  .yp-reader-source a{color:#2F6B54;text-decoration:underline;text-underline-offset:3px}
  @media (max-width:640px){.yp-inline,.yp-reader{padding:0 16px}.yp-inline-in{padding:17px 18px}}
  `;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  // 樣式
  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  // 浮動按鈕
  var fab = el('button', 'yp-fab');
  fab.type = 'button';
  fab.setAttribute('aria-label', '分享你知道的資訊');
  fab.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>分享你知道的';
  document.body.appendChild(fab);

  // 遮罩與對話框
  var mask = el('div', 'yp-mask');
  var box = el('div', 'yp-box');
  mask.appendChild(box);
  document.body.appendChild(mask);

  var picked = null;

  function form() {
    var typeHtml = TYPES.map(function (t) {
      return '<button type="button" class="yp-t" data-v="' + t.v + '">' +
             '<b>' + t.t + '</b>' + (t.h ? '<span>' + t.h + '</span>' : '') + '</button>';
    }).join('');

    box.innerHTML =
      '<div class="yp-hd">' +
        '<h3>一起把這張地圖畫完整</h3>' +
        '<p>這裡的資訊是我一點一點查、一點一點寫下來的。但一個人看得有限，而長照的規定又常常在變。</p>' +
        '<p style="margin-top:10px">如果你走過這一段、知道更新的消息，或發現哪裡不對——<b>說一聲，讓下一個著急的蘭陽家庭少走一點冤枉路。</b></p>' +
      '</div>' +
      '<div class="yp-bd">' +
        '<span class="yp-lb">是哪一種？</span>' +
        '<div class="yp-types">' + typeHtml + '</div>' +
        '<span class="yp-lb">想說的話</span>' +
        '<textarea id="ypMsg" placeholder="不用寫得很完整，想到什麼講什麼就好。"></textarea>' +
        '<span class="yp-lb">相關鄉鎮（選填）</span>' +
        '<select id="ypTown"><option value="">不指定</option><option>宜蘭市</option><option>羅東鎮</option><option>蘇澳鎮</option><option>頭城鎮</option><option>礁溪鄉</option><option>壯圍鄉</option><option>員山鄉</option><option>冬山鄉</option><option>五結鄉</option><option>三星鄉</option><option>大同鄉</option><option>南澳鄉</option><option>其他／不確定</option></select>' +
        '<span class="yp-lb">資料來源網址（選填）</span>' +
        '<input id="ypSource" type="url" inputmode="url" placeholder="例如：政府公告或服務單位網頁">' +
        '<label class="yp-check"><input id="ypPublish" type="checkbox"><span>同意查核後，以匿名方式整理刊登在網站的「讀者補充」。</span></label>' +
        '<div class="yp-page">這一頁：' + location.pathname + '</div>' +
        '<div class="yp-btns">' +
          '<button type="button" class="yp-btn yp-cancel" id="ypNo">取消</button>' +
          '<button type="button" class="yp-btn yp-send" id="ypGo" disabled>送出</button>' +
        '</div>' +
        '<p class="yp-priv">表單不要求姓名或聯絡方式。內容會先審核，不會直接公開；透過 LINE 傳送時，對方會看到你的 LINE 顯示名稱。</p>' +
      '</div>';

    box.querySelectorAll('.yp-t').forEach(function (b) {
      b.onclick = function () {
        box.querySelectorAll('.yp-t').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        picked = b.dataset.v;
        check();
      };
    });
    box.querySelector('#ypMsg').oninput = check;
    box.querySelector('#ypNo').onclick = close;
    box.querySelector('#ypGo').onclick = send;
  }

  function check() {
    var msg = box.querySelector('#ypMsg');
    var go = box.querySelector('#ypGo');
    if (msg && go) go.disabled = !(picked && msg.value.trim().length >= 3);
  }

  function label(v) {
    for (var i = 0; i < TYPES.length; i++) if (TYPES[i].v === v) return TYPES[i].t;
    return v;
  }

  function send() {
    var msg = box.querySelector('#ypMsg').value.trim();
    var town = box.querySelector('#ypTown').value;
    var source = box.querySelector('#ypSource').value.trim();
    var publish = box.querySelector('#ypPublish').checked;
    var go = box.querySelector('#ypGo');
    go.disabled = true;
    go.textContent = '送出中…';

    var text =
      '【yunplan 讀者分享｜待審核】\n' +
      '類型：' + label(picked) + '\n' +
      '相關鄉鎮：' + (town || '未指定') + '\n' +
      '頁面：' + location.href + '\n' +
      '資料來源：' + (source || '未提供') + '\n' +
      '匿名刊登：' + (publish ? '同意' : '僅供查核') + '\n' +
      '內容：' + msg;

    if (CFG.api) {
      var fd = new FormData();
      fd.append('kind', 'reader_contribution');
      fd.append('status', 'pending');
      fd.append('type', label(picked));
      fd.append('town', town);
      fd.append('page', location.href);
      fd.append('source', source);
      fd.append('publish', publish ? 'yes' : 'no');
      fd.append('msg', msg);
      fetch(CFG.api, { method: 'POST', mode: 'no-cors', body: fd })
        .then(done).catch(done);
    } else {
      // 未設定後端：複製內容並開啟 LINE
      copy(text).then(function () { done(true); });
    }
  }

  function copy(t) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(t).catch(function () { return fb(t); });
    }
    return Promise.resolve(fb(t));
  }
  function fb(t) {
    var ta = document.createElement('textarea');
    ta.value = t;
    ta.style.cssText = 'position:fixed;opacity:0;top:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }

  function done(viaLine) {
    var extra = (viaLine === true && !CFG.api)
      ? '<p>內容已經複製起來了，接著會開啟 LINE，貼上傳送給我就可以。</p>'
      : '<p>內容已進入待審核，我會先查證，不會直接公開。</p>' +
        '<p style="font-size:13.5px;color:rgba(74,59,42,.55);margin-top:-8px">若你同意匿名刊登，確認後才會整理到「讀者補充」。</p>';
    box.innerHTML =
      '<div class="yp-ok">' +
        '<div class="ic">🌿</div>' +
        '<h3>收到了，謝謝你</h3>' +
        extra +
        '<button type="button" class="yp-btn yp-send" id="ypDone" style="width:auto;padding:12px 30px">關閉</button>' +
      '</div>';
    box.querySelector('#ypDone').onclick = close;
    if (viaLine === true && !CFG.api) {
      setTimeout(function () { window.open(CFG.line, '_blank'); }, 600);
    }
  }

  function open(initialType) {
    form();
    picked = null;
    mask.classList.add('on');
    if (initialType) {
      var preset = box.querySelector('.yp-t[data-v="' + initialType + '"]');
      if (preset) preset.click();
    }
  }
  function close() { mask.classList.remove('on'); }

  function addInlineInvite() {
    if (location.pathname === '/' || location.pathname.indexOf('/tools/') === 0) return;
    var footer = document.querySelector('footer');
    if (!footer || document.querySelector('.yp-inline')) return;
    var wrap = el('section', 'yp-inline');
    wrap.setAttribute('aria-label', '分享資訊與問題回報');
    wrap.innerHTML =
      '<div class="yp-inline-in">' +
        '<h3>你也知道相關資訊嗎？</h3>' +
        '<p>歡迎補充宜蘭在地資源、實際經驗或官方來源。內容會先查核，不會直接公開。</p>' +
        '<div class="yp-inline-actions">' +
          '<button type="button" class="yp-inline-btn primary" data-open-share>分享你知道的資訊</button>' +
          '<button type="button" class="yp-inline-btn" data-open-report>回報錯誤或失效連結</button>' +
        '</div>' +
      '</div>';
    footer.parentNode.insertBefore(wrap, footer);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function renderReaderNotes() {
    var all = window.YP_APPROVED_NOTES || {};
    var notes = all[location.pathname] || [];
    if (!notes.length) return;
    var invite = document.querySelector('.yp-inline');
    var footer = document.querySelector('footer');
    var anchor = invite || footer;
    if (!anchor || document.querySelector('.yp-reader')) return;
    var section = el('section', 'yp-reader');
    section.setAttribute('aria-label', '經查核的讀者補充');
    section.innerHTML = '<h2>讀者補充</h2>' + notes.map(function (n) {
      var source = n.source
        ? '<div class="yp-reader-source">參考來源：<a href="' + esc(n.source) + '" target="_blank" rel="noopener">查看資料</a></div>'
        : '';
      return '<article class="yp-reader-card">' +
        '<div class="yp-reader-meta">' + esc(n.town || '讀者提供') + ' · 本站查核 ' + esc(n.checked || '') + '</div>' +
        '<div class="yp-reader-body">' + esc(n.body) + '</div>' + source +
      '</article>';
    }).join('');
    anchor.parentNode.insertBefore(section, anchor);
  }

  fab.onclick = function () { open(null); };
  document.addEventListener('click', function (e) {
    var share = e.target.closest && e.target.closest('[data-open-share]');
    var report = e.target.closest && e.target.closest('[data-open-report]');
    if (share) {
      e.preventDefault();
      open(null);
    } else if (report) {
      e.preventDefault();
      open('wrong');
    }
  });
  mask.onclick = function (e) { if (e.target === mask) close(); };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mask.classList.contains('on')) close();
  });

  addInlineInvite();
  renderReaderNotes();
})();