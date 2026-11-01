/* ==========================================================================
 *  Acc Cell WebApp — inti: API (fetch REST ke GAS), cache perangkat (SWR),
 *  router hash SPA, toast/sheet, statistik, PWA, penyesuaian bilah lisensi.
 *  © Nabire Kreatif — template berlisensi
 * ========================================================================== */
(function () {
  'use strict';
  const CFG = window.ACC_CONFIG || {};
  const GAS_URL = String(CFG.GAS_URL || '').trim();
  const LS = 'acc:v1:';
  const App = window.App = { mode: window.ACC_MODE === 'admin' ? 'admin' : 'public', base: window.ACC_MODE === 'admin' ? '../' : '', cfg: CFG, gas: GAS_URL, demo: !GAS_URL, pub: null, admin: null, pages: {}, cur: '', dirty: {} };

  /* ---------------- util ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const I = (n, cls) => '<span class="mi' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + n + '</span>';
  const rp = n => 'Rp ' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const hp08 = v => { let s = String(v == null ? '' : v).replace(/[^0-9+]/g, '').replace(/^\+/, ''); if (s.indexOf('62') === 0) s = '0' + s.slice(2); else if (s[0] === '8') s = '0' + s; return s; };
  const hp62 = v => { const s = hp08(v); return s ? '62' + s.slice(1) : ''; };
  const hashStr = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h + ':' + s.length; };
  const debounce = (fn, ms) => { let t; return function () { const a = arguments; clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; };
  const img = (u, w) => { u = String(u || ''); if (/lh3\.googleusercontent\.com\/d\/[^=]+$/.test(u)) return u + '=w' + (w || 800); if (u && window.ACC_MODE === 'admin' && !/^([a-z]+:|\/|data:|\.\.\/)/i.test(u)) return '../' + u; return u; };
  const cabNama = c => c === 'serui' ? 'Serui' : c === 'keduanya' ? 'Nabire & Serui' : c === 'semua' ? 'Semua' : 'Nabire';
  const tgl = iso => { if (!iso) return '-'; const d = new Date(iso); if (isNaN(d)) return String(iso); return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
  const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2);
  Object.assign(App, { $, $$, esc, I, rp, hp08, hp62, debounce, img, cabNama, tgl, uid, hashStr });

  /* ---------------- ikon sosial media (SVG garis, jelas tanpa font) ---------------- */
  const SVG = {
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    youtube: '<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    tiktok: '<path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5"/>',
    whatsapp: '<path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>',
    website: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    shopee: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    tokopedia: '<path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M2 7h20v3a2 2 0 0 1-2 2 3 3 0 0 1-2-1 3 3 0 0 1-4 0 3 3 0 0 1-4 0 3 3 0 0 1-4 0 3 3 0 0 1-2 1 2 2 0 0 1-2-2z"/>'
  };
  const socIcon = k => '<svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (SVG[k] || SVG.website) + '</svg>';
  App.socIcon = socIcon;
  function sosmedList(s, gaya) {
    return s.map(x => {
      const k = String(x.platform || '').toLowerCase(), wa = x.url === '#wa' || (k === 'whatsapp' && !/^https?:/.test(x.url || ''));
      const at = (wa ? 'href="#" data-wa-any' : 'href="' + esc(x.url) + '" target="_blank" rel="noopener"') + ' data-soc="' + esc(k) + '"';
      return gaya === 'bulat'
        ? '<a class="soc-r" ' + at + ' aria-label="' + esc(x.platform) + '"><span class="b">' + socIcon(k) + '</span><span class="l">' + esc(x.platform) + '</span></a>'
        : '<a class="soc-btn" ' + at + '><span class="b">' + socIcon(k) + '</span><span class="grow"><b>' + esc(x.platform) + '</b>' + (x.label ? '<small>' + esc(x.label) + '</small>' : '') + '</span>' + I('arrow_forward') + '</a>';
    }).join('');
  }
  App.sosmedList = sosmedList;

  /* ---------------- penyimpanan perangkat ---------------- */
  const Store = App.Store = {
    get(k, d) { try { const v = localStorage.getItem(LS + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { try { Object.keys(localStorage).filter(x => x.indexOf(LS + 'a:') === 0).forEach(x => localStorage.removeItem(x)); localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e2) { } } },
    del(k) { try { localStorage.removeItem(LS + k); } catch (e) { } },
    ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(LS + k); sessionStorage.setItem(LS + k, v); } catch (e) { return null; } }
  };

  /* ---------------- pengukur kinerja ---------------- */
  const Perf = window.Perf = { rows: [], add(a, t, s) { this.rows.push({ action: a, total: t, server: s == null ? null : s, net: s == null ? null : t - s }); if (this.rows.length > 200) this.rows.shift(); }, table() { console.table(this.rows.slice(-30)); } };

  /* ---------------- API REST (timeout, retry baca, reqId tulis) ---------------- */
  const READ = /^(adminBoot|stats|batch|me|logs|notif\.config|notif\.queue|wa\.audience|wa\.blastList|crm\.list|crm\.stats|crm\.detail|crm\.export)$/;
  async function apiOnce(action, data, timeout, reqId) {
    const ctrl = window.AbortController ? new AbortController() : null, timer = setTimeout(() => ctrl && ctrl.abort(), timeout), t0 = performance.now();
    try {
      const res = await fetch(GAS_URL, { method: 'POST', redirect: 'follow', cache: 'no-store', signal: ctrl ? ctrl.signal : undefined,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: App.token || '', reqId, data: data || {} }) });
      const text = await res.text();
      try { const j = JSON.parse(text); Perf.add(action, Math.round(performance.now() - t0), j.ms); return j; }
      catch (e) { return { success: false, network: true, retryable: res.status >= 500 || res.status === 429, message: 'Server membalas HTTP ' + res.status + ' (bukan JSON). Pastikan deploy Web App aksesnya "Anyone" dan URL /exec benar.' }; }
    } catch (err) {
      return { success: false, network: true, retryable: true, message: err && err.name === 'AbortError' ? 'Server terlalu lama merespons.' : 'Koneksi terputus. Periksa internet Anda.' };
    } finally { clearTimeout(timer); }
  }
  const waitOnline = ms => new Promise(r => { if (navigator.onLine !== false) return r(); const t = setTimeout(done, ms); function done() { clearTimeout(t); removeEventListener('online', done); r(); } addEventListener('online', done); });
  App.api = async function (action, data, opt) {
    opt = opt || {};
    if (!GAS_URL) return { success: false, message: 'Mode demo: backend belum terhubung. Isi GAS_URL di js/config.js.' };
    const isRead = READ.test(action), reqId = isRead ? '' : (opt.reqId || uid()), tries = isRead ? 3 : 2;
    let res;
    for (let i = 0; i < tries; i++) {
      if (i) { await new Promise(r => setTimeout(r, 1200 * i)); if (navigator.onLine === false) await waitOnline(15000); }
      res = await apiOnce(action, data, isRead ? (i ? 40000 : 25000) : (opt.timeout || 90000), reqId);
      if (res.success || !res.retryable) break;
    }
    if (!res.success && res.data && res.data.code === 'AUTH' && App.onAuthExpired) App.onAuthExpired();
    return res;
  };
  App.getPublic = async function () {
    const ctrl = window.AbortController ? new AbortController() : null, timer = setTimeout(() => ctrl && ctrl.abort(), 25000);
    try {
      const r = await fetch(GAS_URL + (GAS_URL.indexOf('?') > -1 ? '&' : '?') + 'action=public', { cache: 'no-store', redirect: 'follow', signal: ctrl ? ctrl.signal : undefined });
      return JSON.parse(await r.text());
    } catch (e) { return { success: false, message: 'Gagal memuat data.' }; } finally { clearTimeout(timer); }
  };
  App.warmUp = function () { if (GAS_URL) fetch(GAS_URL + (GAS_URL.indexOf('?') > -1 ? '&' : '?') + 'ping=' + Date.now(), { mode: 'no-cors', cache: 'no-store' }).catch(() => { }); };

  /* ---------------- data publik: SWR (tampil seketika dari cache) ---------------- */
  App.loadPublic = async function (force) {
    if (!GAS_URL) { setPub(window.ACC_DEMO, true); return; }
    const c = Store.get('pub', null);
    if (c && !App.pub) setPub(c.data, true);
    const fresh = (Number(CFG.FRESH_DETIK) || 60) * 1000;
    if (c && !force && Date.now() - c.t < fresh) return;
    const r = await App.getPublic();
    if (r && r.success) {
      const h = hashStr(JSON.stringify(r.data));
      Store.set('pub', { t: Date.now(), h, data: r.data });
      if (!c || c.h !== h || !App.pub) setPub(r.data, false);
    } else if (!App.pub) {
      App.pubError = r && r.message || 'Gagal memuat data';
      App.rerender();
    }
  };
  function setPub(d, fromCache) {
    App.pub = d; App.pubError = '';
    const s = (d && d.settings) || {};
    if (/^#[0-9a-f]{6}$/i.test(s.warna_aksen || '')) document.documentElement.style.setProperty('--amber', s.warna_aksen);
    if (s.meta_deskripsi) { const m = $('meta[name=description]'); if (m) m.setAttribute('content', s.meta_deskripsi); }
    App.rerender();
    if (!fromCache || !GAS_URL) App.emit('pub');
  }

  // halaman publik di tab lain ikut diperbarui saat admin menyimpan perubahan
  addEventListener('storage', e => {
    if (App.mode === 'admin' || e.key !== LS + 'pub') return;
    const c = Store.get('pub', null);
    if (c && c.data && c.t) { if (A_hash(c.data) !== A_hash(App.pub)) setPub(c.data, true); } else if (c) App.loadPublic(true);
  });
  const A_hash = d => hashStr(JSON.stringify(d || null));
  /* ---------------- event kecil ---------------- */
  const ev = {};
  App.on = (n, f) => (ev[n] = ev[n] || []).push(f);
  App.emit = (n, x) => (ev[n] || []).forEach(f => { try { f(x); } catch (e) { console.error(e); } });

  /* ---------------- router hash (halaman tidak dibuang) ---------------- */
  App.page = function (name, def) { App.pages[name] = def; };
  App.go = function (path) { const h = '#/' + path; if (location.hash === h) route(); else location.hash = h; };
  App.back = function (fallback) { if (history.length > 1 && App._navCount > 1) history.back(); else App.go(fallback || ''); };
  App._navCount = 0;
  App.rerender = function () {
    Object.keys(App.pages).forEach(k => App.dirty[k] = true);
    const def = App.pages[App.cur]; if (def) { App.dirty[App.cur] = false; def.render(pageEl(App.cur), App.param, true); }
  };
  function pageEl(name) {
    let el = document.querySelector('.page[data-page="' + name + '"]');
    if (!el) { el = document.createElement('section'); el.className = 'page'; el.dataset.page = name; $('#app').appendChild(el); }
    return el;
  }
  function route() {
    let raw = location.hash.replace(/^#\/?/, '');
    if (/^key\/?$/i.test(raw)) return;                       // menu lisensi (#key) — biarkan halaman saat ini
    const parts = raw.split('/');
    let name, param;
    if (App.mode === 'admin') { name = 'admin'; param = decodeURIComponent(parts[0] || ''); }
    else { name = App.pages[parts[0]] && !App.pages[parts[0]].admin ? parts[0] : 'bio'; param = parts.slice(1).map(decodeURIComponent).join('/'); }
    const prev = App.cur, def = App.pages[name];
    App._navCount++;
    const el = pageEl(name);
    const changed = prev !== name || App.param !== param;
    App.prev = prev; App.cur = name; App.param = param;
    $$('.page').forEach(p => p.hidden = p !== el);
    document.body.classList.toggle('pub', !def.admin);
    document.body.classList.toggle('is-admin', !!def.admin);
    document.body.classList.remove('has-sticky');
    if (def.render) def.render(el, param, false, changed);
    App.dirty[name] = false;
    $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === (def.nav || name)));
    const pn = $('#pubnav'); if (pn) pn.hidden = !!def.admin;
    if (changed && !def.keepScroll) App.scrollY(0);
    if (def.title) document.title = def.title(param) + ' — ' + ((App.pub && App.pub.settings && App.pub.settings.nama_toko) || 'Acc Cell');
    App.emit('route', name);
  }
  App.route = route;
  App.scrollY = y => { try { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, y); } };

  /* ---------------- toast / sheet / konfirmasi ---------------- */
  App.toast = function (msg, type) {
    const box = $('#toasts'), t = document.createElement('div');
    t.className = 'toast ' + (type || 'ok'); t.setAttribute('role', 'status');
    t.innerHTML = I(type === 'err' ? 'error' : type === 'info' ? 'info' : 'check_circle') + '<div>' + esc(msg) + '</div>';
    box.appendChild(t); setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, type === 'err' ? 5000 : 2600);
  };
  App.sheet = function (html, opt) {
    opt = opt || {};
    const o = document.createElement('div');
    o.className = 'overlay' + (opt.center ? ' center' : ''); o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
    o.innerHTML = '<div class="sheet' + (opt.lg ? ' lg' : '') + '">' + (opt.center ? '' : '<div class="grab"></div>') +
      (opt.title ? '<div class="sheet-h"><h3>' + esc(opt.title) + '</h3><button class="icon-btn" data-x aria-label="Tutup">' + I('close') + '</button></div>' : '') + html + '</div>';
    const close = () => { if (!o.isConnected) return; o.remove(); document.removeEventListener('keydown', onKey); if (opt.onClose) opt.onClose(); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-x]')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(o);
    o.close = close;
    const s = o.querySelector('.sheet'); if (s) s.scrollTop = 0;
    return o;
  };
  App.confirm = function (msg, okText, danger) {
    return new Promise(res => {
      const o = App.sheet('<p style="margin:0 0 16px;font-size:15px;line-height:22px">' + esc(msg) + '</p><div class="row"><button class="btn btn-ghost grow" data-x>Batal</button><button class="btn ' + (danger ? 'btn-danger' : 'btn-ink') + ' grow" data-ok>' + esc(okText || 'Ya, lanjutkan') + '</button></div>', { center: true, title: 'Konfirmasi', onClose: () => res(false) });
      o.querySelector('[data-ok]').onclick = () => { o.querySelector('[data-ok]').disabled = true; res(true); o.remove(); };
    });
  };
  App.copy = function (text, label) {
    const done = () => App.toast((label || 'Teks') + ' disalin');
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() { const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) { App.toast('Gagal menyalin', 'err'); } t.remove(); }
  };

  /* ---------------- WhatsApp ---------------- */
  App.branches = () => ((App.pub && App.pub.branches) || []).filter(b => b.aktif !== false);
  App.branch = id => App.branches().find(b => b.id === id);
  App.waUrl = (nomor, msg) => 'https://wa.me/' + hp62(nomor) + (msg ? '?text=' + encodeURIComponent(msg) : '');
  App.openWa = function (cabang, msg, track) {
    const b = App.branch(cabang); if (!b) return App.toast('Nomor admin cabang belum diatur', 'err');
    if (track !== false) App.track('klik_wa', track && track.p, cabang);
    const text = typeof msg === 'function' ? msg(b) : msg;
    window.open(App.waUrl(b.nomor_wa, text), '_blank', 'noopener');
  };
  /** Pilih cabang (bottom sheet) lalu buka WhatsApp. msg(b) → teks */
  App.pickBranch = function (msg, opt) {
    opt = opt || {};
    const list = App.branches();
    if (list.length === 1) return App.openWa(list[0].id, msg, opt.track);
    const o = App.sheet('<p class="muted" style="margin:-4px 0 12px">' + esc(opt.sub || 'Pilih cabang Acc Cell yang ingin Anda hubungi:') + '</p><div class="list">' +
      list.map(b => '<button class="li" data-b="' + esc(b.id) + '" style="text-align:left;width:100%"><span class="avatar-i" style="background:#E7F9EE;color:#1DA851">' + I('chat', 'fill') + '</span><span class="grow"><b>' + esc(b.nama) + '</b><span class="meta">' + esc(hp08(b.nomor_wa)) + ' · ' + esc(b.jam_buka || '') + '</span></span>' + I('chevron_right') + '</button>').join('') + '</div>',
      { title: opt.title || 'Chat Admin WhatsApp' });
    o.addEventListener('click', e => { const t = e.target.closest('[data-b]'); if (t) { o.close(); App.openWa(t.dataset.b, msg, opt.track); } });
  };

  /* ---------------- statistik (batch, tanpa menunggu) ---------------- */
  let q = [], qt = null;
  App.track = function (j, p, c) {
    if (!GAS_URL || App.mode === 'admin') return;
    q.push({ j, p: p || '', c: c || '' });
    clearTimeout(qt); qt = setTimeout(flushTrack, q.length >= 10 ? 0 : 4000);
  };
  function flushTrack() {
    if (!q.length || !GAS_URL) return;
    const body = JSON.stringify({ action: 'track', data: { events: q.splice(0, 25) } });
    try { if (navigator.sendBeacon && navigator.sendBeacon(GAS_URL, new Blob([body], { type: 'text/plain;charset=utf-8' }))) return; } catch (e) { }
    fetch(GAS_URL, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' } }).catch(() => { });
  }
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushTrack(); });
  addEventListener('pagehide', flushTrack);

  /* ---------------- PWA: pasang aplikasi ---------------- */
  let deferred = null;
  const PWA_KEY = 'pwa:selesai';
  const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  function pwaDone() { Store.set(PWA_KEY, Date.now()); const b = $('#pwa'); if (b) b.remove(); }
  function showPwa(ios) {
    if (isStandalone() || Store.get(PWA_KEY, 0) || $('#pwa') || App.mode === 'admin') return;
    const b = document.createElement('div'); b.id = 'pwa'; b.className = 'pwa'; b.setAttribute('role', 'dialog');
    b.innerHTML = '<img src="assets/icon-192.png" alt=""><div class="grow"><b>Pasang Aplikasi Acc Cell</b><span>' +
      (ios ? 'Ketuk ' + I('ios_share') + ' Bagikan lalu “Tambah ke Layar Utama”.' : 'Buka katalog & rekening resmi lebih cepat, langsung dari layar HP.') + '</span></div>' +
      (ios ? '' : '<button class="btn btn-amber" data-pwa-ok>' + I('download') + 'Pasang</button>') + '<button class="x" data-pwa-x aria-label="Tutup">' + I('close') + '</button>';
    document.body.appendChild(b);
    b.addEventListener('click', async e => {
      if (e.target.closest('[data-pwa-x]')) return pwaDone();
      if (e.target.closest('[data-pwa-ok]') && deferred) { const d = deferred; deferred = null; pwaDone(); d.prompt(); try { await d.userChoice; } catch (er) { } }
    });
  }
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; setTimeout(() => showPwa(false), 2500); });
  addEventListener('appinstalled', pwaDone);
  App.on('route', n => { const b = $('#pwa'); if (b) b.hidden = n === 'admin'; });
  if ('serviceWorker' in navigator && location.protocol === 'https:' && window.ACC_MODE !== 'admin') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));

  /* ---------------- bilah lisensi: geser elemen bawah agar tidak tertutup ---------------- */
  function measureNk() {
    const host = document.querySelector('[data-nkl="1"]');
    if (!host || document.hidden) return;
    let h = 0;
    [16, 60, Math.round(innerWidth / 2)].forEach(x => {
      for (let y = innerHeight - 2; y > innerHeight - 160; y -= 4) {
        const el = document.elementFromPoint(Math.min(x, innerWidth - 1), y);
        if (el !== host) { h = Math.max(h, innerHeight - y - 4); break; }
      }
    });
    const v = (h > 0 ? h + 4 : 0) + 'px';
    if (document.documentElement.style.getPropertyValue('--nk-h') !== v) document.documentElement.style.setProperty('--nk-h', v);
  }
  App.measureNk = measureNk;
  App.nkCopy = function () {
    const st = window.NKLicense && NKLicense.status ? NKLicense.status() : { mode: 'demo' };
    const y = new Date().getFullYear();
    if (st.mode === 'lisensi' || st.mode === 'owner' || st.mode === 'dev')
      return '© ' + y + ' ' + esc(CFG.NAMA_USAHA || 'Acc Cell') + '. by <a href="https://nabirekreatif.vercel.app" target="_blank" rel="noopener">Nabirekreatif.com</a>';
    return '© ' + y + ' Nabire Kreatif. Semua hak dilindungi. · <a href="https://nabirekreatif.vercel.app" target="_blank" rel="noopener">www.nabirekreatif.com</a>';
  };
  function refreshCopy() { $$('[data-nk-copy]').forEach(el => el.innerHTML = App.nkCopy()); }
  App.refreshCopy = refreshCopy;

  /* ---------------- mulai ---------------- */
  App.start = function () {
    window.addEventListener('hashchange', route);
    route();
    App.loadPublic();
    App.warmUp();
    if (App.mode !== 'admin') App.track('kunjungan');
    if (Store.ss('visit') !== '1') { Store.ss('visit', '1'); }
    if (isIOS() && !isStandalone()) setTimeout(() => showPwa(true), 4000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') { const away = Date.now() - (App._hiddenAt || Date.now()); if (away > 120000) { App.warmUp(); App.loadPublic(); } }
      else App._hiddenAt = Date.now();
    });
    if (window.NKLicense && NKLicense.ready) NKLicense.ready.then(() => { refreshCopy(); setTimeout(measureNk, 300); });
    addEventListener('nkl:status', () => { refreshCopy(); setTimeout(measureNk, 100); });
    refreshCopy();
    setTimeout(measureNk, 900); setInterval(measureNk, 2500); addEventListener('resize', debounce(measureNk, 200));
  };
})();
