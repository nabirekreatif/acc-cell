/* ==========================================================================
 *  Acc Cell WebApp — Dasbor Admin (Superadmin & Admin Cabang)
 *  Produk · Tampilan · Slide · Pop-up · Rekening · Cabang · Layanan ·
 *  WhatsApp & Notifikasi · CRM Kontak · Admin · Migrasi · Log · Akun
 *  © Nabire Kreatif — template berlisensi
 * ========================================================================== */
(function () {
  'use strict';
  const A = window.App, { $, esc, I, rp, img, cabNama, hp08, tgl, Store } = A;
  const AUTH = 'auth';
  let el = null, shellBuilt = false, view = 'beranda';
  const isSA = () => A.user && A.user.peran === 'superadmin';
  const B = () => A.admin || {};

  /* ---------------- sesi ---------------- */
  (function restore() { const a = Store.get(AUTH, null); if (a && a.exp > Date.now() + 60000) { A.token = a.token; A.user = a.user; A.mustChange = a.mustChange; } })();
  function saveAuth(token, user, mustChange) {
    A.token = token; A.user = user; A.mustChange = !!mustChange;
    Store.set(AUTH, { token, user, mustChange: !!mustChange, exp: Date.now() + 11.5 * 3600e3 });
  }
  function logout(msg) {
    Store.del(AUTH); A.token = ''; A.user = null; A.admin = null; shellBuilt = false;
    if (msg) A.toast(msg, 'info');
    if (A.cur === 'admin') render(el, '');
  }
  A.onAuthExpired = () => logout('Sesi berakhir. Silakan masuk lagi.');
  const bootKey = () => 'a:boot:' + (A.user && A.user.id);
  function setBoot(b) { A.admin = b; Store.set(bootKey(), { t: Date.now(), data: b }); }
  async function loadBoot(force) {
    const c = Store.get(bootKey(), null);
    if (c && !A.admin) A.admin = c.data;
    if (c && !force && Date.now() - c.t < 60000) return true;
    const r = await A.api('adminBoot');
    if (r.success) { const changed = !A.admin || A.hashStr(JSON.stringify(r.data)) !== A.hashStr(JSON.stringify(A.admin)); setBoot(r.data); if (changed && shellBuilt) show(view, true); return true; }
    if (!A.admin && shellBuilt) show(view);
    if (!A.admin) A.toast(r.message, 'err');
    return false;
  }
  // tandai cache publik basi seketika (tab/halaman publik lain langsung mengambil data baru), lalu segarkan
  const refreshPublic = () => { const c = Store.get('pub', null); if (c) { c.t = 0; Store.set('pub', c); } setTimeout(() => A.loadPublic(true), 150); };

  /* ---------------- menu ---------------- */
  const MENU = [
    { id: 'beranda', t: 'Beranda', i: 'space_dashboard', all: 1 },
    { id: 'produk', t: 'Produk', i: 'smartphone', all: 1 },
    { g: 'Tampilan Link Bio' },
    { id: 'tampilan', t: 'Profil & Urutan', i: 'tune' },
    { id: 'banner', t: 'Slide Hero', i: 'view_carousel' },
    { id: 'popup', t: 'Pop-up Promo', i: 'campaign' },
    { id: 'bayar', t: 'Rekening & QRIS', i: 'account_balance_wallet' },
    { id: 'cabang', t: 'Cabang & Sosmed', i: 'storefront' },
    { id: 'layanan', t: 'Halaman Layanan', i: 'build_circle' },
    { g: 'Pemasaran' },
    { id: 'notif', t: 'WhatsApp & Notifikasi', i: 'forum' },
    { id: 'crm', t: 'CRM Kontak', i: 'contacts' },
    { g: 'Sistem' },
    { id: 'pengguna', t: 'Admin & Akses', i: 'manage_accounts' },
    { id: 'migrasi', t: 'Migrasi Data', i: 'move_up' },
    { id: 'log', t: 'Log Aktivitas', i: 'history' },
    { id: 'akun', t: 'Akun Saya', i: 'person', all: 1 }
  ];
  const allowed = id => { const m = MENU.find(x => x.id === id); return m && (m.all || isSA()); };

  A.page('admin', {
    admin: true, nav: 'admin', title: () => 'Dasbor Admin',
    render(e, sub, rerender) { el = e; if (rerender && shellBuilt) return; render(e, sub); }
  });

  function render(e, sub) {
    if (A.demo) return renderSetup(e);
    if (!A.token || !A.user) { shellBuilt = false; return renderLogin(e); }
    if (A.mustChange) { shellBuilt = false; return renderMustChange(e); }
    view = allowed(sub) ? sub : 'beranda';
    if (!shellBuilt) buildShell(e);
    if (!A.admin) { const c = Store.get(bootKey(), null); if (c) A.admin = c.data; }   // tampil seketika dari cache perangkat
    show(view);
    loadBoot();
  }

  /* ---------------- belum terhubung (mode demo) ---------------- */
  function renderSetup(e) {
    e.innerHTML = '<div class="login-wrap"><div class="card login-card"><img class="logo" src="' + A.base + 'assets/logo.png" alt=""><h2 class="center">Dasbor Admin Acc Cell</h2>' +
      '<div class="note amber mt16">' + I('settings') + '<div><b>Backend belum terhubung.</b> Dasbor memerlukan Google Apps Script.<ol style="margin:8px 0 0;padding-left:18px;line-height:20px"><li>Pasang backend (Kode.gs dkk.) lalu jalankan <span class="mono">setupAplikasi()</span>.</li><li>Deploy sebagai Web App (akses: Anyone) dan salin URL <span class="mono">/exec</span>.</li><li>Tempel di <span class="mono">js/config.js</span> → <span class="mono">GAS_URL</span>, lalu push ulang.</li></ol></div></div>' +
      '<a class="btn btn-ghost btn-block mt16" href="../">' + I('arrow_back') + 'Kembali ke Link Bio</a><button class="btn btn-soft btn-block mt8" data-nk-license>' + I('key') + 'Lisensi Template</button></div></div>';
  }

  /* ---------------- login ---------------- */
  function renderLogin(e) {
    e.innerHTML = '<div class="login-wrap"><form class="card login-card f" autocomplete="on"><img class="logo" src="' + A.base + 'assets/logo.png" alt=""><div class="center"><h2 style="font:800 22px var(--f-head)">Masuk Dasbor</h2><p class="muted small" style="margin:4px 0 0">Superadmin &amp; Admin Cabang Acc Cell</p></div>' +
      '<div class="fld"><label for="lu">Username</label><input id="lu" name="username" autocomplete="username" autocapitalize="none" required></div>' +
      '<div class="fld"><label for="lp">Sandi</label><div style="position:relative"><input id="lp" name="password" type="password" autocomplete="current-password" required><button type="button" class="clr" data-eye style="position:absolute;right:6px;top:7px;width:34px;height:34px">' + I('visibility') + '</button></div></div>' +
      '<div class="small" style="color:var(--danger);min-height:16px" data-err></div><button class="btn btn-ink btn-block" data-go>' + I('login') + 'Masuk</button>' +
      '<a class="btn btn-ghost btn-block" href="../">' + I('arrow_back') + 'Kembali ke Link Bio</a><p class="muted tiny center" style="margin:0">Lupa sandi? Admin cabang: hubungi superadmin. Superadmin: jalankan <span class="mono">resetPasswordSuperadmin()</span> di editor Apps Script.</p></form></div>';
    const f = e.querySelector('form'), err = e.querySelector('[data-err]'), go = e.querySelector('[data-go]');
    e.querySelector('[data-eye]').onclick = () => { const p = e.querySelector('#lp'); p.type = p.type === 'password' ? 'text' : 'password'; };
    f.onsubmit = async ev => {
      ev.preventDefault(); err.textContent = ''; go.disabled = true; go.innerHTML = I('hourglass_top') + 'Memeriksa…';
      const r = await A.api('login', { username: f.username.value.trim(), password: f.password.value });
      go.disabled = false; go.innerHTML = I('login') + 'Masuk';
      if (!r.success) { err.textContent = r.message; return; }
      saveAuth(r.data.token, r.data.user, r.data.mustChange);
      if (r.data.boot) setBoot(r.data.boot);
      A.toast('Selamat datang, ' + r.data.user.nama);
      render(e, '');
    };
  }
  function renderMustChange(e) {
    e.innerHTML = '<div class="login-wrap"><form class="card login-card f"><div class="center">' + I('lock_reset') + '<h2 style="font:800 20px var(--f-head);margin-top:6px">Ganti Sandi Dulu</h2><p class="muted small">Demi keamanan, ganti sandi sementara sebelum memakai dasbor.</p></div>' +
      pwFields() + '<div class="small" style="color:var(--danger);min-height:16px" data-err></div><button class="btn btn-ink btn-block" data-go>Simpan Sandi Baru</button><button type="button" class="btn btn-ghost btn-block" data-out>Keluar</button></form></div>';
    e.querySelector('[data-out]').onclick = () => logout();
    bindPw(e.querySelector('form'), r => { saveAuth(r.data.token, r.data.user, false); if (r.data.boot) setBoot(r.data.boot); render(e, ''); });
  }
  const pwFields = () => '<div class="fld"><label>Sandi lama / sementara</label><input name="lama" type="password" autocomplete="current-password" required></div><div class="fld"><label>Sandi baru</label><input name="baru" type="password" autocomplete="new-password" required minlength="8"><div class="hint">Minimal 8 karakter, berisi huruf dan angka.</div></div><div class="fld"><label>Ulangi sandi baru</label><input name="ulang" type="password" autocomplete="new-password" required></div>';
  function bindPw(f, done) {
    f.onsubmit = async ev => {
      ev.preventDefault(); const err = f.querySelector('[data-err]'), go = f.querySelector('[data-go]');
      if (f.baru.value !== f.ulang.value) { err.textContent = 'Ulangi sandi baru tidak sama.'; return; }
      go.disabled = true; const r = await A.api('changePassword', { lama: f.lama.value, baru: f.baru.value }); go.disabled = false;
      if (!r.success) { err.textContent = r.message; return; }
      A.toast(r.message); done(r);
    };
  }

  /* ---------------- kerangka dasbor ---------------- */
  function buildShell(e) {
    const items = MENU.filter(m => m.g ? isSA() : (m.all || isSA()));
    e.innerHTML = '<div class="adm"><nav class="side" aria-label="Menu dasbor"><div class="row" style="padding:4px 10px 12px"><span class="avatar-i">' + esc((A.user.nama || 'A').slice(0, 1).toUpperCase()) + '</span><div class="grow"><b class="ell" style="display:block;font:700 14px var(--f-head)">' + esc(A.user.nama) + '</b><span class="muted tiny">' + (isSA() ? 'Superadmin' : 'Admin ' + cabNama(A.user.cabang)) + '</span></div></div>' +
      items.map(m => m.g ? '<div class="grp">' + esc(m.g) + '</div>' : '<a href="#/' + m.id + '" data-v="' + m.id + '">' + I(m.i) + esc(m.t) + '</a>').join('') +
      '<div class="grp">Lainnya</div><button data-nk-license>' + I('key') + 'Lisensi</button><a href="../" target="_blank">' + I('open_in_new') + 'Lihat Link Bio</a><button data-logout>' + I('logout') + 'Keluar</button></nav>' +
      '<div class="adm-main" data-main></div></div>' +
      '<nav class="bnav adm-bnav" style="--n:' + (isSA() ? 5 : 4) + '"><div class="bnav-in">' +
      (isSA() ? [['beranda', 'Beranda', 'space_dashboard'], ['produk', 'Produk', 'smartphone'], ['tampilan', 'Tampilan', 'tune'], ['notif', 'WA Blast', 'forum']] : [['beranda', 'Beranda', 'space_dashboard'], ['produk', 'Produk', 'smartphone'], ['akun', 'Akun', 'person']])
        .map(x => '<a href="#/' + x[0] + '" data-v="' + x[0] + '">' + I(x[2]) + x[1] + '</a>').join('') +
      '<a href="#" data-more>' + I('menu') + 'Menu</a></div></nav>';
    e.querySelector('[data-logout]').onclick = () => logout('Anda telah keluar.');
    e.querySelector('[data-more]').onclick = ev => {
      ev.preventDefault();
      const o = A.sheet('<div class="menu-grid">' + items.filter(m => !m.g).map(m => '<a href="#/' + m.id + '">' + I(m.i) + esc(m.t) + '</a>').join('') +
        '<button data-nk-license>' + I('key') + 'Lisensi</button><a href="../">' + I('home') + 'Link Bio</a><button data-lo>' + I('logout') + 'Keluar</button></div>', { title: 'Menu Dasbor' });
      o.addEventListener('click', ev2 => { if (ev2.target.closest('a')) o.close(); if (ev2.target.closest('[data-lo]')) { o.close(); logout('Anda telah keluar.'); } });
    };
    shellBuilt = true;
  }
  const VIEWS = {};
  function show(v, fromRefresh) {
    if (!el || !shellBuilt) return;
    el.querySelectorAll('[data-v]').forEach(a => a.classList.toggle('on', a.dataset.v === v));
    const main = el.querySelector('[data-main]');
    if (!A.admin) { main.innerHTML = '<div class="skel" style="height:32px;width:40%"></div><div class="kpis mt16">' + '<div class="skel" style="height:96px"></div>'.repeat(4) + '</div><div class="skel mt16" style="height:240px"></div>'; return; }
    if (fromRefresh && main.contains(document.activeElement) && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;   // jangan ganggu yang sedang mengetik
    VIEWS[v](main, fromRefresh);
  }
  const head = (t, extra) => '<div class="adm-h"><h2>' + esc(t) + '</h2>' + (extra || '') + '</div>';
  function busy(btn, on, label) { if (!btn) return; if (on) { btn.dataset.lbl = btn.innerHTML; btn.disabled = true; btn.innerHTML = I('hourglass_top') + (label || 'Menyimpan…'); } else { btn.disabled = false; if (btn.dataset.lbl) btn.innerHTML = btn.dataset.lbl; } }
  async function call(action, data, btn, opt) {
    busy(btn, true, opt && opt.label);
    const r = await A.api(action, data);
    busy(btn, false);
    if (!r.success) A.toast(r.message || 'Gagal', 'err'); else if (r.message && !(opt && opt.silent)) A.toast(r.message);
    return r;
  }

  /* ---------------- pembuat form generik ---------------- */
  function fld(f, v) {
    const val = v == null ? '' : v, id = 'f_' + f.k;
    let inp;
    if (f.type === 'textarea') inp = '<textarea id="' + id + '" name="' + f.k + '"' + (f.ro ? ' disabled' : '') + ' rows="' + (f.rows || 3) + '" placeholder="' + esc(f.ph || '') + '">' + esc(val) + '</textarea>';
    else if (f.type === 'select') inp = '<select id="' + id + '" name="' + f.k + '"' + (f.ro ? ' disabled' : '') + '>' + f.opts.map(o => { const ov = Array.isArray(o) ? o[0] : o, ol = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(ov) + '"' + (String(ov) === String(val) ? ' selected' : '') + '>' + esc(ol) + '</option>'; }).join('') + '</select>';
    else if (f.type === 'switch') return '<label class="row" style="justify-content:space-between;padding:6px 0"><span><b style="font:600 14px var(--f-body)">' + esc(f.t) + '</b>' + (f.hint ? '<div class="hint muted small">' + esc(f.hint) + '</div>' : '') + '</span><span class="switch"><input type="checkbox" name="' + f.k + '"' + (val === true || String(val).toUpperCase() === 'YA' || val === 'TRUE' ? ' checked' : '') + '><i></i></span></label>';
    else if (f.type === 'image') return '<div class="fld"><span>' + esc(f.t) + '</span><div class="imgpick"><div class="pv" data-pv style="background-image:url(\'' + esc(img(val, 300)) + '\')"></div><div class="grow f" style="gap:6px"><input name="' + f.k + '" value="' + esc(val) + '" placeholder="URL gambar atau unggah →" class="inp" style="min-height:38px;font-size:13px"><label class="btn btn-ghost btn-sm" style="align-self:flex-start">' + I('upload') + 'Unggah gambar<input type="file" accept="image/*" hidden data-up="' + f.k + '" data-folder="' + (f.folder || 'Banner') + '"></label></div></div>' + (f.hint ? '<div class="hint">' + esc(f.hint) + '</div>' : '') + '</div>';
    else inp = '<input id="' + id + '" name="' + f.k + '" type="' + (f.type === 'number' ? 'text' : (f.type || 'text')) + '"' + (f.type === 'number' || f.type === 'money' ? ' inputmode="numeric"' : '') + ' value="' + esc(f.type === 'money' && val ? String(val).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : val) + '"' + (f.ro ? ' disabled' : '') + (f.req ? ' required' : '') + ' placeholder="' + esc(f.ph || '') + '"' + (f.max ? ' maxlength="' + f.max + '"' : '') + '>';
    return '<div class="fld"><label for="' + id + '">' + esc(f.t) + (f.req ? ' *' : '') + '</label>' + inp + (f.hint ? '<div class="hint">' + esc(f.hint) + '</div>' : '') + '</div>';
  }
  function form(spec, v) {
    v = v || {}; let html = '', half = [];
    const flush = () => { if (half.length) { html += '<div class="f2">' + half.join('') + '</div>'; half = []; } };
    spec.forEach(f => { if (f.sec) { flush(); html += '<h4 style="font:700 14px var(--f-head);margin-top:6px">' + esc(f.sec) + '</h4>'; return; } const h = fld(f, v[f.k]); if (f.half) { half.push(h); if (half.length === 2) flush(); } else { flush(); html += h; } });
    flush(); return html;
  }
  function read(root, spec) {
    const o = {};
    spec.forEach(f => {
      if (!f.k) return; const x = root.querySelector('[name="' + f.k + '"]'); if (!x || f.ro) return;
      if (f.type === 'switch') o[f.k] = f.yaTidak ? (x.checked ? 'YA' : 'TIDAK') : x.checked;
      else if (f.type === 'money') o[f.k] = String(x.value).replace(/[^\d]/g, '');
      else o[f.k] = x.value.trim();
    });
    return o;
  }
  function bindUploads(root) {
    root.querySelectorAll('[data-up]').forEach(inp => inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      const box = inp.closest('.fld'), pv = box.querySelector('[data-pv]'), txt = box.querySelector('input[name="' + inp.dataset.up + '"]');
      pv.classList.add('ph', 'loading');
      const r = await uploadFile(file, inp.dataset.folder);
      pv.classList.remove('ph', 'loading');
      if (r) { txt.value = r.url; pv.style.backgroundImage = 'url(\'' + img(r.url, 300) + '\')'; txt.dataset.fileId = r.fileId; }
      inp.value = '';
    });
  }
  function compress(file, max, keepPng) {
    return new Promise((res, rej) => {
      if (/svg/.test(file.type)) { const fr = new FileReader(); fr.onload = () => res({ b64: fr.result, mime: 'image/svg+xml' }); fr.onerror = rej; fr.readAsDataURL(file); return; }
      const im = new Image(), url = URL.createObjectURL(file);
      im.onload = () => {
        let w = im.naturalWidth, h = im.naturalHeight; const k = Math.min(1, max / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k);
        const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
        const png = keepPng && /png/.test(file.type);
        if (!png) { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); }
        x.drawImage(im, 0, 0, w, h); URL.revokeObjectURL(url);
        res({ b64: c.toDataURL(png ? 'image/png' : 'image/jpeg', .82), mime: png ? 'image/png' : 'image/jpeg' });
      };
      im.onerror = () => rej(new Error('Berkas bukan gambar yang didukung.'));
      im.src = url;
    });
  }
  async function uploadFile(file, folder) {
    try {
      const c = await compress(file, folder === 'QRIS' ? 1200 : 1400, folder === 'QRIS' || folder === 'Logo');
      const r = await A.api('uploadImage', { folder, base64: c.b64, mime: c.mime, nama: file.name.replace(/\.[^.]+$/, '') }, { timeout: 120000 });
      if (!r.success) { A.toast(r.message, 'err'); return null; }
      return r.data;
    } catch (e) { A.toast(e.message || 'Gagal mengunggah', 'err'); return null; }
  }

  /* ---------------- grafik SVG ringan ---------------- */
  function spark(data, key, color) {
    const w = 600, h = 120, p = 8, max = Math.max(1, ...data.map(d => d[key]));
    const pts = data.map((d, i) => [p + i * (w - 2 * p) / Math.max(1, data.length - 1), h - p - (d[key] / max) * (h - 2 * p)]);
    const line = pts.map((x, i) => (i ? 'L' : 'M') + x[0].toFixed(1) + ',' + x[1].toFixed(1)).join('');
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img" aria-label="Grafik"><path d="' + line + 'L' + (w - p) + ',' + (h - p) + 'L' + p + ',' + (h - p) + 'Z" fill="' + color + '" opacity=".12"/><path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>';
  }

  /* ======================= BERANDA ======================= */
  let statHari = 7;
  VIEWS.beranda = function (m) {
    const P = B().products || [], sa = isSA();
    const cnt = c => P.filter(p => p.cabang === c || p.cabang === 'keduanya').length;
    const habis = P.filter(p => p.status === 'Habis').length, tampil = P.filter(p => p.aktif).length;
    const s = B().settings || {};
    m.innerHTML = head('Halo, ' + (A.user.nama || '').split(' ')[0] + ' 👋', '<a class="btn btn-amber btn-sm" href="#/produk" data-add>' + I('add') + 'Tambah Produk</a>') +
      '<div class="kpis">' +
      (sa ? '<div class="kpi click" data-k="nabire"><span>' + I('location_on') + 'Produk Nabire</span><b>' + cnt('nabire') + '</b><small>termasuk stok bersama</small></div><div class="kpi click" data-k="serui"><span>' + I('location_on') + 'Produk Serui</span><b>' + cnt('serui') + '</b><small>termasuk stok bersama</small></div>'
        : '<div class="kpi click" data-k="semua"><span>' + I('inventory_2') + 'Produk ' + cabNama(A.user.cabang) + '</span><b>' + P.filter(p => p.cabang === A.user.cabang).length + '</b><small>+ ' + P.filter(p => p.cabang === 'keduanya').length + ' stok bersama</small></div>') +
      '<div class="kpi click" data-k="tersedia"><span>' + I('check_circle') + 'Tersedia / Habis</span><b>' + (P.length - habis) + ' <span style="font-size:16px;color:var(--danger)">/ ' + habis + '</span></b><small>' + tampil + ' tampil di katalog</small></div>' +
      (sa ? '<div class="kpi ' + (String(s.popup_aktif).toUpperCase() === 'YA' ? 'amber' : '') + ' click" data-go="popup"><span>' + I('campaign') + 'Pop-up Promo</span><b>' + (String(s.popup_aktif).toUpperCase() === 'YA' ? 'AKTIF' : 'OFF') + '</b><small>' + esc((B().banners || []).filter(b => b.aktif).length) + ' banner aktif</small></div>' : '') +
      '</div>' +
      '<div class="panel"><div class="panel-h"><h3>Statistik Pengunjung</h3><div class="seg" data-hari>' + [[7, '7 hari'], [30, '30 hari'], [90, '90 hari']].map(x => '<button data-h="' + x[0] + '"' + (x[0] === statHari ? ' class="on"' : '') + '>' + x[1] + '</button>').join('') + '</div></div><div data-stats><div class="skel" style="height:180px"></div></div></div>' +
      (sa ? '<div class="menu-grid mt16">' + [['tampilan', 'tune', 'Atur urutan halaman'], ['banner', 'view_carousel', 'Ganti slide promo'], ['bayar', 'account_balance_wallet', 'Rekening & QRIS'], ['notif', 'forum', 'Blast WA promo'], ['crm', 'contacts', 'CRM pelanggan'], ['pengguna', 'manage_accounts', 'Admin cabang']].map(x => '<a href="#/' + x[0] + '">' + I(x[1]) + x[2] + '</a>').join('') + '</div>' : '');
    m.querySelectorAll('[data-k]').forEach(k => k.onclick = () => { prodFilter.cab = ['nabire', 'serui'].indexOf(k.dataset.k) > -1 ? k.dataset.k : ''; prodFilter.status = k.dataset.k === 'tersedia' ? '' : prodFilter.status; A.go('produk'); });
    m.querySelectorAll('[data-go]').forEach(k => k.onclick = () => A.go(k.dataset.go));
    m.querySelector('[data-add]').onclick = ev => { ev.preventDefault(); A.go('produk'); setTimeout(() => productForm(), 50); };
    m.querySelector('[data-hari]').onclick = ev => { const b = ev.target.closest('[data-h]'); if (!b) return; statHari = +b.dataset.h; m.querySelectorAll('[data-h]').forEach(x => x.classList.toggle('on', x === b)); loadStats(m); };
    loadStats(m);
  };
  async function loadStats(m) {
    const key = 'a:stats:' + A.user.id + ':' + statHari, c = Store.get(key, null), box = () => m.querySelector('[data-stats]');
    if (c) drawStats(box(), c.data);
    if (c && Date.now() - c.t < 60000) return;
    const r = await A.api('stats', { hari: statHari });
    if (r.success && box()) { Store.set(key, { t: Date.now(), data: r.data }); drawStats(box(), r.data); }
    else if (!c && box()) box().innerHTML = '<div class="note red">' + I('error') + esc(r.message) + '</div>';
  }
  function drawStats(box, s) {
    if (!box) return;
    const t = s.total || {}, wa = s.waCabang, maxWa = wa ? Math.max(1, wa.nabire, wa.serui) : 1;
    const top = (arr, lbl) => '<div class="grow"><h4 style="font:600 13px var(--f-body);margin-bottom:8px">' + lbl + '</h4>' + (arr.length ? '<ol class="toplist">' + arr.map((x, i) => '<li><span class="n">' + (i + 1) + '</span><span class="grow ell">' + esc(x.nama) + '</span><b>' + x.jumlah + '×</b></li>').join('') + '</ol>' : '<p class="muted small">Belum ada data.</p>') + '</div>';
    box.innerHTML = '<div class="kpis"><div class="kpi dark"><span>' + I('chat') + 'Klik WhatsApp</span><b>' + (t.klik_wa || 0) + '</b><small>' + s.hari + ' hari terakhir</small></div><div class="kpi"><span>' + I('group') + 'Kunjungan</span><b>' + (t.kunjungan || 0) + '</b><small>sesi pengunjung</small></div>' +
      '<div class="kpi"><span>' + I('visibility') + 'Produk dilihat</span><b>' + (t.lihat_produk || 0) + '</b><small>buka detail</small></div><div class="kpi"><span>' + I('touch_app') + 'Buka katalog</span><b>' + (t.buka_katalog || 0) + '</b><small>rekening: ' + (t.buka_pembayaran || 0) + '</small></div></div>' +
      '<div class="two"><div class="panel"><h4 style="font:600 13px var(--f-body)">Klik WhatsApp per hari</h4>' + spark(s.harian || [], 'wa', '#1DA851') + '<div class="row small muted" style="justify-content:space-between"><span>' + esc((s.harian[0] || {}).tanggal || '') + '</span><span>' + esc((s.harian[s.harian.length - 1] || {}).tanggal || '') + '</span></div></div>' +
      (wa ? '<div class="panel"><h4 style="font:600 13px var(--f-body);margin-bottom:12px">Perbandingan klik WA: Nabire vs Serui</h4><div class="bar-chart"><div class="bar-row"><span>Nabire</span><div class="bar"><i style="width:' + (wa.nabire / maxWa * 100) + '%"></i></div><b>' + wa.nabire + '</b></div><div class="bar-row"><span>Serui</span><div class="bar"><i class="ink" style="width:' + (wa.serui / maxWa * 100) + '%"></i></div><b>' + wa.serui + '</b></div></div></div>' : '<div class="panel">' + top(s.topLihat || [], 'Produk paling sering dilihat') + '</div>') + '</div>' +
      '<div class="two">' + (wa ? '<div class="panel">' + top(s.topLihat || [], 'Produk paling sering dilihat') + '</div>' : '') + '<div class="panel">' + top(s.topTanya || [], 'Produk paling sering ditanyakan (klik WA)') + '</div></div>';
  }

  /* ======================= PRODUK ======================= */
  const prodFilter = { q: '', kat: '', cab: '', status: '' };
  const PROD_SPEC = () => [
    { k: 'nama', t: 'Nama produk', req: 1, ph: 'Samsung Galaxy A15 6/128GB', max: 120 },
    { k: 'merek', t: 'Merek', half: 1, ph: 'Samsung' }, { k: 'kategori', t: 'Kategori', type: 'select', opts: ['HP Baru', 'HP Second', 'Aksesoris'], half: 1 },
    { k: 'harga', t: 'Harga (Rp)', type: 'money', req: 1, half: 1, ph: '2.499.000' }, { k: 'harga_coret', t: 'Harga coret (opsional)', type: 'money', half: 1, ph: '2.699.000' },
    { k: 'ram', t: 'RAM', half: 1, ph: '6 GB' }, { k: 'memori', t: 'Memori', half: 1, ph: '128 GB' },
    { k: 'warna', t: 'Warna', ph: 'Hitam, Biru (pisahkan dengan koma)' },
    { k: 'kondisi', t: 'Kondisi', half: 1, ph: 'Baru Segel / Second 99%' }, { k: 'garansi', t: 'Garansi', half: 1, ph: 'Resmi 1 Tahun' },
    { k: 'kelengkapan', t: 'Kelengkapan', type: 'textarea', rows: 2, ph: 'Fullset dus, charger, kabel (pisahkan koma)' },
    { k: 'cabang', t: 'Cabang', type: 'select', opts: isSA() ? [['nabire', 'Nabire'], ['serui', 'Serui'], ['keduanya', 'Keduanya (Nabire & Serui)']] : [[A.user.cabang, cabNama(A.user.cabang)]], ro: !isSA(), half: 1 },
    { k: 'status', t: 'Status stok', type: 'select', opts: ['Tersedia', 'Habis'], half: 1 },
    { k: 'deskripsi', t: 'Deskripsi', type: 'textarea', rows: 3 },
    { k: 'aktif', t: 'Tampilkan di katalog', type: 'switch' }
  ];
  VIEWS.produk = function (m) {
    m.innerHTML = head('Produk', '<button class="btn btn-amber btn-sm" data-add>' + I('add') + 'Tambah Produk</button>' + (isSA() ? '<a class="btn btn-ghost btn-sm" href="#/migrasi">' + I('upload_file') + 'Import CSV</a>' : '')) +
      '<div class="search" style="margin-top:0">' + I('search') + '<input type="search" placeholder="Cari nama, merek, RAM…" value="' + esc(prodFilter.q) + '" data-q></div>' +
      '<div class="pills mt12" data-f="kat">' + [['', 'Semua'], ['HP Baru', 'HP Baru'], ['HP Second', 'HP Second'], ['Aksesoris', 'Aksesoris']].map(x => '<button class="pill" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
      '<div class="pills mt8" data-f="status">' + [['', 'Semua status'], ['Tersedia', 'Tersedia'], ['Habis', 'Habis'], ['sembunyi', 'Disembunyikan']].map(x => '<button class="pill" data-v="' + x[0] + '">' + x[1] + '</button>').join('') +
      (isSA() ? [['', 'Semua cabang'], ['nabire', 'Nabire'], ['serui', 'Serui'], ['keduanya', 'Keduanya']].map(x => '<button class="pill" data-c="' + x[0] + '">' + I('location_on') + x[1] + '</button>').join('') : '') + '</div>' +
      (!isSA() ? '<div class="note mt12">' + I('info') + '<div>Anda dapat mengelola produk cabang <b>' + cabNama(A.user.cabang) + '</b>. Produk "Keduanya" hanya bisa diubah superadmin.</div></div>' : '') +
      '<div class="list mt12" data-list></div>';
    const q = m.querySelector('[data-q]');
    q.addEventListener('input', A.debounce(() => { prodFilter.q = q.value; drawProducts(m); }, 200));
    m.querySelector('[data-f="kat"]').onclick = e => { const b = e.target.closest('[data-v]'); if (b) { prodFilter.kat = b.dataset.v; drawProducts(m); } };
    m.querySelector('[data-f="status"]').onclick = e => { const b = e.target.closest('[data-v]'), c = e.target.closest('[data-c]'); if (b) prodFilter.status = b.dataset.v; if (c) prodFilter.cab = c.dataset.c; if (b || c) drawProducts(m); };
    m.querySelector('[data-add]').onclick = () => productForm();
    m.querySelector('[data-list]').addEventListener('click', e => {
      const t = e.target.closest('[data-act]'); if (!t) return;
      const p = (B().products || []).find(x => x.id === t.dataset.id); if (!p) return;
      const a = t.dataset.act;
      if (a === 'edit') productForm(p);
      if (a === 'dup') productForm(Object.assign({}, p, { id: '', nama: p.nama + ' (salin)' }));
      if (a === 'del') delProduct(p, m);
      if (a === 'eye') toggleProduct(p, 'aktif', !p.aktif, m);
    });
    m.querySelector('[data-list]').addEventListener('change', e => { const t = e.target.closest('[data-stok]'); if (!t) return; const p = (B().products || []).find(x => x.id === t.dataset.stok); toggleProduct(p, 'status', t.checked ? 'Tersedia' : 'Habis', m); });
    drawProducts(m);
  };
  const canEdit = p => isSA() || p.cabang === A.user.cabang;
  function drawProducts(m) {
    m.querySelectorAll('[data-f="kat"] .pill').forEach(b => b.classList.toggle('on', b.dataset.v === prodFilter.kat));
    m.querySelectorAll('[data-f="status"] [data-v]').forEach(b => b.classList.toggle('on', b.dataset.v === prodFilter.status));
    m.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('on-ink', b.dataset.c === prodFilter.cab));
    const q = prodFilter.q.toLowerCase();
    const list = (B().products || []).filter(p => (!prodFilter.kat || p.kategori === prodFilter.kat) && (!prodFilter.cab || p.cabang === prodFilter.cab) &&
      (!prodFilter.status || (prodFilter.status === 'sembunyi' ? !p.aktif : p.status === prodFilter.status)) &&
      (!q || (p.nama + ' ' + p.merek + ' ' + p.ram + ' ' + p.memori).toLowerCase().indexOf(q) > -1));
    const box = m.querySelector('[data-list]');
    box.innerHTML = list.length ? list.map(p => '<div class="li' + (p.aktif ? '' : ' off') + '"><div class="th" style="background-image:url(\'' + esc(img((p.foto || [])[0], 200)) + '\')"></div>' +
      '<div class="grow"><b class="ell">' + esc(p.nama) + '</b><div class="meta"><span style="font-weight:700;color:var(--amber-ink)">' + rp(p.harga) + '</span><span class="chip">' + esc(p.kategori) + '</span><span class="chip">' + I('location_on') + cabNama(p.cabang) + '</span>' + (p.aktif ? '' : '<span class="chip chip-no">Disembunyikan</span>') + '</div></div>' +
      '<div class="acts">' + (canEdit(p) ? '<label class="switch" title="Tersedia / Habis"><input type="checkbox" data-stok="' + esc(p.id) + '"' + (p.status === 'Tersedia' ? ' checked' : '') + ' aria-label="Stok tersedia"><i></i></label>' +
        '<button class="icon-btn" data-act="eye" data-id="' + esc(p.id) + '" title="' + (p.aktif ? 'Sembunyikan' : 'Tampilkan') + '">' + I(p.aktif ? 'visibility' : 'visibility_off') + '</button><button class="icon-btn" data-act="edit" data-id="' + esc(p.id) + '" title="Ubah">' + I('edit') + '</button>' +
        '<button class="icon-btn" data-act="dup" data-id="' + esc(p.id) + '" title="Duplikat">' + I('content_copy') + '</button><button class="icon-btn" data-act="del" data-id="' + esc(p.id) + '" title="Hapus" style="color:var(--danger)">' + I('delete') + '</button>'
        : '<span class="chip ' + (p.status === 'Habis' ? 'chip-no' : 'chip-ok') + '">' + esc(p.status) + '</span><span class="chip">' + I('lock') + 'Superadmin</span>') + '</div></div>').join('')
      : '<div class="empty">' + I('inventory_2') + '<p>Tidak ada produk.</p></div>';
    box.insertAdjacentHTML('beforeend', '<p class="muted small center">' + list.length + ' dari ' + (B().products || []).length + ' produk</p>');
  }
  async function toggleProduct(p, field, value, m) {
    const prev = p[field]; p[field] = value; drawProducts(m);                // instan
    const r = await A.api('toggleProduct', { id: p.id, field, value });
    if (!r.success) { p[field] = prev; drawProducts(m); A.toast(r.message, 'err'); return; }
    setBoot(A.admin); refreshPublic();
    A.toast(field === 'status' ? p.nama + ': ' + value : (value ? 'Ditampilkan di katalog' : 'Disembunyikan dari katalog'));
  }
  async function delProduct(p, m) {
    if (!await A.confirm('Hapus "' + p.nama + '"? Foto di Drive ikut dipindah ke sampah.', 'Hapus', true)) return;
    const r = await call('deleteProduct', { id: p.id });
    if (r.success) { A.admin.products = A.admin.products.filter(x => x.id !== p.id); setBoot(A.admin); drawProducts(m); refreshPublic(); }
  }
  function productForm(p) {
    p = p || { kategori: 'HP Baru', status: 'Tersedia', aktif: true, cabang: isSA() ? 'nabire' : A.user.cabang, foto: [] };
    const spec = PROD_SPEC(); let foto = (p.foto || []).slice();
    const o = A.sheet('<form class="f" novalidate>' + '<div class="fld"><span>Foto produk (maks. 5 — foto pertama jadi sampul)</span><div class="photos" data-photos></div><div class="hint">Gambar otomatis dikompres sebelum diunggah ke Google Drive.</div></div>' + form(spec, p) +
      '<div class="row mt8"><button type="button" class="btn btn-ghost" data-x>Batal</button><button class="btn btn-ink grow" data-save>' + I('save') + 'Simpan Produk</button></div></form>', { title: p.id ? 'Ubah Produk' : 'Tambah Produk', lg: true });
    const f = o.querySelector('form'), ph = o.querySelector('[data-photos]');
    const drawPh = () => {
      ph.innerHTML = foto.map((u, i) => '<div class="ph"' + (u === '…' ? ' data-loading' : '') + '>' + (u === '…' ? '' : '<img src="' + esc(img(u, 200)) + '" alt="">') + (i === 0 ? '<span class="chip chip-amber first">Sampul</span>' : '') +
        '<div class="tools"><button type="button" data-l="' + i + '" aria-label="Geser kiri">' + I('chevron_left') + '</button><button type="button" data-d="' + i + '" aria-label="Hapus foto">' + I('delete') + '</button><button type="button" data-r="' + i + '" aria-label="Geser kanan">' + I('chevron_right') + '</button></div></div>').join('') +
        (foto.length < 5 ? '<label class="ph-add">' + I('add_a_photo') + 'Tambah<input type="file" accept="image/*" multiple hidden data-add></label>' : '');
      ph.querySelectorAll('[data-loading]').forEach(x => x.classList.add('loading'));
      const add = ph.querySelector('[data-add]');
      if (add) add.onchange = async () => {
        const files = Array.from(add.files).slice(0, 5 - foto.length);
        const slots = files.map(() => { foto.push('…'); return foto.length - 1; }); drawPh();
        await Promise.all(files.map(async (file, k) => { const r = await uploadFile(file, 'Produk'); foto[slots[k]] = r ? r.url : null; }));
        foto = foto.filter(Boolean); drawPh();
      };
    };
    ph.onclick = e => {
      const l = e.target.closest('[data-l]'), r = e.target.closest('[data-r]'), d = e.target.closest('[data-d]');
      if (l && +l.dataset.l > 0) { const i = +l.dataset.l; [foto[i - 1], foto[i]] = [foto[i], foto[i - 1]]; }
      if (r && +r.dataset.r < foto.length - 1) { const i = +r.dataset.r; [foto[i + 1], foto[i]] = [foto[i], foto[i + 1]]; }
      if (d) foto.splice(+d.dataset.d, 1);
      if (l || r || d) drawPh();
    };
    drawPh();
    f.onsubmit = async e => {
      e.preventDefault();
      if (foto.indexOf('…') > -1) return A.toast('Tunggu unggahan foto selesai', 'info');
      const d = Object.assign(read(f, spec), { id: p.id || '', foto });
      if (!d.nama) return A.toast('Nama produk wajib diisi', 'err');
      if (!Number(d.harga)) return A.toast('Harga wajib diisi', 'err');
      const r = await call('saveProduct', d, f.querySelector('[data-save]'));
      if (!r.success) return;
      const list = A.admin.products, i = list.findIndex(x => x.id === r.data.id);
      if (i > -1) list[i] = r.data; else list.unshift(r.data);
      setBoot(A.admin); o.close(); if (view === 'produk') drawProducts(el.querySelector('[data-main]')); refreshPublic();
    };
  }

  /* ======================= TAMPILAN (urutan bagian + editor per bagian) ======================= */
  const GAYA_SOS = [['tombol', 'Tombol lebar'], ['bulat', 'Ikon bulat']];
  const SEC_INFO = {
    profil: { i: 'account_circle', d: 'Logo, nama toko, tagline, jam buka', spec: [{ k: 'nama_toko', t: 'Nama toko' }, { k: 'tagline', t: 'Tagline' }, { k: 'logo_url', t: 'Logo (kosong = logo bawaan)', type: 'image', folder: 'Logo' }, { k: 'status_buka', t: 'Teks jam buka', ph: 'Buka Hari Ini (09.00 - 21.00 WIT)' }, { k: 'warna_aksen', t: 'Warna aksen (hex)', ph: '#F9B54C', hint: 'Bawaan amber logo: #F9B54C' }] },
    hero: { i: 'view_carousel', d: 'Foto promo yang bergeser otomatis', link: 'banner', linkT: 'Kelola Slide Hero' },
    promo: { i: 'redeem', d: 'Kartu promo/pengumuman', spec: [{ k: 'pengumuman_aktif', t: 'Tampilkan kartu promo', type: 'switch', yaTidak: 1 }, { k: 'pengumuman_label', t: 'Label kecil' }, { k: 'pengumuman_judul', t: 'Judul' }, { k: 'pengumuman_teks', t: 'Isi', type: 'textarea', rows: 2 }] },
    menu: { i: 'apps', d: 'Tombol Katalog, Rekening, Layanan', spec: [{ k: 'menu_katalog_sub', t: 'Keterangan tombol Katalog' }, { k: 'menu_bayar_sub', t: 'Keterangan tombol Rekening & QRIS' }, { k: 'menu_layanan_sub', t: 'Keterangan tombol Jual/Tukar/Servis' }] },
    produk: { i: 'view_week', d: 'Slide produk acak + tombol Lihat semua', spec: [{ k: 'produk_judul', t: 'Judul slide', ph: 'Produk Pilihan' }, { k: 'produk_jumlah', t: 'Jumlah produk (4–20)', type: 'select', opts: ['4', '6', '8', '10', '12', '16', '20'] }] },
    sosmed: { i: 'public', d: 'Tautan TikTok, Instagram, Facebook, WhatsApp', spec: [{ k: 'sosmed_gaya', t: 'Gaya tampilan', type: 'select', opts: GAYA_SOS }], link: 'cabang', linkT: 'Kelola tautan sosial media' },
    cabang: { i: 'storefront', d: 'Alamat, jam buka, peta & WA cabang', link: 'cabang', linkT: 'Kelola data cabang' }
  };
  const PAGE_SPEC = [{ k: 'katalog_judul', t: 'Judul katalog', half: 1 }, { k: 'katalog_sub', t: 'Subjudul katalog', half: 1 }, { k: 'layanan_judul', t: 'Judul halaman layanan', half: 1 }, { k: 'layanan_sub', t: 'Subjudul layanan', half: 1 },
    { k: 'jaminan', t: 'Baris jaminan (footer)', half: 1 }, { k: 'teks_footer', t: 'Teks footer', half: 1 }, { k: 'meta_deskripsi', t: 'Deskripsi untuk Google & pratinjau WhatsApp', type: 'textarea', rows: 2 }];
  const SEC_DEF = { sosmed_gaya: 'tombol', produk_judul: 'Produk Pilihan', produk_jumlah: '10' };
  async function saveSet(obj, btn) {
    const r = await call('saveSettings', { settings: obj }, btn);
    if (r.success) { A.admin.settings = r.data.settings; setBoot(A.admin); refreshPublic(); }
    return r;
  }
  function editSection(s) {
    const inf = SEC_INFO[s.id] || {}, vals = Object.assign({}, SEC_DEF, B().settings || {});
    const o = A.sheet('<form class="f">' + (inf.spec ? form(inf.spec, vals) : '') +
      (s.id === 'sosmed' ? '<div class="sos-prev" data-sp></div>' : '') +
      (inf.link ? '<a class="btn btn-ghost" href="#/' + inf.link + '" data-lk>' + I('open_in_new') + esc(inf.linkT) + '</a>' : '') +
      (inf.spec ? '<div class="row"><button type="button" class="btn btn-ghost" data-x>Batal</button><button class="btn btn-ink grow" data-save>' + I('save') + 'Simpan</button></div>' : '') + '</form>', { title: s.nama_bagian });
    const f = o.querySelector('form'); bindUploads(f);
    const lk = o.querySelector('[data-lk]'); if (lk) lk.onclick = () => o.close();
    const sp = o.querySelector('[data-sp]');
    const drawSp = () => { if (!sp || !A.sosmedList) return; sp.className = 'sos-prev soc-wrap ' + f.sosmed_gaya.value; sp.innerHTML = '<div class="' + (f.sosmed_gaya.value === 'bulat' ? 'socs-r' : 'socs-b') + '">' + A.sosmedList((B().socials || []).filter(x => x.aktif !== false).slice(0, 4), f.sosmed_gaya.value) + '</div>'; };
    if (sp) { f.sosmed_gaya.onchange = drawSp; drawSp(); }
    f.onsubmit = async e => { e.preventDefault(); const r = await saveSet(read(f, inf.spec), f.querySelector('[data-save]')); if (r.success) o.close(); };
  }
  VIEWS.tampilan = function (m) {
    const secs = (B().sections || []).slice();
    m.innerHTML = head('Profil & Urutan Halaman', '<a class="btn btn-ghost btn-sm" href="../" target="_blank">' + I('open_in_new') + 'Lihat Link Bio</a>') +
      '<div class="note">' + I('info') + '<div>Atur <b>urutan</b> bagian link bio dengan tombol ▲▼, nyalakan/matikan dengan saklar, lalu ketuk <b>Atur</b> untuk mengubah isi bagian itu.</div></div>' +
      '<div class="panel"><div class="panel-h"><h3>Bagian Link Bio</h3><button class="btn btn-ink btn-sm" data-sv-order disabled>' + I('save') + 'Simpan Urutan</button></div><div class="order" data-order></div></div>' +
      '<form class="panel f" data-set><div class="panel-h"><h3>Halaman lain, footer & SEO</h3></div>' + form(PAGE_SPEC, B().settings) + '<button class="btn btn-ink" style="justify-self:start" data-save>' + I('save') + 'Simpan</button></form>';
    const box = m.querySelector('[data-order]'), sv = m.querySelector('[data-sv-order]');
    const dirty = () => { sv.disabled = false; sv.classList.add('btn-amber'); sv.classList.remove('btn-ink'); };
    const draw = () => {
      box.innerHTML = secs.map((s, i) => { const inf = SEC_INFO[s.id] || {};
        return '<div class="sec-row' + (s.tampil ? '' : ' off') + '"><span class="num">' + (i + 1) + '</span><span class="avatar-i">' + I(inf.i || 'widgets') + '</span>' +
          '<div class="grow"><b>' + esc(s.nama_bagian) + '</b><span class="muted small ell" style="display:block">' + esc(inf.d || '') + '</span></div>' +
          '<div class="acts"><button class="icon-btn" data-u="' + i + '" aria-label="Naik"' + (i ? '' : ' disabled') + '>' + I('arrow_upward') + '</button><button class="icon-btn" data-dn="' + i + '" aria-label="Turun"' + (i < secs.length - 1 ? '' : ' disabled') + '>' + I('arrow_downward') + '</button>' +
          '<label class="switch" title="Tampilkan"><input type="checkbox" data-t="' + i + '"' + (s.tampil ? ' checked' : '') + ' aria-label="Tampilkan ' + esc(s.nama_bagian) + '"><i></i></label>' +
          '<button class="btn btn-ghost btn-xs" data-ed="' + i + '">' + I('edit') + 'Atur</button></div></div>'; }).join('');
    };
    box.onclick = e => {
      const u = e.target.closest('[data-u]'), d = e.target.closest('[data-dn]'), ed = e.target.closest('[data-ed]');
      if (u) { const i = +u.dataset.u;[secs[i - 1], secs[i]] = [secs[i], secs[i - 1]]; draw(); dirty(); }
      if (d) { const i = +d.dataset.dn;[secs[i + 1], secs[i]] = [secs[i], secs[i + 1]]; draw(); dirty(); }
      if (ed) editSection(secs[+ed.dataset.ed]);
    };
    box.onchange = e => { const t = e.target.closest('[data-t]'); if (t) { secs[+t.dataset.t].tampil = t.checked; draw(); dirty(); } };
    draw();
    sv.onclick = async ev => { const r = await call('saveSections', { sections: secs.map(s => ({ id: s.id, tampil: s.tampil })) }, ev.currentTarget); if (r.success) { A.admin.sections = r.data.sections; setBoot(A.admin); refreshPublic(); sv.disabled = true; sv.classList.remove('btn-amber'); sv.classList.add('btn-ink'); } };
    const f = m.querySelector('[data-set]');
    f.onsubmit = async e => { e.preventDefault(); await saveSet(read(f, PAGE_SPEC), f.querySelector('[data-save]')); };
  };

  /* ======================= LIST GENERIK (banner, rekening, sosmed, layanan) ======================= */
  function crudList(m, cfg) {
    const rows = (B()[cfg.key] || []).slice().sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
    m.innerHTML = head(cfg.title, cfg.noAdd ? '' : '<button class="btn btn-amber btn-sm" data-add>' + I('add') + esc(cfg.addText || 'Tambah') + '</button>') + (cfg.top ? cfg.top() : '') + '<div class="list mt12" data-l></div>';
    const box = m.querySelector('[data-l]');
    const draw = () => {
      box.innerHTML = rows.length ? rows.map((r, i) => '<div class="li' + (r.aktif === false ? ' off' : '') + '">' + cfg.item(r) + '<div class="acts">' +
        (cfg.order ? '<button class="icon-btn" data-u="' + i + '"' + (i ? '' : ' disabled') + ' aria-label="Naik">' + I('arrow_upward') + '</button>' : '') +
        (cfg.noActive ? '' : '<label class="switch"><input type="checkbox" data-a="' + i + '"' + (r.aktif !== false ? ' checked' : '') + ' aria-label="Aktif"><i></i></label>') +
        '<button class="icon-btn" data-e="' + i + '" aria-label="Ubah">' + I('edit') + '</button>' + (cfg.noDel ? '' : '<button class="icon-btn" data-d="' + i + '" aria-label="Hapus" style="color:var(--danger)">' + I('delete') + '</button>') + '</div></div>').join('') : '<div class="empty">' + I('inbox') + '<p>Belum ada data.</p></div>';
    };
    const save = async (rec, btn) => { const r = await call(cfg.save, rec, btn); if (r.success) { const i = rows.findIndex(x => x.id === r.data.id); if (i > -1) rows[i] = r.data; else rows.push(r.data); A.admin[cfg.key] = rows; setBoot(A.admin); draw(); refreshPublic(); } return r; };
    const edit = rec => {
      const o = A.sheet('<form class="f">' + form(cfg.spec, rec || cfg.def || {}) + '<div class="row"><button type="button" class="btn btn-ghost" data-x>Batal</button><button class="btn btn-ink grow" data-save>' + I('save') + 'Simpan</button></div></form>', { title: rec ? 'Ubah' : (cfg.addText || 'Tambah'), lg: cfg.lg });
      const f = o.querySelector('form'); bindUploads(f); if (cfg.onForm) cfg.onForm(f);
      f.onsubmit = async e => { e.preventDefault(); const d = read(f, cfg.spec); const fid = f.querySelector('[data-file-id]'); if (fid) d.file_id = fid.dataset.fileId; if (rec) d.id = rec.id; const r = await save(d, f.querySelector('[data-save]')); if (r.success) o.close(); };
    };
    box.onclick = async e => {
      const ed = e.target.closest('[data-e]'), del = e.target.closest('[data-d]'), up = e.target.closest('[data-u]');
      if (ed) edit(rows[+ed.dataset.e]);
      if (del) { const r0 = rows[+del.dataset.d]; if (!await A.confirm('Hapus data ini?', 'Hapus', true)) return; const r = await call(cfg.del, { id: r0.id }); if (r.success) { rows.splice(rows.indexOf(r0), 1); A.admin[cfg.key] = rows; setBoot(A.admin); draw(); refreshPublic(); } }
      if (up) { const i = +up.dataset.u, a = rows[i - 1], b = rows[i]; const ua = a.urutan, ub = b.urutan; a.urutan = ub === ua ? ua + 1 : ub; b.urutan = ua; rows[i - 1] = b; rows[i] = a; draw(); await A.api(cfg.save, { id: a.id, urutan: a.urutan }); await A.api(cfg.save, { id: b.id, urutan: b.urutan }); setBoot(A.admin); refreshPublic(); }
    };
    box.onchange = async e => { const t = e.target.closest('[data-a]'); if (!t) return; const r0 = rows[+t.dataset.a], prev = r0.aktif; r0.aktif = t.checked; draw(); const r = await A.api(cfg.save, { id: r0.id, aktif: t.checked }); if (!r.success) { r0.aktif = prev; draw(); A.toast(r.message, 'err'); } else { setBoot(A.admin); refreshPublic(); } };
    const add = m.querySelector('[data-add]'); if (add) add.onclick = () => edit(null);
    draw();
    if (cfg.after) cfg.after(m);
  }
  const TUJUAN = [['katalog', 'Katalog'], ['pembayaran', 'Rekening & QRIS'], ['layanan', 'Layanan']];
  VIEWS.banner = m => crudList(m, {
    title: 'Slide Hero / Timeline Promo', key: 'banners', save: 'saveBanner', del: 'deleteBanner', addText: 'Tambah Slide', order: 1, lg: 1,
    top: () => '<div class="note">' + I('info') + '<div>Slide bergeser otomatis di link bio. Gunakan gambar rasio <b>16:9</b> (mis. 1600×900).</div></div>',
    spec: [{ k: 'gambar_url', t: 'Gambar slide', type: 'image', folder: 'Banner' }, { k: 'label', t: 'Label kecil', half: 1, ph: 'Promo Smartphone' }, { k: 'tujuan_klik', t: 'Saat diklik buka', type: 'select', opts: TUJUAN, half: 1 }, { k: 'judul', t: 'Judul' }, { k: 'subjudul', t: 'Subjudul' }],
    item: r => '<div class="th w" style="background-image:url(\'' + esc(img(r.gambar_url, 300)) + '\')"></div><div class="grow"><b class="ell">' + esc(r.judul || '(tanpa judul)') + '</b><div class="meta">' + (r.label ? '<span class="chip chip-amber">' + esc(r.label) + '</span>' : '') + '<span>→ ' + esc(r.tujuan_klik || 'katalog') + '</span></div></div>'
  });
  VIEWS.bayar = m => crudList(m, {
    title: 'Rekening & QRIS Resmi', key: 'payments', save: 'savePayment', del: 'deletePayment', addText: 'Tambah Rekening/QRIS', order: 1, def: { jenis: 'Bank', cabang: 'Umum' },
    top: () => '<form class="panel f" data-cat><div class="fld"><label>Peringatan keamanan di halaman rekening</label><textarea name="catatan_pembayaran" rows="3">' + esc((B().settings || {}).catatan_pembayaran || '') + '</textarea></div><button class="btn btn-ghost btn-sm" style="justify-self:start" data-save>' + I('save') + 'Simpan Peringatan</button></form>',
    spec: [{ k: 'jenis', t: 'Jenis', type: 'select', opts: [['Bank', 'Rekening Bank'], ['QRIS', 'QRIS']], half: 1 }, { k: 'cabang', t: 'Berlaku untuk', type: 'select', opts: [['Umum', 'Semua cabang'], ['nabire', 'Nabire'], ['serui', 'Serui']], half: 1 },
      { k: 'nama_bank', t: 'Nama bank / judul', half: 1, ph: 'Bank Central Asia' }, { k: 'kode_bank', t: 'Kode singkat', half: 1, ph: 'BCA' }, { k: 'no_rekening', t: 'Nomor rekening', ph: 'Kosongkan untuk QRIS' },
      { k: 'atas_nama', t: 'Atas nama (A/N)' }, { k: 'gambar_qris_url', t: 'Gambar QRIS (khusus QRIS)', type: 'image', folder: 'QRIS' }, { k: 'catatan', t: 'Keterangan', ph: 'Transfer ATM / Mobile Banking' }],
    item: r => '<span class="bank-logo">' + esc(r.kode_bank || r.jenis) + '</span><div class="grow"><b class="ell">' + esc(r.nama_bank) + '</b><div class="meta"><span class="mono">' + esc(r.no_rekening || 'QRIS') + '</span><span>' + esc(r.atas_nama) + '</span>' + (r.contoh ? '<span class="chip chip-amber">Contoh</span>' : '') + '</div></div>',
    after: m => { const f = m.querySelector('[data-cat]'); f.onsubmit = async e => { e.preventDefault(); const r = await call('saveSettings', { settings: { catatan_pembayaran: f.catatan_pembayaran.value } }, f.querySelector('[data-save]')); if (r.success) { A.admin.settings = r.data.settings; setBoot(A.admin); refreshPublic(); } }; }
  });
  VIEWS.layanan = m => crudList(m, {
    title: 'Halaman Layanan', key: 'services', save: 'saveService', del: 'deleteService', addText: 'Tambah', noDel: 1, noAdd: 1,
    spec: [{ k: 'judul', t: 'Judul', half: 1 }, { k: 'ikon', t: 'Ikon', type: 'select', half: 1, opts: [['build_circle', 'Servis'], ['sell', 'Jual'], ['swap_horizontal_circle', 'Tukar tambah'], ['smartphone', 'HP'], ['support_agent', 'Konsultasi']] }, { k: 'deskripsi', t: 'Deskripsi', type: 'textarea' }, { k: 'template_wa', t: 'Template pesan WhatsApp', type: 'textarea', hint: '{cabang} otomatis diganti Nabire/Serui.' }],
    item: r => '<span class="avatar-i">' + I(r.ikon || 'build_circle') + '</span><div class="grow"><b>' + esc(r.judul) + '</b><div class="meta ell">' + esc(r.deskripsi) + '</div></div>'
  });

  /* ======================= POP-UP ======================= */
  const POP_SPEC = [{ k: 'popup_aktif', t: 'Pop-up promo AKTIF', type: 'switch', yaTidak: 1, hint: 'Muncul saat pengunjung membuka link bio.' }, { k: 'popup_gambar', t: 'Gambar pop-up (kosong = slide pertama)', type: 'image', folder: 'Popup' },
    { k: 'popup_judul', t: 'Judul' }, { k: 'popup_teks', t: 'Teks', type: 'textarea', rows: 2 }, { k: 'popup_tombol_teks', t: 'Teks tombol', half: 1 },
    { k: 'popup_tombol_tujuan', t: 'Tujuan tombol', type: 'select', opts: TUJUAN, half: 1 }, { k: 'popup_frekuensi', t: 'Tampilkan', type: 'select', opts: [['sekali_per_sesi', 'Sekali per kunjungan'], ['setiap_buka', 'Setiap halaman dibuka']] }];
  VIEWS.popup = function (m) {
    const s = B().settings || {};
    m.innerHTML = head('Pop-up Promo') + '<div class="two"><form class="panel f" data-f>' + form(POP_SPEC, s) + '<button class="btn btn-ink" data-save>' + I('save') + 'Simpan Pop-up</button></form>' +
      '<div class="panel"><h3 style="font:700 15px var(--f-head);margin-bottom:10px">Pratinjau</h3><div class="pop-prev" data-poppv></div><p class="muted small mt8">Mengaktifkan pop-up mengirim notifikasi WA ke admin cabang (bila modul notifikasi aktif).</p></div></div>';
    const f = m.querySelector('[data-f]'), pv = m.querySelector('[data-poppv]'); bindUploads(f);
    const draw = () => { const d = read(f, POP_SPEC), g = d.popup_gambar || ((B().banners || [])[0] || {}).gambar_url; pv.innerHTML = '<div class="pop-phone"><div class="pop-card">' + (d.popup_aktif === 'YA' ? '<span class="chip chip-ok pop-st">Aktif</span>' : '<span class="chip chip-no pop-st">Nonaktif — tidak tampil</span>') +
      (g ? '<img class="popup-img" src="' + esc(img(g, 600)) + '" alt="">' : '<div class="popup-img"></div>') + '<h3>' + esc(d.popup_judul || 'Judul promo') + '</h3>' + (d.popup_teks ? '<p>' + esc(d.popup_teks) + '</p>' : '') +
      '<div class="row mt12"><span class="btn btn-ghost btn-sm">Nanti saja</span><span class="btn btn-amber btn-sm grow">' + esc(d.popup_tombol_teks || 'Lihat') + '</span></div></div></div>'; };
    f.addEventListener('input', A.debounce(draw, 150)); f.addEventListener('change', draw); draw();
    f.onsubmit = async e => { e.preventDefault(); const r = await call('saveSettings', { settings: read(f, POP_SPEC) }, f.querySelector('[data-save]')); if (r.success) { A.admin.settings = r.data.settings; setBoot(A.admin); refreshPublic(); } };
  };

  /* ======================= CABANG & SOSMED ======================= */
  const BR_SPEC = [{ k: 'nama', t: 'Nama cabang', half: 1 }, { k: 'nomor_wa', t: 'Nomor WhatsApp admin', half: 1, ph: '0821…' }, { k: 'alamat', t: 'Alamat', type: 'textarea', rows: 2 }, { k: 'jam_buka', t: 'Jam buka', half: 1 },
    { k: 'link_maps', t: 'Link Google Maps', half: 1, ph: 'https://maps.app.goo.gl/…' }, { k: 'embed_maps', t: 'Peta mini (tempel kode embed/iframe atau URL)', type: 'textarea', rows: 2, hint: 'Google Maps → Bagikan → Sematkan peta → Salin HTML, lalu tempel di sini.' }, { k: 'aktif', t: 'Tampilkan cabang', type: 'switch' }];
  VIEWS.cabang = function (m) {
    m.innerHTML = head('Cabang & Sosial Media') + '<div class="two">' + (B().branches || []).map(b => '<form class="panel f" data-br="' + esc(b.id) + '"><div class="panel-h"><h3>' + I('storefront') + ' ' + esc(b.nama) + '</h3></div>' + form(BR_SPEC, b) + '<button class="btn btn-ink" data-save>' + I('save') + 'Simpan ' + esc(cabNama(b.id)) + '</button></form>').join('') + '</div><div data-soc></div>';
    m.querySelectorAll('[data-br]').forEach(f => f.onsubmit = async e => { e.preventDefault(); const d = Object.assign(read(f, BR_SPEC), { id: f.dataset.br }); const r = await call('saveBranch', d, f.querySelector('[data-save]')); if (r.success) { const i = A.admin.branches.findIndex(x => x.id === r.data.id); A.admin.branches[i] = r.data; setBoot(A.admin); refreshPublic(); } });
    const gw = document.createElement('div'); gw.className = 'panel'; m.querySelector('[data-soc]').appendChild(gw);
    const gaya0 = (B().settings || {}).sosmed_gaya === 'bulat' ? 'bulat' : 'tombol';
    gw.innerHTML = '<div class="panel-h"><h3>Gaya tampilan sosial media</h3><div class="seg" data-gy>' + GAYA_SOS.map(x => '<button data-v="' + x[0] + '"' + (x[0] === gaya0 ? ' class="on"' : '') + '>' + x[1] + '</button>').join('') + '</div></div><div class="sos-prev" data-sp></div>';
    const drawG = v => { const sp = gw.querySelector('[data-sp]'); sp.className = 'sos-prev soc-wrap ' + v; sp.innerHTML = '<div class="' + (v === 'bulat' ? 'socs-r' : 'socs-b') + '">' + (A.sosmedList ? A.sosmedList((B().socials || []).filter(x => x.aktif !== false), v) : '') + '</div>'; };
    drawG(gaya0);
    gw.querySelector('[data-gy]').onclick = async e => { const b = e.target.closest('[data-v]'); if (!b) return; gw.querySelectorAll('[data-gy] button').forEach(x => x.classList.toggle('on', x === b)); drawG(b.dataset.v); await saveSet({ sosmed_gaya: b.dataset.v }); };
    const soc = document.createElement('div'); m.querySelector('[data-soc]').appendChild(soc);
    crudList(soc, { title: 'Sosial Media Resmi', key: 'socials', save: 'saveSocial', del: 'deleteSocial', addText: 'Tambah Kanal', order: 1,
      spec: [{ k: 'platform', t: 'Platform', type: 'select', half: 1, opts: ['TikTok', 'Instagram', 'Facebook', 'WhatsApp', 'YouTube', 'Shopee', 'Tokopedia', 'Website'] }, { k: 'label', t: 'Label / akun', half: 1, ph: '@counter.accell' }, { k: 'url', t: 'Tautan', ph: 'https://… (WhatsApp: isi #wa untuk pilih cabang)' }],
      item: r => '<span class="avatar-i">' + I('public') + '</span><div class="grow"><b>' + esc(r.platform) + '</b><div class="meta ell">' + esc(r.label) + ' · ' + esc(r.url) + '</div></div>' });
    soc.querySelector('.adm-h').style.marginTop = '24px';
  };

  /* ======================= PENGGUNA ======================= */
  VIEWS.pengguna = function (m) {
    const users = B().users || [];
    m.innerHTML = head('Admin & Akses', '<button class="btn btn-amber btn-sm" data-add>' + I('person_add') + 'Tambah Admin</button>') +
      '<div class="note">' + I('shield_person') + '<div><b>Superadmin</b> mengatur semuanya. <b>Admin cabang</b> hanya mengelola produk cabangnya. Isi nomor WA/email agar menerima notifikasi.</div></div>' +
      '<div class="tbl-wrap mt12"><table class="tbl"><thead><tr><th>Nama</th><th>Peran</th><th>Kontak</th><th>Login terakhir</th><th></th></tr></thead><tbody>' + users.map(u =>
        '<tr class="' + (u.aktif ? '' : 'dim') + '"><td><b>' + esc(u.nama) + '</b><div class="muted small mono">' + esc(u.username) + '</div></td><td><span class="chip ' + (u.peran === 'superadmin' ? 'chip-ink' : 'chip-amber') + '">' + (u.peran === 'superadmin' ? 'Superadmin' : 'Admin ' + cabNama(u.cabang)) + '</span>' + (u.wajib_ganti ? '<div class="tiny muted mt8">wajib ganti sandi</div>' : '') + '</td>' +
        '<td class="small">' + esc(u.no_wa || '-') + '<div class="muted">' + esc(u.email || '') + '</div></td><td class="small">' + tgl(u.login_terakhir) + '</td><td><div class="row"><button class="btn btn-ghost btn-xs" data-e="' + esc(u.id) + '">' + I('edit') + 'Ubah</button><button class="btn btn-ghost btn-xs" data-pw="' + esc(u.id) + '">' + I('lock_reset') + 'Reset</button></div></td></tr>').join('') + '</tbody></table></div>';
    const spec = isNew => [{ k: 'nama', t: 'Nama', half: 1 }, { k: 'username', t: 'Username', half: 1, ph: 'admin_nabire' }, { k: 'peran', t: 'Peran', type: 'select', opts: [['admin_cabang', 'Admin Cabang'], ['superadmin', 'Superadmin']], half: 1 },
      { k: 'cabang', t: 'Cabang', type: 'select', opts: [['nabire', 'Nabire'], ['serui', 'Serui']], half: 1 }, { k: 'no_wa', t: 'Nomor WhatsApp', half: 1 }, { k: 'email', t: 'Email', half: 1, type: 'email' }]
      .concat(isNew ? [{ k: 'password', t: 'Sandi sementara', hint: 'Min. 8 karakter huruf+angka. Admin wajib menggantinya saat login pertama.' }] : [{ k: 'aktif', t: 'Akun aktif', type: 'switch' }]);
    const edit = u => {
      const sp = spec(!u), o = A.sheet('<form class="f">' + form(sp, u || { peran: 'admin_cabang', cabang: 'nabire', aktif: true }) + '<div class="row"><button type="button" class="btn btn-ghost" data-x>Batal</button><button class="btn btn-ink grow" data-save>Simpan</button></div></form>', { title: u ? 'Ubah Akun' : 'Tambah Admin' });
      const f = o.querySelector('form');
      f.onsubmit = async e => { e.preventDefault(); const d = read(f, sp); if (u) d.id = u.id; const r = await call('saveUser', d, f.querySelector('[data-save]')); if (r.success) { const i = users.findIndex(x => x.id === r.data.id); if (i > -1) users[i] = r.data; else users.push(r.data); A.admin.users = users; setBoot(A.admin); o.close(); VIEWS.pengguna(m); } };
    };
    m.querySelector('[data-add]').onclick = () => edit(null);
    m.querySelectorAll('[data-e]').forEach(b => b.onclick = () => edit(users.find(u => u.id === b.dataset.e)));
    m.querySelectorAll('[data-pw]').forEach(b => b.onclick = () => {
      const u = users.find(x => x.id === b.dataset.pw);
      const o = A.sheet('<form class="f"><p class="muted" style="margin:0">Atur sandi sementara untuk <b>' + esc(u.nama) + '</b>. Semua sesinya akan keluar dan ia wajib mengganti sandi saat login.</p><div class="fld"><label>Sandi sementara</label><input name="password" required minlength="8"></div><button class="btn btn-ink" data-save>Reset Sandi</button></form>', { title: 'Reset Sandi' });
      const f = o.querySelector('form'); f.onsubmit = async e => { e.preventDefault(); const r = await call('resetUserPassword', { id: u.id, password: f.password.value }, f.querySelector('[data-save]')); if (r.success) o.close(); };
    });
  };

  /* ======================= LOG ======================= */
  VIEWS.log = async function (m) {
    m.innerHTML = head('Log Aktivitas', '<button class="btn btn-ghost btn-sm" data-r>' + I('refresh') + 'Muat ulang</button>') + '<div data-b><div class="skel" style="height:200px"></div></div>';
    const load = async () => { const r = await A.api('logs'); const b = m.querySelector('[data-b]'); if (!b) return; b.innerHTML = r.success ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Waktu</th><th>Pengguna</th><th>Aksi</th><th>Target</th></tr></thead><tbody>' + r.data.map(x => '<tr><td class="small">' + tgl(x.waktu) + '</td><td>' + esc(x.username) + '</td><td><span class="chip">' + esc(x.aksi) + '</span></td><td class="small">' + esc(x.target) + ' <span class="muted">' + esc(x.detail) + '</span></td></tr>').join('') + '</tbody></table></div>' : '<div class="note red">' + esc(r.message) + '</div>'; };
    m.querySelector('[data-r]').onclick = load; load();
  };

  /* ======================= AKUN ======================= */
  VIEWS.akun = function (m) {
    const u = A.user;
    m.innerHTML = head('Akun Saya') + '<div class="two"><div class="panel"><div class="row"><span class="avatar-i" style="width:52px;height:52px;font-size:18px">' + esc((u.nama || 'A')[0]) + '</span><div><b style="font:700 16px var(--f-head)">' + esc(u.nama) + '</b><div class="muted small">' + esc(u.username) + ' · ' + (isSA() ? 'Superadmin' : 'Admin ' + cabNama(u.cabang)) + '</div></div></div>' +
      '<div class="menu-grid mt16" style="grid-template-columns:1fr"><a href="../" target="_blank">' + I('open_in_new') + 'Buka Link Bio</a><button data-nk-license>' + I('key') + 'Lisensi Template</button><button data-out>' + I('logout') + 'Keluar dari dasbor</button></div></div>' +
      '<form class="panel f"><h3 style="font:700 16px var(--f-head)">Ganti Sandi</h3>' + pwFields() + '<div class="small" style="color:var(--danger);min-height:16px" data-err></div><button class="btn btn-ink" data-go>Simpan Sandi Baru</button></form></div>';
    m.querySelector('[data-out]').onclick = () => logout('Anda telah keluar.');
    bindPw(m.querySelector('form'), r => { saveAuth(r.data.token, r.data.user, false); if (r.data.boot) setBoot(r.data.boot); m.querySelector('form').reset(); });
  };

  /* ======================= WHATSAPP & NOTIFIKASI ======================= */
  let notifTab = 'blast', aud = null, blastAuto = null;
  VIEWS.notif = function (m) {
    m.innerHTML = head('WhatsApp & Notifikasi') + '<div class="tabs" role="tablist">' + [['blast', '📣 Blast WhatsApp'], ['antrean', '📬 Antrean & Riwayat'], ['konfig', '⚙️ Konfigurasi']].map(t => '<button data-t="' + t[0] + '"' + (t[0] === notifTab ? ' class="on"' : '') + '>' + t[1] + '</button>').join('') + '</div><div data-tb></div>';
    m.querySelector('.tabs').onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; notifTab = b.dataset.t; m.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b)); tab(); };
    const tab = () => { clearInterval(blastAuto); const box = m.querySelector('[data-tb]'); ({ blast: tabBlast, antrean: tabQueue, konfig: tabConfig })[notifTab](box); };
    tab();
  };
  function tabBlast(box) {
    box.innerHTML = '<div class="two"><div class="panel"><div class="panel-h"><h3>1. Pilih Sasaran</h3></div><div class="f">' +
      '<div class="f2"><div class="fld"><label>Sumber</label><select data-src><option value="crm">CRM Kontak</option><option value="manual">Tempel manual</option></select></div><div class="fld" data-segw><label>Segmen</label><select data-seg><option value="">Semua segmen</option>' + ['Pelanggan', 'Calon Pelanggan', 'Reseller', 'Mitra', 'Tim Acc Cell'].map(s => '<option>' + s + '</option>').join('') + '</select></div></div>' +
      '<div class="fld" data-tagw><label>Tag (opsional)</label><input data-tag placeholder="mis. promo"></div><div class="fld" data-manw hidden><label>Nomor (satu per baris: 0812…|Nama)</label><textarea data-man rows="4" placeholder="081234567890|Budi"></textarea></div>' +
      '<div class="row wrap"><button class="btn btn-ink btn-sm" data-load>' + I('group') + 'Muat Penerima</button><button class="btn btn-ghost btn-sm" data-det>' + I('verified') + 'Deteksi Nomor WA</button></div>' +
      '<div data-ring class="row wrap"></div><label class="row small"><input type="checkbox" data-onlywa> Kirim hanya ke nomor terdeteksi WhatsApp</label><div class="tbl-wrap" style="max-height:300px;overflow:auto" data-aud><p class="muted small pad">Klik “Muat Penerima”.</p></div></div></div>' +
      '<div class="panel"><div class="panel-h"><h3>2. Tulis Pesan</h3></div><div class="f"><div class="fld"><label>Judul internal</label><input data-judul placeholder="Promo akhir bulan"></div>' +
      '<div class="row wrap">' + ['{nama}', '{toko}', '{link}'].map(v => '<button class="chip" data-var="' + v + '">' + v + '</button>').join('') + '</div><div class="fld"><textarea data-msg rows="6" placeholder="Halo {nama}! Promo spesial di {toko}…"></textarea><div class="hint">Tips anti-blokir: mulai batch 10, jeda acak ≥ 5 detik, hindari tautan sama ke ratusan orang dalam 1 jam. Tambahkan “Balas STOP untuk berhenti.”</div></div>' +
      '<div class="wa-bg"><div class="wa-preview" data-pv>Pratinjau pesan…</div></div>' +
      '<h3 style="font:700 16px var(--f-head);margin-top:8px">3. Ukuran Batch & Jeda</h3><div class="row wrap"><div class="seg" data-batch>' + [10, 20, 50].map(n => '<button data-n="' + n + '"' + (n === 10 ? ' class="on"' : '') + '>' + n + '</button>').join('') + '</div><div class="fld" style="width:140px"><input data-jeda value="5" aria-label="Jeda detik" placeholder="5 atau 3-8"></div><span class="muted small">detik jeda</span></div>' +
      '<p class="muted small" data-sum></p><button class="btn btn-wa" data-start>' + I('rocket_launch') + 'Mulai Blast</button></div></div></div><div data-active></div><div class="panel"><div class="panel-h"><h3>Riwayat Blast</h3></div><div data-hist><div class="skel" style="height:80px"></div></div></div>';
    const $b = s => box.querySelector(s);
    let batch = 10;
    const src = $b('[data-src]');
    src.onchange = () => { const man = src.value === 'manual'; $b('[data-manw]').hidden = !man; $b('[data-segw]').hidden = man; $b('[data-tagw]').hidden = man; };
    const recips = () => (aud ? aud.rows : []).filter(r => r.valid && !r.ganda && !r.optOut && (!$b('[data-onlywa]').checked || r.statusWA === 'Terdaftar') && r._on !== false);
    const sum = () => { const n = recips().length, j = String($b('[data-jeda]').value).split('-').map(Number), avg = j.length > 1 ? (j[0] + j[1]) / 2 : j[0] || 5; $b('[data-sum]').textContent = n + ' penerima → ' + Math.ceil(n / batch) + ' batch · perkiraan ±' + Math.max(1, Math.round(n * avg / 60)) + ' menit'; $b('[data-start]').innerHTML = I('rocket_launch') + 'Mulai Blast (' + n + ' nomor)'; };
    const pv = () => { const first = recips()[0] || { nama: 'Budi' }; $b('[data-pv]').textContent = ($b('[data-msg]').value || 'Pratinjau pesan…').replace(/\{nama\}/g, first.nama).replace(/\{toko\}/g, (B().settings || {}).nama_toko || 'Acc Cell').replace(/\{link\}/g, location.href.split('#')[0]); };
    const drawAud = () => {
      if (!aud) return; const r = aud.ringkas;
      $b('[data-ring]').innerHTML = ['total', 'valid', 'tidakValid', 'ganda', 'terdaftarWA', 'optOut'].map(k => '<span class="chip' + (k === 'valid' ? ' chip-ok' : k === 'tidakValid' || k === 'optOut' ? ' chip-no' : '') + '">' + ({ total: 'Total', valid: 'Valid', tidakValid: 'Tidak valid', ganda: 'Ganda', terdaftarWA: 'Terdaftar WA', optOut: 'Opt-out' })[k] + ' ' + r[k] + '</span>').join('');
      $b('[data-aud]').innerHTML = '<table class="tbl"><thead><tr><th></th><th>Nama</th><th>Nomor</th><th>WA</th></tr></thead><tbody>' + aud.rows.slice(0, 500).map((x, i) => '<tr class="' + (!x.valid || x.ganda || x.optOut ? 'dim' : '') + '"><td><input type="checkbox" data-i="' + i + '"' + (x._on !== false && x.valid && !x.ganda && !x.optOut ? ' checked' : '') + (!x.valid || x.ganda || x.optOut ? ' disabled' : '') + '></td><td>' + esc(x.nama) + (x.optOut ? ' <span class="chip chip-no">opt-out</span>' : '') + '</td><td class="mono small">' + esc(x.hp) + '</td><td>' + waBadge(x.statusWA) + '</td></tr>').join('') + '</tbody></table>';
      sum(); pv();
    };
    $b('[data-aud]').onchange = e => { const c = e.target.closest('[data-i]'); if (c) { aud.rows[+c.dataset.i]._on = c.checked; sum(); } };
    $b('[data-load]').onclick = async ev => { const r = await call('wa.audience', { sumber: src.value === 'manual' ? 'manual' : 'crm', segmen: $b('[data-seg]').value, tag: $b('[data-tag]').value.trim(), manual: $b('[data-man]').value }, ev.currentTarget, { silent: 1, label: 'Memuat…' }); if (r.success) { aud = r.data; drawAud(); } };
    $b('[data-det]').onclick = async ev => {
      if (!aud) return A.toast('Muat penerima dulu', 'info');
      const nums = [...new Set(aud.rows.filter(x => x.valid && !x.statusWA).map(x => x.hp))]; if (!nums.length) return A.toast('Semua nomor sudah dicek');
      const btn = ev.currentTarget; btn.disabled = true;
      for (let i = 0; i < nums.length; i += 50) {
        btn.innerHTML = I('hourglass_top') + 'Mengecek ' + Math.min(i + 50, nums.length) + '/' + nums.length;
        const r = await A.api('wa.validate', { nomor: nums.slice(i, i + 50) });
        if (!r.success) { A.toast(r.message, 'err'); break; }
        aud.rows.forEach(x => { if (r.data.peta[x.hp]) x.statusWA = r.data.peta[x.hp]; });
        aud.ringkas.terdaftarWA = aud.rows.filter(x => x.statusWA === 'Terdaftar').length; drawAud();
      }
      btn.disabled = false; btn.innerHTML = I('verified') + 'Deteksi Nomor WA';
    };
    box.querySelectorAll('[data-var]').forEach(b => b.onclick = () => { const t = $b('[data-msg]'), s = t.selectionStart || t.value.length; t.value = t.value.slice(0, s) + b.dataset.var + t.value.slice(t.selectionEnd || s); t.focus(); pv(); });
    $b('[data-msg]').addEventListener('input', A.debounce(pv, 120));
    $b('[data-batch]').onclick = e => { const b = e.target.closest('[data-n]'); if (!b) return; batch = +b.dataset.n; box.querySelectorAll('[data-n]').forEach(x => x.classList.toggle('on', x === b)); sum(); };
    $b('[data-jeda]').addEventListener('input', sum); $b('[data-onlywa]').onchange = sum;
    $b('[data-start]').onclick = async ev => {
      const list = recips(); if (!list.length) return A.toast('Belum ada penerima valid', 'err');
      if (!$b('[data-msg]').value.trim()) return A.toast('Tulis pesan dulu', 'err');
      if (!await A.confirm('Kirim blast ke ' + list.length + ' nomor dalam batch ' + batch + '?', 'Mulai Blast')) return;
      const r = await call('wa.blastCreate', { judul: $b('[data-judul]').value, pesan: $b('[data-msg]').value, ukuranBatch: batch, jeda: $b('[data-jeda]').value.trim(), sasaran: src.value === 'manual' ? 'Manual' : ($b('[data-seg]').value || 'Semua') + ($b('[data-tag]').value ? ' #' + $b('[data-tag]').value : ''), penerima: list.map(x => ({ hp: x.hp, nama: x.nama })) }, ev.currentTarget);
      if (r.success) { activeBlast(box, r.data.blastId); hist(); }
    };
    const hist = async () => {
      const r = await A.api('wa.blastList'); const h = $b('[data-hist]'); if (!h) return;
      if (!r.success) { h.innerHTML = '<div class="note red">' + esc(r.message) + '</div>'; return; }
      h.innerHTML = r.data.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Judul</th><th>Sasaran</th><th>Batch·jeda</th><th>Progres</th><th>Status</th><th></th></tr></thead><tbody>' + r.data.map(b => '<tr><td><b>' + esc(b.Judul) + '</b><div class="tiny muted">' + tgl(b.Tanggal) + '</div></td><td class="small">' + esc(b.Sasaran) + '</td><td class="small">' + b.UkuranBatch + ' · ' + esc(b.JedaDetik) + 's</td><td style="min-width:120px"><div class="progress"><i style="width:' + b.persen + '%"></i></div><span class="tiny muted">' + b.Terkirim + ' terkirim · ' + b.Gagal + ' gagal · ' + b.sisa + ' sisa</span></td><td><span class="chip ' + (b.Status === 'Selesai' ? 'chip-ok' : b.Status === 'Berjalan' ? 'chip-amber' : '') + '">' + esc(b.Status) + '</span></td><td>' + (b.Status === 'Berjalan' ? '<button class="btn btn-ghost btn-xs" data-mon="' + esc(b.BlastID) + '">Pantau</button>' : '') + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="muted small">Belum ada blast.</p>';
      h.querySelectorAll('[data-mon]').forEach(b => b.onclick = () => activeBlast(box, b.dataset.mon));
      const run = r.data.find(b => b.Status === 'Berjalan'); if (run && !$b('[data-active]').innerHTML) activeBlast(box, run.BlastID);
    };
    hist();
  }
  function activeBlast(box, id) {
    const w = box.querySelector('[data-active]'); let auto = false, cd = 0;
    w.innerHTML = '<div class="panel" style="border-color:var(--wa)"><div class="panel-h"><h3>' + I('send') + ' Blast berjalan</h3><label class="row small">Otomatis <span class="switch"><input type="checkbox" data-auto><i></i></span></label></div><div class="progress"><i data-pg style="width:0"></i></div><p class="small muted" data-st>Memuat…</p>' +
      '<div class="row wrap"><button class="btn btn-wa btn-sm" data-next>' + I('play_arrow') + 'Kirim Batch Berikutnya Sekarang</button><button class="btn btn-danger btn-sm" data-stop>' + I('stop') + 'Hentikan</button></div><p class="tiny muted mt8">Server tetap mengirim 1 batch per menit walau halaman ditutup.</p></div>';
    const upd = b => { if (!b) return; w.querySelector('[data-pg]').style.width = b.persen + '%'; w.querySelector('[data-st]').textContent = b.Judul + ' — ' + b.Terkirim + ' terkirim · ' + b.Gagal + ' gagal · ' + b.sisa + ' sisa · ' + b.Status + (auto && b.Status === 'Berjalan' ? ' · batch berikut dalam ' + cd + ' dtk' : ''); if (b.Status !== 'Berjalan') { clearInterval(blastAuto); w.querySelector('[data-next]').disabled = true; w.querySelector('[data-stop]').disabled = true; } };
    let last = null;
    const next = async btn => { const r = await call('wa.blastProcess', { blastId: id }, btn, { silent: 1, label: 'Mengirim…' }); if (r.success) { last = r.data.blast; upd(last); } };
    w.querySelector('[data-next]').onclick = e => next(e.currentTarget);
    w.querySelector('[data-stop]').onclick = async e => { if (!await A.confirm('Hentikan blast? Pesan yang belum terkirim dibatalkan.', 'Hentikan', true)) return; const r = await call('wa.blastStop', { blastId: id }, e.currentTarget); if (r.success) { clearInterval(blastAuto); next(); } };
    w.querySelector('[data-auto]').onchange = e => {
      auto = e.target.checked; clearInterval(blastAuto);
      if (!auto || !last) return; const gap = () => Math.max(30, Number(last.UkuranBatch) * (String(last.JedaDetik).split('-').map(Number).reduce((a, b) => a + b, 0) / String(last.JedaDetik).split('-').length));
      cd = Math.round(gap());
      blastAuto = setInterval(() => { if (!w.isConnected) return clearInterval(blastAuto); cd--; if (cd <= 0) { cd = Math.round(gap()); next(); } else upd(last); }, 1000);
    };
    A.api('wa.blastList').then(r => { if (r.success) { last = r.data.find(b => b.BlastID === id); upd(last); } });
  }
  const waBadge = s => s === 'Terdaftar' ? '<span class="wa-badge ya">✓ WA</span>' : s === 'Tidak Terdaftar' ? '<span class="wa-badge tidak">✕ bukan WA</span>' : '<span class="wa-badge belum">? belum dicek</span>';
  function tabQueue(box) {
    let f = { status: '', kanal: '' };
    box.innerHTML = '<div class="kpis" data-k></div><div class="row wrap mt12"><select class="inp" style="width:auto" data-s><option value="">Semua status</option><option>Antri</option><option>Terkirim</option><option>Gagal</option><option>Batal</option></select><select class="inp" style="width:auto" data-c><option value="">Semua kanal</option><option>WA</option><option>EMAIL</option></select><button class="btn btn-ink btn-sm" data-now>' + I('send') + 'Proses Sekarang</button><button class="btn btn-ghost btn-sm" data-retry>' + I('replay') + 'Ulangi yang Gagal</button></div><div class="mt12" data-t><div class="skel" style="height:200px"></div></div>';
    const load = async () => {
      const r = await A.api('notif.queue', f); if (!box.isConnected) return;
      if (!r.success) { box.querySelector('[data-t]').innerHTML = '<div class="note red">' + esc(r.message) + '</div>'; return; }
      const k = r.data.ringkas;
      box.querySelector('[data-k]').innerHTML = [['Antri', 'Menunggu', 'schedule'], ['Terkirim', 'Terkirim', 'done_all'], ['Gagal', 'Gagal', 'error'], ['Batal', 'Dibatalkan', 'block']].map(x => '<div class="kpi"><span>' + I(x[2]) + x[1] + '</span><b>' + (k[x[0]] || 0) + '</b></div>').join('');
      box.querySelector('[data-t]').innerHTML = r.data.rows.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Waktu</th><th>Kanal</th><th>Tujuan</th><th>Event</th><th>Pesan</th><th>Status</th></tr></thead><tbody>' + r.data.rows.map(x => '<tr><td class="small">' + tgl(x.DikirimPada || x.DibuatPada) + '</td><td><span class="chip ' + (x.Kanal === 'WA' ? 'chip-ok' : 'chip-info') + '">' + esc(x.Kanal) + '</span></td><td class="small mono">' + esc(x.Tujuan) + '<div class="muted">' + esc(x.NamaPenerima) + '</div></td><td class="small">' + esc(x.Event) + '</td><td class="small" style="max-width:260px">' + esc(String(x.Pesan).slice(0, 90)) + '</td><td><span class="chip ' + (x.Status === 'Terkirim' ? 'chip-ok' : x.Status === 'Gagal' ? 'chip-no' : '') + '">' + esc(x.Status) + '</span><div class="tiny muted">' + esc(x.Respon || '') + '</div></td></tr>').join('') + '</tbody></table></div>' : '<p class="muted small">Antrean kosong.</p>';
    };
    box.querySelector('[data-s]').onchange = e => { f.status = e.target.value; load(); };
    box.querySelector('[data-c]').onchange = e => { f.kanal = e.target.value; load(); };
    box.querySelector('[data-now]').onclick = async e => { const r = await call('notif.processNow', {}, e.currentTarget, { silent: 1, label: 'Memproses…' }); if (r.success) A.toast('Diproses: ' + (r.data.dikirim || 0) + ' terkirim, ' + (r.data.gagal || 0) + ' gagal'); load(); };
    box.querySelector('[data-retry]').onclick = async e => { await call('notif.retry', {}, e.currentTarget); load(); };
    load();
  }
  function tabConfig(box) {
    box.innerHTML = '<div class="skel" style="height:300px"></div>';
    A.api('notif.config').then(r => {
      if (!box.isConnected) return; if (!r.success) { box.innerHTML = '<div class="note red">' + esc(r.message) + '</div>'; return; }
      const c = r.data, mx = c.matriks;
      box.innerHTML = '<div class="two"><div class="panel f"><div class="panel-h"><h3>' + I('chat') + ' WhatsApp (Fonnte)</h3><label class="switch"><input type="checkbox" data-wa' + (c.waAktif ? ' checked' : '') + '><i></i></label></div>' +
        '<div class="fld"><label>Token Fonnte</label><input type="password" data-token placeholder="' + esc(c.tokenMask || 'Tempel token dari fonnte.com → Device') + '" autocomplete="off"><div class="hint">Disimpan aman di server (Script Properties), tidak pernah tampil ke pengunjung.' + (c.adaToken ? ' <a href="#" data-deltoken style="color:var(--danger)">Hapus token</a>' : '') + '</div></div>' +
        '<div class="row wrap"><button class="btn btn-ghost btn-sm" data-dev>' + I('cell_tower') + 'Cek Perangkat</button><input class="inp" style="width:170px;min-height:36px" data-tnum placeholder="08… nomor tes"><button class="btn btn-ghost btn-sm" data-twa>Kirim Tes WA</button></div><div data-devinfo class="small muted"></div>' +
        '<div class="f2"><div class="fld"><label>Batch default</label><select data-bd>' + [10, 20, 50].map(n => '<option' + (n === c.batchDefault ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></div><div class="fld"><label>Jeda (detik)</label><input data-jd value="' + esc(c.jeda) + '"></div></div>' +
        '<label class="row" style="justify-content:space-between"><span class="small"><b>Deteksi otomatis</b> nomor kontak baru terdaftar WA</span><span class="switch"><input type="checkbox" data-det' + (c.deteksiOtomatis ? ' checked' : '') + '><i></i></span></label></div>' +
        '<div class="panel f"><div class="panel-h"><h3>' + I('mail') + ' Email</h3><label class="switch"><input type="checkbox" data-em' + (c.emailAktif ? ' checked' : '') + '><i></i></label></div><p class="small muted" style="margin:0">Sisa kuota email hari ini: <b>' + c.kuotaEmail + '</b> (Gmail biasa ±100/hari).</p>' +
        '<div class="fld"><label>Nama pengirim</label><input data-np value="' + esc(c.namaPengirim) + '"></div><div class="row"><input class="inp grow" style="min-height:36px" data-tem placeholder="email tes"><button class="btn btn-ghost btn-sm" data-tes>Kirim Tes</button></div>' +
        '<div class="fld"><label>URL aplikasi (untuk {link})</label><input data-url value="' + esc(c.appUrl || location.href.split('#')[0]) + '"></div><p class="small" style="margin:0">Pemicu latar: ' + (c.trigger ? '<span class="chip chip-ok">aktif tiap 1 menit</span>' : '<span class="chip chip-no">belum terpasang — jalankan pasangTrigger()</span>') + '</p></div></div>' +
        '<div class="panel"><div class="panel-h"><h3>Matriks Notifikasi Otomatis</h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Kejadian</th><th>Penerima</th><th>WA</th><th>Email</th><th></th></tr></thead><tbody>' +
        Object.keys(mx).map(k => '<tr><td><b>' + esc(mx[k].label) + '</b><div class="tiny muted mono">' + k + '</div></td><td class="small">' + esc(mx[k].penerima) + '</td><td><label class="switch"><input type="checkbox" data-mw="' + k + '"' + (mx[k].wa ? ' checked' : '') + '><i></i></label></td><td><label class="switch"><input type="checkbox" data-me="' + k + '"' + (mx[k].email ? ' checked' : '') + '><i></i></label></td><td><button class="btn btn-ghost btn-xs" data-ed="' + k + '">' + I('edit') + 'Ubah</button></td></tr><tr data-row="' + k + '" hidden><td colspan="5"><div class="f"><div class="fld"><label>Subjek email</label><input data-sj="' + k + '" value="' + esc(mx[k].subjek) + '"></div><div class="fld"><label>Isi pesan</label><textarea data-ps="' + k + '" rows="4">' + esc(mx[k].pesan) + '</textarea><div class="hint">Variabel: {nama} {toko} {link} {admin} {peran} {waktu} {produk} {harga} {cabang} {promo} {username} {kunjungan} {klikWa}</div></div><button class="btn btn-ghost btn-xs" style="justify-self:start" data-def="' + k + '">↺ Kembalikan bawaan</button></div></td></tr>').join('') +
        '</tbody></table></div><button class="btn btn-ink mt12" data-save>' + I('save') + 'Simpan Konfigurasi</button></div>';
      const q = s => box.querySelector(s);
      box.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => { const r0 = q('[data-row="' + b.dataset.ed + '"]'); r0.hidden = !r0.hidden; });
      box.querySelectorAll('[data-def]').forEach(b => b.onclick = () => { const k = b.dataset.def; q('[data-sj="' + k + '"]').value = mx[k].subjekDefault; q('[data-ps="' + k + '"]').value = mx[k].pesanDefault; });
      const dt = q('[data-deltoken]'); if (dt) dt.onclick = e => { e.preventDefault(); q('[data-token]').value = '__HAPUS__'; A.toast('Token akan dihapus saat disimpan', 'info'); };
      q('[data-dev]').onclick = async e => { const r2 = await call('wa.device', {}, e.currentTarget, { silent: 1, label: 'Mengecek…' }); if (r2.success) q('[data-devinfo]').innerHTML = 'Perangkat: <b>' + esc(r2.data.device) + '</b> · status <b>' + esc(r2.data.device_status) + '</b> · paket ' + esc(r2.data.package || '-') + ' · kuota ' + esc(r2.data.quota || '-'); };
      q('[data-twa]').onclick = e => call('wa.test', { nomor: q('[data-tnum]').value }, e.currentTarget, { label: 'Mengirim…' });
      q('[data-tes]').onclick = e => call('email.test', { email: q('[data-tem]').value }, e.currentTarget, { label: 'Mengirim…' });
      q('[data-save]').onclick = async e => {
        const matriks = {}; Object.keys(mx).forEach(k => { matriks[k] = { wa: q('[data-mw="' + k + '"]').checked, email: q('[data-me="' + k + '"]').checked, subjek: q('[data-sj="' + k + '"]').value, pesan: q('[data-ps="' + k + '"]').value }; });
        const r2 = await call('notif.configSave', { waAktif: q('[data-wa]').checked, emailAktif: q('[data-em]').checked, token: q('[data-token]').value.trim(), batchDefault: +q('[data-bd]').value, jeda: q('[data-jd]').value.trim(), deteksiOtomatis: q('[data-det]').checked, namaPengirim: q('[data-np]').value, appUrl: q('[data-url]').value.trim(), matriks }, e.currentTarget);
        if (r2.success) tabConfig(box);
      };
    });
  }

  /* ======================= CRM KONTAK ======================= */
  const crmF = { cari: '', segmen: '', statusWA: '', optOut: '', duplikat: '', masalah: '', halaman: 1, per: 50 };
  let crmSel = new Set();
  VIEWS.crm = function (m) {
    m.innerHTML = head('CRM Kontak', '<button class="btn btn-ghost btn-sm" data-sync>' + I('sync') + 'Sinkron</button><button class="btn btn-ghost btn-sm" data-imp>' + I('upload_file') + 'Import CSV</button><button class="btn btn-amber btn-sm" data-add>' + I('person_add') + 'Tambah Kontak</button>') +
      '<div class="kpis" data-kpi><div class="skel" style="height:90px"></div><div class="skel" style="height:90px"></div></div>' +
      '<div class="pills mt12" data-seg></div><div class="row wrap mt8"><div class="search grow" style="margin:0;min-width:220px">' + I('search') + '<input type="search" placeholder="Cari nama, email, nomor, tag" data-q value="' + esc(crmF.cari) + '"></div>' +
      '<select class="inp" style="width:auto" data-wa><option value="">Status WA: semua</option><option value="Terdaftar">✓ Terdaftar WA</option><option value="Tidak Terdaftar">✕ Bukan WA</option><option value="Belum">? Belum dicek</option></select><button class="btn btn-ghost btn-sm" data-exp>' + I('download') + 'Ekspor CSV</button></div>' +
      '<div data-bulk class="mt12"></div><div data-tbl class="mt12"><div class="skel" style="height:240px"></div></div>';
    const q = s => m.querySelector(s);
    q('[data-q]').addEventListener('input', A.debounce(e => { crmF.cari = e.target.value; crmF.halaman = 1; loadList(); }, 350));
    q('[data-wa]').value = crmF.statusWA; q('[data-wa]').onchange = e => { crmF.statusWA = e.target.value; crmF.halaman = 1; loadList(); };
    q('[data-sync]').onclick = async e => { await call('crm.sync', {}, e.currentTarget, { label: 'Sinkron…' }); loadAll(); };
    q('[data-add]').onclick = () => kontakForm(null, loadAll);
    q('[data-imp]').onclick = () => importKontak(loadAll);
    q('[data-exp]').onclick = async e => { const r = await call('crm.export', filt(), e.currentTarget, { silent: 1, label: 'Menyiapkan…' }); if (r.success) downloadCsv('kontak-acc-cell.csv', [['Nama', 'Email', 'WhatsApp', 'Segmen', 'Tag', 'Status WA', 'Opt-out', 'Jumlah Pesan', 'Terakhir Dihubungi']].concat(r.data.map(k => [k.nama, k.email, k.wa, k.segmen, k.tag, k.statusWA, k.optOut ? 'YA' : 'TIDAK', k.jumlahPesan, k.terakhir]))); };
    const filt = () => { const o = {}; Object.keys(crmF).forEach(k => { if (crmF[k] !== '') o[k] = crmF[k]; }); return o; };
    const loadStats = async () => {
      const c = Store.get('a:crmstats', null); if (c) drawK(c);
      const r = await A.api('crm.stats'); if (r.success) { Store.set('a:crmstats', r.data); drawK(r.data); }
    };
    const drawK = s => {
      if (!q('[data-kpi]')) return;
      q('[data-kpi]').innerHTML = [['Total Kontak', s.total, 'contacts', ''], ['WA Terverifikasi', s.waTerdaftar, 'verified', 'statusWA:Terdaftar'], ['Email Valid', s.emailValid, 'mail', ''], ['Belum Dicek WA', s.belumCek, 'help', 'statusWA:Belum'], ['Opt-out', s.optOut, 'block', 'optOut:YA'], ['Duplikat', s.duplikat, 'content_copy', 'duplikat:1']]
        .map(x => '<button class="kpi click" data-kf="' + x[3] + '"><span>' + I(x[2]) + x[0] + '</span><b>' + x[1] + '</b></button>').join('');
      q('[data-kpi]').querySelectorAll('[data-kf]').forEach(b => b.onclick = () => { ['statusWA', 'optOut', 'duplikat', 'masalah'].forEach(k => crmF[k] = ''); if (b.dataset.kf) { const [k, v] = b.dataset.kf.split(':'); crmF[k] = v; } q('[data-wa]').value = crmF.statusWA; crmF.halaman = 1; loadList(); });
      q('[data-seg]').innerHTML = '<button class="pill' + (crmF.segmen ? '' : ' on') + '" data-sg="">Semua <span class="cnt">' + s.total + '</span></button>' + Object.keys(s.segmen || {}).map(g => '<button class="pill' + (crmF.segmen === g ? ' on' : '') + '" data-sg="' + esc(g) + '">' + esc(g) + ' <span class="cnt">' + s.segmen[g] + '</span></button>').join('');
      q('[data-seg]').onclick = e => { const b = e.target.closest('[data-sg]'); if (!b) return; crmF.segmen = b.dataset.sg; crmF.halaman = 1; m.querySelectorAll('[data-sg]').forEach(x => x.classList.toggle('on', x === b)); loadList(); };
    };
    const loadList = async () => {
      const r = await A.api('crm.list', filt()); const t = q('[data-tbl]'); if (!t) return;
      if (!r.success) { t.innerHTML = '<div class="note red">' + esc(r.message) + '</div>'; return; }
      const d = r.data;
      t.innerHTML = (d.rows.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th><input type="checkbox" data-all aria-label="Pilih semua"></th><th>Nama</th><th>Email</th><th>WhatsApp</th><th>Tag</th><th>Dihubungi</th><th></th></tr></thead><tbody>' + d.rows.map(k =>
        '<tr class="' + (k.duplikat || !k.wa || k.emailValid === 'TIDAK' ? 'warn' : '') + '"><td><input type="checkbox" data-sel="' + esc(k.id) + '"' + (crmSel.has(k.id) ? ' checked' : '') + '></td><td><div class="row"><span class="avatar-i">' + esc(String(k.nama || '?').slice(0, 2).toUpperCase()) + '</span><div><b>' + esc(k.nama) + '</b><div><span class="chip">' + esc(k.segmen) + '</span>' + (k.optOut ? ' <span class="chip chip-no">opt-out</span>' : '') + (k.duplikat ? ' <span class="chip chip-amber">duplikat</span>' : '') + '</div></div></div></td>' +
        '<td class="small">' + (k.email ? esc(k.email) + ' ' + (k.emailValid === 'YA' ? '✓' : '⚠') : '<span class="muted">-</span>') + '</td><td class="small"><span class="mono">' + esc(k.wa || '-') + '</span> ' + waBadge(k.statusWA) + (k.wa ? ' <a href="' + A.waUrl(k.wa) + '" target="_blank" rel="noopener" title="Chat">' + I('open_in_new') + '</a>' : '') + '</td>' +
        '<td class="small">' + esc(k.tag) + '</td><td class="small">' + (k.terakhir ? tgl(k.terakhir) : '-') + '<div class="tiny muted">' + k.jumlahPesan + ' pesan</div></td><td><button class="btn btn-ghost btn-xs" data-det="' + esc(k.id) + '">Detail</button></td></tr>').join('') + '</tbody></table></div>' : '<div class="empty">' + I('person_search') + '<p>Tidak ada kontak. Sinkron atau import CSV pelanggan.</p></div>') +
        '<div class="pager"><span>' + d.total + ' kontak · sinkron terakhir ' + (d.terakhirSync ? tgl(new Date(d.terakhirSync).toISOString()) : 'belum') + '</span><span class="row"><button class="btn btn-ghost btn-xs" data-pg="-1"' + (d.halaman > 1 ? '' : ' disabled') + '>‹</button>Hal ' + d.halaman + ' / ' + Math.max(1, Math.ceil(d.total / d.per)) + '<button class="btn btn-ghost btn-xs" data-pg="1"' + (d.halaman * d.per < d.total ? '' : ' disabled') + '>›</button></span></div>';
      t.onclick = e => { const p = e.target.closest('[data-pg]'), dt = e.target.closest('[data-det]'); if (p) { crmF.halaman += +p.dataset.pg; loadList(); } if (dt) kontakDetail(dt.dataset.det, loadAll); };
      t.onchange = e => { const s = e.target.closest('[data-sel]'), all = e.target.closest('[data-all]'); if (all) t.querySelectorAll('[data-sel]').forEach(c => { c.checked = all.checked; c.checked ? crmSel.add(c.dataset.sel) : crmSel.delete(c.dataset.sel); }); if (s) s.checked ? crmSel.add(s.dataset.sel) : crmSel.delete(s.dataset.sel); bulk(); };
      bulk();
    };
    const bulk = () => {
      const b = q('[data-bulk]'); if (!b) return;
      if (!crmSel.size) { b.innerHTML = ''; return; }
      b.innerHTML = '<div class="bulkbar"><b>' + crmSel.size + ' dipilih</b><button class="btn btn-xs" data-b="deteksiWA">' + I('verified') + 'Deteksi WA</button><button class="btn btn-xs" data-b="tag">' + I('sell') + 'Beri Tag</button><button class="btn btn-xs" data-b="blast">' + I('campaign') + 'Blast ke Terpilih</button><button class="btn btn-xs" data-b="optout">' + I('block') + 'Opt-out</button><button class="btn btn-xs" data-b="optin">Opt-in</button><button class="btn btn-xs" data-b="hapusManual">' + I('delete') + 'Hapus</button><button class="btn btn-xs" data-b="merge">' + I('merge') + 'Gabungkan</button><button class="btn btn-xs right" data-b="clear">' + I('close') + '</button></div>';
      b.querySelector('.bulkbar').onclick = async e => {
        const x = e.target.closest('[data-b]'); if (!x) return; const aksi = x.dataset.b, ids = [...crmSel];
        if (aksi === 'clear') { crmSel.clear(); return loadList(); }
        if (aksi === 'blast') { const r = await A.api('crm.export', {}); if (!r.success) return A.toast(r.message, 'err'); const pilih = r.data.filter(k => crmSel.has(k.id) && k.wa); notifTab = 'blast'; A.go('notif'); setTimeout(() => { const box = el.querySelector('[data-tb]'); if (!box) return; box.querySelector('[data-src]').value = 'manual'; box.querySelector('[data-src]').onchange(); box.querySelector('[data-man]').value = pilih.map(k => k.wa + '|' + k.nama).join('\n'); box.querySelector('[data-load]').click(); }, 120); return; }
        if (aksi === 'merge') { if (ids.length < 2) return A.toast('Pilih minimal 2 kontak', 'info'); if (!await A.confirm('Gabungkan ' + ids.length + ' kontak ke kontak pertama yang dipilih?', 'Gabungkan')) return; const r = await call('crm.merge', { utama: ids[0], gabung: ids.slice(1) }, x); if (r.success) { crmSel.clear(); loadAll(); } return; }
        let nilai = '';
        if (aksi === 'tag') { nilai = prompt('Nama tag:'); if (!nilai) return; }
        if (aksi === 'hapusManual' && !await A.confirm('Hapus ' + ids.length + ' kontak? (kontak tim tidak terhapus)', 'Hapus', true)) return;
        const r = await call('crm.bulk', { ids, aksi, nilai }, x, { label: '…' });
        if (r.success) { if (aksi === 'hapusManual') crmSel.clear(); loadAll(); }
      };
    };
    const loadAll = () => { loadStats(); loadList(); };
    loadAll();
  };
  const KONTAK_SPEC = [{ k: 'nama', t: 'Nama', req: 1 }, { k: 'wa', t: 'WhatsApp', half: 1, ph: '0812…' }, { k: 'email', t: 'Email', half: 1, type: 'email' }, { k: 'segmen', t: 'Segmen', type: 'select', half: 1, opts: ['Pelanggan', 'Calon Pelanggan', 'Reseller', 'Mitra', 'Tim Acc Cell'] }, { k: 'tag', t: 'Tag (pisahkan koma)', half: 1 }, { k: 'catatan', t: 'Catatan', type: 'textarea', rows: 2 }, { k: 'optOut', t: 'Opt-out (tidak ikut blast)', type: 'switch' }];
  function kontakForm(k, done) {
    const o = A.sheet('<form class="f">' + form(KONTAK_SPEC, k || { segmen: 'Pelanggan' }) + (k && k.sumber !== 'manual' ? '<div class="note">' + I('info') + '<div>Kontak tim: perubahan nama/WA/email ditulis ke data akun admin.</div></div>' : '') + '<div class="row"><button type="button" class="btn btn-ghost" data-x>Batal</button><button class="btn btn-ink grow" data-save>Simpan</button></div></form>', { title: k ? 'Ubah Kontak' : 'Tambah Kontak' });
    const f = o.querySelector('form');
    f.onsubmit = async e => { e.preventDefault(); const d = read(f, KONTAK_SPEC); if (k) d.id = k.id; const r = await call('crm.save', { kontak: d }, f.querySelector('[data-save]')); if (r.success) { o.close(); done && done(); } };
  }
  async function kontakDetail(id, done) {
    const d = A.sheet('<div class="skel" style="height:300px"></div>', { title: 'Detail Kontak', lg: true });
    const r = await A.api('crm.detail', { kontakId: id });
    if (!d.isConnected) return; const s = d.querySelector('.sheet');
    if (!r.success) { s.innerHTML = '<div class="note red">' + esc(r.message) + '</div>'; return; }
    const k = r.data.kontak;
    s.querySelector('.skel').outerHTML = '<div class="row"><span class="avatar-i" style="width:52px;height:52px">' + esc(String(k.nama).slice(0, 2).toUpperCase()) + '</span><div class="grow"><b style="font:700 17px var(--f-head)">' + esc(k.nama) + '</b><div class="muted small">' + esc(k.segmen) + ' · sumber ' + esc(k.sumber) + '</div></div><button class="btn btn-ghost btn-sm" data-ed>' + I('edit') + 'Ubah</button></div>' +
      '<div class="row wrap mt12">' + (k.wa ? '<a class="btn btn-wa btn-sm" href="' + A.waUrl(k.wa) + '" target="_blank" rel="noopener">' + I('chat') + esc(k.wa) + '</a><button class="btn btn-ghost btn-sm" data-cp>' + I('content_copy') + 'Salin nomor</button>' : '') + (k.email ? '<a class="btn btn-ghost btn-sm" href="mailto:' + esc(k.email) + '">' + I('mail') + esc(k.email) + '</a>' : '') + '</div>' +
      '<div class="row wrap mt12">' + waBadge(k.statusWA) + (k.tag ? k.tag.split(',').map(t => '<span class="chip chip-amber">' + esc(t.trim()) + '</span>').join('') : '') + (k.optOut ? '<span class="chip chip-no">Opt-out</span>' : '') + '<span class="chip">' + k.jumlahPesan + ' pesan</span></div>' +
      (k.catatan ? '<p class="small mt12" style="white-space:pre-line">' + esc(k.catatan) + '</p>' : '') +
      '<form class="panel f" data-int><b style="font:600 14px var(--f-body)">Catat interaksi</b><div class="row"><select class="inp" style="width:auto" name="kanal"><option>Telepon</option><option>WA Manual</option><option>Kunjungan</option><option>Catatan</option></select><input class="inp grow" name="ringkasan" placeholder="Ringkasan…" required></div><button class="btn btn-ink btn-sm" style="justify-self:start">Simpan</button></form>' +
      '<h4 class="mt16" style="font:700 15px var(--f-head);margin-bottom:10px">Timeline</h4>' + (r.data.timeline.length ? '<ul class="tl">' + r.data.timeline.map(t => '<li><b>' + esc(t.kanal) + '</b> · <span class="muted small">' + tgl(t.tanggal) + (t.oleh ? ' · ' + esc(t.oleh) : '') + (t.status ? ' · ' + esc(t.status) : '') + '</span><div>' + esc(t.ringkasan) + '</div></li>').join('') + '</ul>' : '<p class="muted small">Belum ada interaksi.</p>');
    const cp = s.querySelector('[data-cp]'); if (cp) cp.onclick = () => A.copy(k.wa, 'Nomor');
    s.querySelector('[data-ed]').onclick = () => { d.close(); kontakForm(k, done); };
    const fi = s.querySelector('[data-int]'); fi.onsubmit = async e => { e.preventDefault(); const r2 = await call('crm.interaksi', { kontakId: k.id, kanal: fi.kanal.value, ringkasan: fi.ringkasan.value }, fi.querySelector('button')); if (r2.success) { d.close(); kontakDetail(id, done); } };
  }
  function importKontak(done) {
    const o = A.sheet('<div class="f"><p class="muted small" style="margin:0">Kolom CSV: <b>nama, wa, email, segmen, tag</b>. Nomor 62/+62 otomatis jadi 08. Kontak ganda dilewati (aman diulang).</p><button class="btn btn-ghost btn-sm" style="justify-self:start" data-tpl>' + I('download') + 'Unduh template CSV</button><input type="file" accept=".csv,text/csv" data-file class="inp"><div data-pv class="small muted"></div><button class="btn btn-ink" data-go disabled>Import</button></div>', { title: 'Import Kontak Pelanggan' });
    let rows = [];
    o.querySelector('[data-tpl]').onclick = () => downloadCsv('template-kontak.csv', [['nama', 'wa', 'email', 'segmen', 'tag'], ['Budi Santoso', '081234567890', 'budi@email.com', 'Pelanggan', 'promo'], ['Siti', '6281298765432', '', 'Calon Pelanggan', 'iphone']]);
    o.querySelector('[data-file]').onchange = async e => { const txt = await e.target.files[0].text(); rows = csvObjects(txt); o.querySelector('[data-pv]').textContent = rows.length + ' baris terbaca. Contoh: ' + (rows[0] ? JSON.stringify(rows[0]) : '-'); o.querySelector('[data-go]').disabled = !rows.length; };
    o.querySelector('[data-go]').onclick = async e => { const r = await call('crm.import', { rows }, e.currentTarget, { label: 'Mengimpor…' }); if (r.success) { o.close(); done && done(); } };
  }

  /* ======================= MIGRASI ======================= */
  VIEWS.migrasi = function (m) {
    const SH = [['Produk', 'Produk', 1], ['Banner', 'Slide/Banner', 1], ['Pembayaran', 'Rekening & QRIS', 1], ['Cabang', 'Cabang', 1], ['Sosmed', 'Sosial media', 1], ['Layanan', 'Layanan', 1], ['CRM_Kontak', 'Kontak CRM', 1], ['Pengaturan', 'Pengaturan', 1], ['Statistik', 'Statistik', 0]];
    m.innerHTML = head('Migrasi Data') + '<div class="note">' + I('info') + '<div>Pindahkan data dari spreadsheet <b>app/katalog lama</b>. Sumber hanya <b>dibaca</b>. Kolom dikenali dari nama header (mis. "Nama Produk", "Harga Jual", "Lokasi"). Import ulang aman (tidak dobel) — jalankan lagi tepat sebelum pindah untuk menangkap data terbaru. Gunakan akun Google yang sama agar foto Drive lama tetap tampil.</div></div>' +
      '<div class="two"><div class="panel f"><h3 style="font:700 16px var(--f-head)">Dari spreadsheet lama</h3><div class="fld"><label>URL / ID spreadsheet lama</label><input data-src placeholder="https://docs.google.com/spreadsheets/d/…"></div>' +
      '<div class="fld"><span>Data yang diimpor</span><div class="row wrap">' + SH.map(s => '<label class="chip" style="height:32px;cursor:pointer"><input type="checkbox" data-sh="' + s[0] + '"' + (s[2] ? ' checked' : '') + '> ' + s[1] + '</label>').join('') + '</div></div>' +
      '<label class="row small"><input type="checkbox" data-timpa> Timpa data yang sudah ada (bawaan: hanya menambah yang baru)</label><div class="row"><button class="btn btn-ghost grow" data-scan>' + I('search') + 'Pindai (Dry-run)</button><button class="btn btn-ink grow" data-run>' + I('move_up') + 'Jalankan Import</button></div></div>' +
      '<div class="panel f"><h3 style="font:700 16px var(--f-head)">Import produk dari CSV</h3><p class="muted small" style="margin:0">Cocok untuk ekspor dari Excel/marketplace. Kolom minimal: <b>nama, harga</b>. Opsional: merek, kategori, ram, memori, warna, kondisi, kelengkapan, garansi, status, cabang, foto, deskripsi.</p><button class="btn btn-ghost btn-sm" style="justify-self:start" data-tpl>' + I('download') + 'Unduh template CSV</button><input type="file" accept=".csv,text/csv" class="inp" data-csv><div class="small muted" data-cpv></div><div class="row"><button class="btn btn-ghost grow" data-cscan disabled>Pindai</button><button class="btn btn-ink grow" data-crun disabled>Import CSV</button></div></div></div><div data-res></div>';
    const q = s => m.querySelector(s); let csv = [];
    const show = (r) => {
      const d = r.data, rep = d.report;
      q('[data-res]').innerHTML = '<div class="panel"><div class="panel-h"><h3>' + (d.dryRun ? 'Hasil Pindai (belum ditulis)' : 'Hasil Import') + (d.source ? ' — ' + esc(d.source.name) : '') + '</h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Data</th><th>Di app lama</th><th>Ditambah</th><th>Diperbarui</th><th>Dilewati</th></tr></thead><tbody>' + Object.keys(rep).map(k => '<tr><td><b>' + esc(k) + '</b>' + (rep[k].info ? '<div class="tiny muted">' + esc(rep[k].info) + '</div>' : '') + '</td><td>' + rep[k].source + '</td><td style="color:var(--ok);font-weight:700">' + rep[k].inserted + '</td><td>' + rep[k].updated + '</td><td class="muted">' + rep[k].skipped + '</td></tr>').join('') + '</tbody></table></div>' +
        (d.warnings && d.warnings.length ? '<div class="note amber mt12">' + I('warning') + '<ul style="margin:0;padding-left:16px">' + d.warnings.map(w => '<li>' + esc(w) + '</li>').join('') + '</ul></div>' : '') + '</div>';
    };
    const run = async (dry, btn) => {
      const sheets = [...m.querySelectorAll('[data-sh]:checked')].map(x => x.dataset.sh);
      if (!q('[data-src]').value.trim()) return A.toast('Tempel URL spreadsheet lama', 'err');
      if (!dry && !await A.confirm('Jalankan import sekarang? Data baru akan ditulis ke database.', 'Jalankan')) return;
      const r = await call('migrasi.import', { source: q('[data-src]').value.trim(), sheets, pengaturan: sheets.indexOf('Pengaturan') > -1, timpa: q('[data-timpa]').checked, dryRun: dry }, btn, { label: dry ? 'Memindai…' : 'Mengimpor…' });
      if (r.success) { show(r); if (!dry) { loadBoot(true); refreshPublic(); } }
    };
    q('[data-scan]').onclick = e => run(true, e.currentTarget); q('[data-run]').onclick = e => run(false, e.currentTarget);
    q('[data-tpl]').onclick = () => downloadCsv('template-produk.csv', [['nama', 'merek', 'kategori', 'harga', 'harga_coret', 'ram', 'memori', 'warna', 'kondisi', 'kelengkapan', 'garansi', 'status', 'cabang', 'foto', 'deskripsi'], ['Samsung Galaxy A15 6/128GB', 'Samsung', 'HP Baru', '2499000', '2699000', '6 GB', '128 GB', 'Hitam, Biru', 'Baru Segel', 'Fullset dus', 'Resmi 1 Tahun', 'Tersedia', 'Nabire', 'https://…jpg', 'Layar AMOLED 90Hz']]);
    q('[data-csv]').onchange = async e => { csv = csvObjects(await e.target.files[0].text()); q('[data-cpv]').textContent = csv.length + ' baris terbaca.'; q('[data-cscan]').disabled = q('[data-crun]').disabled = !csv.length; };
    const runCsv = async (dry, btn) => { const r = await call('migrasi.csvProduk', { rows: csv, dryRun: dry, timpa: q('[data-timpa]').checked }, btn, { label: '…' }); if (r.success) { show(r); if (!dry) { loadBoot(true); refreshPublic(); } } };
    q('[data-cscan]').onclick = e => runCsv(true, e.currentTarget); q('[data-crun]').onclick = e => runCsv(false, e.currentTarget);
  };

  /* ---------------- CSV ---------------- */
  function parseCsv(text) {
    text = String(text).replace(/^﻿/, ''); const sep = (text.split('\n')[0].match(/;/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
    const rows = [], n = text.length; let row = [], cur = '', inQ = false;
    for (let i = 0; i < n; i++) {
      const c = text[i];
      if (inQ) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += c; }
      else if (c === '"') inQ = true;
      else if (c === sep) { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some(x => x.trim() !== '')) rows.push(row); row = []; }
      else cur += c;
    }
    row.push(cur); if (row.some(x => x.trim() !== '')) rows.push(row);
    return rows;
  }
  function csvObjects(text) { const r = parseCsv(text); if (r.length < 2) return []; const h = r[0].map(x => x.trim().toLowerCase()); return r.slice(1).map(row => { const o = {}; h.forEach((k, i) => { if (k) o[k] = (row[i] || '').trim(); }); return o; }); }
  function downloadCsv(name, rows) {
    const s = '﻿' + rows.map(r => r.map(v => { v = String(v == null ? '' : v); return /[",;\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/csv;charset=utf-8' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  A.csv = { parseCsv, csvObjects };

  /* ---------------- prefetch menu superadmin saat idle (1 panggilan batch) ---------------- */
  A.on('route', n => {
    if (n !== 'admin' || !A.token || !isSA() || A._prefetched) return; A._prefetched = true;
    (window.requestIdleCallback ? f => requestIdleCallback(f, { timeout: 3000 }) : f => setTimeout(f, 1500))(() => A.api('batch', { calls: [{ action: 'crm.stats' }, { action: 'stats', data: { hari: 7 } }] }).then(r => {
      if (!r.success) return; const d = r.data;
      if (d['crm.stats'] && d['crm.stats'].success) Store.set('a:crmstats', d['crm.stats'].data);
      if (d.stats && d.stats.success) Store.set('a:stats:' + A.user.id + ':7', { t: Date.now(), data: d.stats.data });
    }));
  });
})();
