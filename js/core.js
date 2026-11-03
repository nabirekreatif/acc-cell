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
  const cabNama = c => {
    if (c === 'keduanya') return App.T ? App.T('label_semua_cabang') : 'Semua cabang';
    if (c === 'semua') return 'Semua';
    const list = (App.mode === 'admin' ? (App.admin && App.admin.branches) : (App.pub && App.pub.branches)) || [];
    const b = list.find(x => String(x.id) === String(c));
    return b ? String(b.kota || String(b.nama || c).replace(/^Cabang\s+/i, '')) : String(c || '');
  };
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
    telegram: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    x: '<path d="M4 4l16 16M20 4 4 20"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
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

  const ICON_SET = ['storefront', 'home', 'smartphone', 'build_circle', 'qr_code_scanner', 'account_balance_wallet', 'location_on', 'map', 'menu', 'apps', 'grid_view', 'category', 'shopping_bag', 'sell', 'redeem', 'local_shipping', 'restaurant', 'local_cafe', 'checkroom', 'spa', 'directions_car', 'two_wheeler', 'school', 'medical_services', 'construction', 'support_agent', 'chat', 'call', 'info', 'photo_camera', 'event', 'favorite', 'star', 'published_with_changes', 'headphones', 'new_releases', 'recycling', 'inventory_2', 'home_repair_service', 'hotel', 'pets', 'fitness_center', 'content_cut', 'local_laundry_service', 'print', 'computer', 'diamond', 'shopping_cart'];
  /* ---------------- TEKS & PENGATURAN TAMPILAN (semua bisa diubah dari dasbor) ---------------- */
  const NAV_DEF = [{ id: 'bio', label: 'Beranda', icon: 'storefront', tampil: true }, { id: 'katalog', label: 'Katalog', icon: 'smartphone', tampil: true },
    { id: 'layanan', label: 'Servis', icon: 'build_circle', tampil: true }, { id: 'bayar', label: 'Bayar', icon: 'qr_code_scanner', tampil: true },
    { id: 'lokasi', label: 'Lokasi', icon: 'location_on', tampil: false }, { id: 'menu', label: 'Menu', icon: 'menu', tampil: true }];
  const TXT_DEF = App.TXT_DEF = {
    header_tampil: 'YA', header_tampil_nama: 'YA', tombol_install: 'YA', tombol_install_teks: 'Install', tombol_cs: 'YA', tombol_cs_teks: 'CS',
    tombol_tema: 'YA', tema_bawaan: 'terang', navbawah_tampil: 'YA', navatas_tampil: 'YA', nav_items: JSON.stringify(NAV_DEF),
    menu_katalog_tampil: 'YA', menu_katalog_judul: 'Katalog Smartphone & Aksesoris', menu_katalog_ikon: 'smartphone',
    menu_bayar_tampil: 'YA', menu_bayar_judul: 'Rekening & QRIS Resmi', menu_bayar_ikon: 'account_balance_wallet', menu_bayar_chip: 'Verifikasi Toko',
    menu_layanan_tampil: 'YA', menu_layanan_judul: 'Jual HP, Tukar Tambah & Servis', menu_layanan_ikon: 'published_with_changes',
    menu_lokasi_tampil: 'TIDAK', menu_lokasi_judul: 'Lokasi Toko', menu_lokasi_sub: 'Alamat, jam buka & peta semua cabang', menu_lokasi_ikon: 'location_on',
    sosmed_judul: 'Kanal Sosial Media Resmi', cabang_judul: 'Lokasi Toko & Kontak WhatsApp', cabang_jumlah: '2', teks_chat: 'Chat', teks_maps: 'Google Maps', teks_lihat_semua: 'Lihat semua',
    lokasi_judul: 'Lokasi Toko', lokasi_sub: 'Temukan cabang terdekat, jam buka & petunjuk arah', lokasi_cari: 'Cari kota, alamat, atau nama cabang…',
    kategori_list: 'HP Baru, HP Second, Aksesoris', label_semua: 'Semua', label_semua_cabang: 'Semua cabang', kata_produk: 'produk', katalog_cari: 'Cari iPhone, Samsung, RAM…',
    label_merek: 'Merek', label_ram: 'RAM', label_memori: 'Memori', label_warna: 'Warna', label_kondisi: 'Kondisi', label_kelengkapan: 'Kelengkapan', label_garansi: 'Garansi',
    label_tersedia: 'Tersedia', label_habis: 'Habis', tombol_pesan: 'Pesan via WA', tombol_habis: 'Stok Habis', label_promo: 'Promo', label_lokasi_filter: 'Lokasi toko',
    teks_pesan_wa: 'Halo Admin {toko} {cabang}, saya tertarik dengan *{produk}* {varian}{warna} harga {harga}. Apakah masih tersedia?\n{link}',
    detail_spek_judul: 'Spesifikasi & Detail', detail_kelengkapan_judul: 'Kelengkapan Paket', detail_jaminan1: 'IMEI terdaftar Kemenperin', detail_jaminan2: 'Bisa tukar tambah', detail_tombol: 'Pesan via WhatsApp',
    katalog_trust_tampil: 'YA', katalog_trust_judul: '100% Produk Dijamin Original', katalog_trust_sub: 'Garansi resmi & klaim langsung dibantu teknisi kami',
    cta_tampil: 'YA', cta_judul: 'Butuh Tipe Lain yang Belum Terdaftar?', cta_teks: 'Admin kami dapat mengecek ketersediaan unit di gudang atau melayani Pre-Order resmi.',
    bayar_judul: 'Rekening & QRIS Resmi', bayar_sub: 'Pusat Pembayaran Sah Acc Cell Cabang Nabire & Serui', bayar_peringatan_judul: 'Perhatian Keamanan',
    bayar_konfirmasi_judul: 'Konfirmasi Bukti Transfer', bayar_konfirmasi_teks: 'Setelah transfer berhasil, kirim tangkapan layar bukti pembayaran ke admin cabang untuk verifikasi.',
    layanan_tips: 'Siapkan merek, tipe, dan kondisi HP Anda (sertakan foto) agar admin dapat memberi taksiran lebih cepat.',
    warna_aksen: '#F9B54C', warna_aksen_teks: '#0B0B0C', warna_teks: '#0B0B0C', warna_teks2: '#6E6E73', warna_latar: '#F5F5F7', warna_kartu: '#FFFFFF',
    warna_garis: '#E5E5EA', warna_harga: '#825500', warna_wa: '#25D366', warna_sosmed: '#161616', warna_header: '#FFFFFF'
  };
  const SET = () => (App.mode === 'admin' ? (App.admin && App.admin.settings) : (App.pub && App.pub.settings)) || {};
  App.T = function (k) { const v = SET()[k]; return v === undefined || v === null || String(v).trim() === '' ? (TXT_DEF[k] !== undefined ? TXT_DEF[k] : '') : String(v); };
  App.on_ = k => String(App.T(k)).toUpperCase() === 'YA';
  App.kategori = () => String(App.T('kategori_list')).split(',').map(x => x.trim()).filter(Boolean);
  App.navItems = function () { let a; try { a = JSON.parse(App.T('nav_items')); } catch (e) { a = null; } if (!Array.isArray(a) || !a.length) a = NAV_DEF; const ids = a.map(x => x.id); NAV_DEF.forEach(d => { if (ids.indexOf(d.id) < 0) a.push(Object.assign({}, d, { tampil: false })); }); return a; };
  App.ICON_SET = ICON_SET;
  const NAV_HREF = { bio: '#/', katalog: '#/katalog', layanan: '#/layanan', bayar: '#/bayar', lokasi: '#/lokasi', menu: '#' };

  /* warna tema → variabel CSS (terang) + mode gelap */
  const hex = v => /^#[0-9a-f]{6}$/i.test(String(v || '').trim()) ? String(v).trim() : '';
  function mix(h, p) { const n = parseInt(h.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; const m = c => Math.round(c + (255 - c) * p).toString(16).padStart(2, '0'); return '#' + m(r) + m(g) + m(b); }
  App.applyTheme = function () {
    const W = k => hex(App.T(k)) || TXT_DEF[k];
    const ak = W('warna_aksen');
    const css = ':root{--amber:' + ak + ';--on-amber:' + W('warna_aksen_teks') + ';--amber-soft:' + mix(ak, .86) + ';--amber-line:' + mix(ak, .55) + ';--amber-ink:' + W('warna_harga') +
      ';--ink:' + W('warna_teks') + ';--ink-2:' + W('warna_teks2') + ';--canvas:' + W('warna_latar') + ';--surface:' + W('warna_kartu') + ';--line:' + W('warna_garis') +
      ';--wa:' + W('warna_wa') + ';--sos:' + W('warna_sosmed') + ';--hdr:' + W('warna_header') + '}' +
      'html[data-theme=dark]{--amber:' + ak + ';--amber-soft:rgba(255,255,255,.07);--amber-line:' + ak + '66;--amber-ink:' + ak + ';--ink:#F2F2F7;--ink-2:#A1A1A6;--ink-3:#8E8E93;--canvas:#0E0E10;--surface:#1C1C1E;--line:#2C2C2E;--line-2:#3A3A3C;--sos:#2C2C2E;--hdr:#151517;--ok-soft:rgba(48,209,88,.16);--danger-soft:rgba(255,69,58,.16);--info-soft:rgba(10,132,255,.16)}';
    let st = document.getElementById('theme-vars'); if (!st) { st = document.createElement('style'); st.id = 'theme-vars'; document.head.appendChild(st); }
    if (st.textContent !== css) st.textContent = css;
    const m = $('meta[name=theme-color]'); if (m) m.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#151517' : ak);
  };
  /* mode gelap: pilihan pengunjung disimpan di perangkat; bawaan dari dasbor */
  App.theme = function () {
    if (App.mode === 'admin') return 'terang';
    const t = Store.get('tema', '');
    if (t && App.on_('tombol_tema')) return t;
    const d = App.T('tema_bawaan');
    return d === 'gelap' ? 'gelap' : d === 'sistem' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'gelap' : 'terang';
  };
  App.setTheme = function (t) {
    if (t) Store.set('tema', t);
    document.documentElement.dataset.theme = App.theme() === 'gelap' ? 'dark' : 'light';
    const b = $('[data-theme-toggle]'); if (b) b.innerHTML = I(App.theme() === 'gelap' ? 'light_mode' : 'dark_mode');
    App.applyTheme();
  };
  /* header & navigasi dibangun dari pengaturan */
  App.applyChrome = function () {
    const S = SET();
    const brandLogo = $('.brand img'), brandName = $('[data-brand]');
    const lg = S.header_logo_url || S.logo_url;
    if (brandLogo) brandLogo.src = lg ? img(lg, 120) : App.base + 'assets/logo.png';
    if (brandName) { brandName.textContent = App.T('header_nama') !== '' ? App.T('header_nama') : (S.nama_toko || 'Acc Cell'); if (App.mode !== 'admin') brandName.hidden = !App.on_('header_tampil_nama'); }
    if (lg) { const fi = $('link[rel=icon]'); if (fi) fi.href = img(lg, 96); }
    if (App.mode === 'admin') return;
    const top = $('.topbar'); if (top) top.hidden = !App.on_('header_tampil');
    document.body.classList.toggle('no-header', !App.on_('header_tampil'));
    const cs = $('[data-cs]'); if (cs) { cs.hidden = !App.on_('tombol_cs'); cs.innerHTML = I('chat') + esc(App.T('tombol_cs_teks')); }
    const ins = $('[data-install]'); if (ins) { ins.dataset.allowed = App.on_('tombol_install') ? '1' : '0'; const sp = ins.querySelector('span:last-child'); if (sp) sp.textContent = App.T('tombol_install_teks'); App.installBtn(App._canInstall); }
    const tt = $('[data-theme-toggle]'); if (tt) tt.hidden = !App.on_('tombol_tema');
    const items = App.navItems().filter(x => x.tampil);
    const link = (x, cls) => '<a href="' + NAV_HREF[x.id] + '"' + (x.id === 'menu' ? ' data-menu' : ' data-nav="' + x.id + '"') + (cls ? ' class="' + cls + '"' : '') + '>' + I(x.icon || 'apps') + '<span>' + esc(x.label) + '</span></a>';
    const td = $('[data-topnav]'); if (td) { td.innerHTML = items.map(x => link(x)).join(''); td.hidden = !App.on_('navatas_tampil'); }
    const bn = $('#pubnav'); if (bn) {
      const bi = items.slice(0, 5);
      bn.querySelector('.bnav-in').style.gridTemplateColumns = 'repeat(' + Math.max(1, bi.length) + ', 1fr)';
      bn.querySelector('.bnav-in').innerHTML = bi.map(x => link(x)).join('');
      bn.dataset.off = (!App.on_('navbawah_tampil') || !bi.length) ? '1' : '0';
      document.body.classList.toggle('no-bnav', bn.dataset.off === '1');
    }
    $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === (App.pages[App.cur] && App.pages[App.cur].nav || App.cur)));
  };

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
    App.setTheme(); App.applyChrome();
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
    document.body.classList.toggle('no-bnav', !!def.admin || (pn0() && pn0().dataset.off === '1'));
    const pn = $('#pubnav'); if (pn) pn.hidden = !!def.admin;
    if (changed && !def.keepScroll) App.scrollY(0);
    if (def.title) document.title = def.title(param) + ' — ' + ((App.pub && App.pub.settings && App.pub.settings.nama_toko) || 'Acc Cell');
    App.emit('route', name);
  }
  App.route = route;
  const pn0 = () => $('#pubnav');
  App.scrollY = y => { try { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, y); } };

  /* ---------------- toast / sheet / konfirmasi ---------------- */
  App.toast = function (msg, type) {
    const box = $('#toasts'), t = document.createElement('div');
    t.className = 'toast ' + (type || 'ok'); t.setAttribute('role', 'status');
    t.innerHTML = I(type === 'err' ? 'error' : type === 'info' ? 'info' : 'check_circle') + '<div>' + esc(msg) + '</div>';
    box.appendChild(t); setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, type === 'err' ? 5000 : 2600);
  };
  /* Kunci gulir halaman di belakang pop-up/menu (iOS & Android). */
  let lockN = 0, lockY = 0;
  App.lockScroll = function () {
    if (lockN++ > 0) return;
    lockY = window.scrollY;
    const b = document.body.style;
    document.documentElement.classList.add('locked');
    b.position = 'fixed'; b.top = -lockY + 'px'; b.left = '0'; b.right = '0'; b.width = '100%';
  };
  App.unlockScroll = function () {
    if (lockN === 0 || --lockN > 0) return;
    const b = document.body.style;
    document.documentElement.classList.remove('locked');
    b.position = ''; b.top = ''; b.left = ''; b.right = ''; b.width = '';
    App.scrollY(lockY);
  };
  App.sheet = function (html, opt) {
    opt = opt || {};
    const o = document.createElement('div');
    o.className = 'overlay' + (opt.center ? ' center' : ''); o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
    o.innerHTML = '<div class="sheet' + (opt.lg ? ' lg' : '') + '">' + (opt.center ? '' : '<div class="grab"></div>') +
      (opt.title ? '<div class="sheet-h"><h3>' + esc(opt.title) + '</h3><button class="icon-btn" data-x aria-label="Tutup">' + I('close') + '</button></div>' : '') + html + '</div>';
    const close = () => { if (!o.isConnected) return; o.remove(); document.removeEventListener('keydown', onKey); if (!o._unlocked) { o._unlocked = 1; App.unlockScroll(); } if (opt.onClose) opt.onClose(); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-x]')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(o);
    App.lockScroll();
    // elemen dihapus langsung (o.remove()) tetap membuka kunci gulir
    new MutationObserver((m, obs) => { if (!o.isConnected) { obs.disconnect(); if (!o._unlocked) { o._unlocked = 1; App.unlockScroll(); } } }).observe(document.body, { childList: true });
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

  /* ---------------- PWA: tombol "Install" di header (hilang otomatis bila sudah terpasang) ---------------- */
  let deferred = null;
  const PWA_KEY = 'pwa:terpasang';
  const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  App.isStandalone = isStandalone;
  function installBtn(show) { App._canInstall = !!show; const b = $('[data-install]'); if (b) b.hidden = !show || b.dataset.allowed === '0' || isStandalone() || App.mode === 'admin'; }
  App.installBtn = installBtn;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; Store.del(PWA_KEY); installBtn(true); });
  addEventListener('appinstalled', () => { deferred = null; Store.set(PWA_KEY, Date.now()); installBtn(false); App.toast('Aplikasi Acc Cell terpasang di HP Anda'); });
  App.install = async function () {
    if (deferred) {
      const d = deferred; deferred = null; d.prompt();
      try { const r = await d.userChoice; if (r && r.outcome === 'accepted') { Store.set(PWA_KEY, Date.now()); installBtn(false); } else { deferred = d; } } catch (er) { }
      return;
    }
    App.sheet('<div class="center"><img src="assets/icon-192.png" alt="" style="width:72px;height:72px;border-radius:18px;margin:0 auto 12px"><p style="margin:0 0 14px;line-height:21px">' +
      (isIOS() ? 'Di Safari: ketuk tombol <b>Bagikan</b> ' + I('ios_share') + ' lalu pilih <b>“Tambah ke Layar Utama”</b>.' : 'Buka menu browser <b>⋮</b> lalu pilih <b>“Instal aplikasi”</b> atau <b>“Tambahkan ke layar utama”</b>.') +
      '</p><button class="btn btn-ink btn-block" data-x>Mengerti</button></div>', { center: true, title: 'Pasang Aplikasi Acc Cell' });
  };
  /* Mode aplikasi terpasang: matikan zoom agar tampilan rapi seperti aplikasi asli */
  function noZoom() {
    if (!isStandalone()) return;
    document.documentElement.classList.add('standalone');
    const m = $('meta[name=viewport]'); if (m) m.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    ['gesturestart', 'gesturechange'].forEach(n => document.addEventListener(n, e => e.preventDefault(), { passive: false }));
    document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
    let last = 0; document.addEventListener('touchend', e => { const t = Date.now(); if (t - last < 300 && !e.target.closest('input,textarea,select')) e.preventDefault(); last = t; }, { passive: false });
  }
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
    const c0 = Store.get('pub', null); if (c0 && c0.data && App.mode !== 'admin') App.pub = App.pub || null;
    App.setTheme(); App.applyChrome();
    document.addEventListener('click', e => { if (e.target.closest('[data-theme-toggle]')) { App.setTheme(App.theme() === 'gelap' ? 'terang' : 'gelap'); } });
    if (window.matchMedia) { const mq = matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', () => App.setTheme()); }
    window.addEventListener('hashchange', route);
    route();
    App.loadPublic();
    App.warmUp();
    if (App.mode !== 'admin') App.track('kunjungan');
    if (Store.ss('visit') !== '1') { Store.ss('visit', '1'); }
    noZoom();
    installBtn(isIOS() && !isStandalone());           // iOS tidak punya prompt otomatis: tampilkan tombol berisi petunjuk
    if (window.matchMedia) { const mq = matchMedia('(display-mode: standalone)'); if (mq.addEventListener) mq.addEventListener('change', () => { installBtn(false); noZoom(); }); }
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
