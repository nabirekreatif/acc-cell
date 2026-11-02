/* ==========================================================================
 *  Acc Cell WebApp — halaman publik: Link Bio, Katalog, Detail Produk,
 *  Rekening & QRIS, Layanan, Pop-up promo.
 *  © Nabire Kreatif — template berlisensi
 * ========================================================================== */
(function () {
  'use strict';
  const A = window.App, { esc, I, rp, img, cabNama, hp08 } = A;
  const S = () => (A.pub && A.pub.settings) || {};
  const logo = () => S().logo_url ? img(S().logo_url, 300) : 'assets/logo.png';
  const ya = v => String(v).toUpperCase() === 'YA' || v === true;

  function loading(el, wide) {
    el.innerHTML = '<div class="' + (wide ? 'wide' : 'col') + '"><div class="skel" style="height:120px;width:120px;border-radius:50%;margin:12px auto"></div><div class="skel" style="height:22px;width:60%;margin:12px auto"></div><div class="skel" style="aspect-ratio:16/9;margin-top:16px;border-radius:20px"></div><div class="skel" style="height:86px;margin-top:16px"></div><div class="skel" style="height:86px;margin-top:12px"></div></div>';
  }
  function errorBox(el) {
    el.innerHTML = '<div class="col"><div class="card pad center mt24">' + I('cloud_off') + '<h3 class="mt8">Data belum bisa dimuat</h3><p class="muted">' + esc(A.pubError || '') + '</p><button class="btn btn-ink mt12" data-retry>' + I('refresh') + 'Coba lagi</button></div></div>';
    el.querySelector('[data-retry]').onclick = () => { loading(el); A.loadPublic(true); };
  }
  function ready(el, wide) { if (A.pub) return true; if (A.pubError) errorBox(el); else loading(el, wide); return false; }
  const demoNote = () => A.demo ? '<div class="note amber mt12">' + I('info') + '<div><b>Mode demo</b> — menampilkan data contoh. Hubungkan backend di <span class="mono">js/config.js</span> agar data dikelola dari dasbor.</div></div>' : '';

  /* ======================= LINK BIO ======================= */
  const socIcon = A.socIcon, sosmedList = A.sosmedList;
  // urutan acak tetap selama satu kunjungan (tidak berubah saat data diperbarui)
  const SEED = Math.floor(Math.random() * 1e9);
  function acak(arr) { let x = SEED; const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { x = (x * 1103515245 + 12345) % 2147483648; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function miniCard(p) {
    const f = (p.foto || [])[0];
    return '<a class="mcard" href="#/produk/' + encodeURIComponent(p.id) + '"><div class="mimg">' + (f ? '<img src="' + esc(img(f, 400)) + '" alt="' + esc(p.nama) + '" loading="lazy">' : '') +
      (p.harga_coret ? '<span class="chip chip-amber">Promo</span>' : '') + '</div><div class="mbody"><span class="pmeta ell">' + esc(p.merek || p.kategori) + '</span><b class="mname">' + esc(p.nama) + '</b>' +
      (p.harga_coret ? '<s class="strike">' + rp(p.harga_coret) + '</s>' : '<span class="strike"></span>') + '<span class="price">' + rp(p.harga) + '</span></div></a>';
  }

  const SECTIONS = {
    profil: () => '<div class="profile"><div class="avatar"><img src="' + esc(logo()) + '" alt="Logo ' + esc(S().nama_toko) + '" width="100" height="100"><span class="verif" title="Akun resmi">' + I('verified', 'fill') + '</span></div>' +
      '<h1>' + esc(S().nama_toko || 'Acc Cell') + '</h1>' +
      (S().tagline ? '<p>' + esc(S().tagline) + '</p>' : '') + (S().status_buka ? '<div class="status-pill">' + I('schedule') + esc(S().status_buka) + '</div>' : '') + '</div>',
    hero: () => {
      const b = A.pub.banners || []; if (!b.length) return '';
      return '<div class="hero" data-hero><div class="hero-track">' + b.map((x, i) =>
        '<a class="slide" href="' + esc(tujuan(x.tujuan_klik)) + '"' + (/^https?:/.test(x.tujuan_klik || '') ? ' target="_blank" rel="noopener"' : '') + '>' +
        '<img src="' + esc(img(x.gambar_url, 960)) + '" alt="' + esc(x.judul || 'Promo') + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '>' +
        '<div class="slide-cap">' + (x.label ? '<span class="chip">' + esc(x.label) + '</span>' : '') + (x.judul ? '<h3>' + esc(x.judul) + '</h3>' : '') + (x.subjudul ? '<p>' + esc(x.subjudul) + '</p>' : '') + '</div></a>').join('') +
        '</div>' + (b.length > 1 ? '<div class="dots">' + b.map((_, i) => '<i' + (i ? '' : ' class="on"') + '></i>').join('') + '</div>' : '') + '</div>';
    },
    promo: () => {
      if (!ya(S().pengumuman_aktif) || !S().pengumuman_judul || A.Store.ss('promoX') === '1') return '';
      return '<div class="promo"><div class="ic">' + I('redeem') + '</div><div>' + (S().pengumuman_label ? '<span class="lbl">' + esc(S().pengumuman_label) + '</span>' : '') +
        '<h3>' + esc(S().pengumuman_judul) + '</h3>' + (S().pengumuman_teks ? '<p>' + esc(S().pengumuman_teks) + '</p>' : '') + '</div><button class="x" data-promo-x aria-label="Tutup promo">' + I('close') + '</button></div>';
    },
    menu: () => '<div class="tiles">' +
      '<a class="tile main" href="#/katalog"><span class="ic">' + I('smartphone') + '</span><span class="grow"><h3>Katalog Smartphone &amp; Aksesoris</h3><p>' + esc(S().menu_katalog_sub || '') + '</p></span><span class="go">' + I('arrow_forward') + '</span></a>' +
      '<a class="tile" href="#/bayar"><span class="ic">' + I('account_balance_wallet') + '</span><span class="grow"><h3>Rekening &amp; QRIS Resmi <span class="chip chip-ok" style="vertical-align:2px">' + I('verified_user') + 'Verifikasi Toko</span></h3><p>' + esc(S().menu_bayar_sub || '') + '</p></span><span class="go">' + I('arrow_forward') + '</span></a>' +
      '<a class="tile" href="#/layanan"><span class="ic">' + I('published_with_changes') + '</span><span class="grow"><h3>Jual HP, Tukar Tambah &amp; Servis</h3><p>' + esc(S().menu_layanan_sub || '') + '</p></span><span class="go">' + I('arrow_forward') + '</span></a></div>',
    produk: () => {
      const all = (A.pub.products || []).filter(p => p.status !== 'Habis');
      if (!all.length) return '';
      const n = Math.min(20, Math.max(4, Number(S().produk_jumlah) || 10));
      return '<div class="sec-head"><h2 class="sec-title">' + esc(S().produk_judul || 'Produk Pilihan') + '</h2><a class="see-all" href="#/katalog">Lihat semua' + I('arrow_forward') + '</a></div>' +
        '<div class="pslide-wrap"><button class="pnav prev" data-pnav="-1" aria-label="Sebelumnya">' + I('chevron_left') + '</button><div class="pslider" data-pslider>' + acak(all).slice(0, n).map(miniCard).join('') + '</div><button class="pnav next" data-pnav="1" aria-label="Berikutnya">' + I('chevron_right') + '</button></div>';
    },
    sosmed: () => {
      const s = A.pub.socials || []; if (!s.length) return '';
      const gaya = S().sosmed_gaya === 'bulat' ? 'bulat' : 'tombol';
      return '<div class="soc-wrap ' + gaya + '"><h4>Kanal Sosial Media Resmi</h4><div class="' + (gaya === 'bulat' ? 'socs-r' : 'socs-b') + '">' + sosmedList(s, gaya) + '</div></div>';
    },
    cabang: () => {
      const b = A.branches(); if (!b.length) return '';
      return '<div class="sec-head"><h2 class="sec-title">Lokasi Toko &amp; Kontak WhatsApp</h2></div>' + b.map(x =>
        '<div class="card branch"><div class="top"><span class="ic">' + I('storefront') + '</span><div class="grow"><h3>' + esc(x.nama) + '</h3><p>' + esc(x.alamat || '') + '</p>' + (x.jam_buka ? '<p>Buka: ' + esc(x.jam_buka) + '</p>' : '') + '</div></div>' +
        (x.embed_maps ? '<div class="map-mini" data-map="' + esc(x.embed_maps) + '"></div>' : '') +
        '<div class="acts"><button class="btn btn-wa btn-sm" data-wa="' + esc(x.id) + '">' + I('chat', 'fill') + 'Chat ' + esc(cabNama(x.id)) + '</button>' +
        '<a class="btn btn-soft btn-sm" href="' + esc(x.link_maps || ('https://maps.google.com/?q=' + encodeURIComponent(x.alamat || x.nama))) + '" target="_blank" rel="noopener">' + I('near_me') + 'Google Maps</a></div></div>').join('');
    }
  };
  function tujuan(t) { t = String(t || ''); if (/^https?:/.test(t)) return t; if (t === 'katalog') return '#/katalog'; if (t === 'pembayaran' || t === 'bayar') return '#/bayar'; if (t === 'layanan') return '#/layanan'; return '#/katalog'; }
  function footer() {
    return '<footer class="foot">' + (S().jaminan ? '<div class="jam"><i></i>' + esc(S().jaminan) + '<i></i></div>' : '') +
      '<div>' + esc(S().teks_footer || '') + '</div></footer>';
  }

  let heroTimer = null;
  A.page('bio', {
    nav: 'bio', title: () => 'Link Bio Resmi',
    render(el) {
      if (!ready(el)) return;
      const secs = (A.pub.sections || []).filter(s => s.tampil !== false);
      el.innerHTML = '<div class="col">' + demoNote() + secs.map(s => SECTIONS[s.id] ? SECTIONS[s.id]() : '').join('') + footer() + '</div>';
      bindBio(el);
      maybePopup();
    }
  });
  function bindBio(el) {
    const x = el.querySelector('[data-promo-x]'); if (x) x.onclick = () => { A.Store.ss('promoX', '1'); x.closest('.promo').remove(); };
    el.querySelectorAll('[data-wa]').forEach(b => b.onclick = () => A.openWa(b.dataset.wa, 'Halo Admin Acc Cell ' + cabNama(b.dataset.wa) + ', saya ingin bertanya.', { p: '' }));
    el.querySelectorAll('[data-wa-any]').forEach(b => b.onclick = e => { e.preventDefault(); A.pickBranch(br => 'Halo Admin Acc Cell ' + cabNama(br.id) + ', saya ingin bertanya.'); });
    el.querySelectorAll('[data-soc]').forEach(b => b.addEventListener('click', () => A.track('klik_sosmed', b.dataset.soc)));
    // peta mini dimuat saat terlihat
    const maps = el.querySelectorAll('[data-map]');
    if (maps.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const m = e.target; m.innerHTML = '<iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Peta lokasi" src="' + esc(m.dataset.map) + '"></iframe>'; io.unobserve(m); } }), { rootMargin: '200px' });
      maps.forEach(m => io.observe(m));
    }
    const ps = el.querySelector('[data-pslider]');
    if (ps) el.querySelectorAll('[data-pnav]').forEach(b => b.onclick = () => ps.scrollBy({ left: +b.dataset.pnav * ps.clientWidth * 0.8, behavior: 'smooth' }));
    // slider otomatis
    clearInterval(heroTimer);
    const hero = el.querySelector('[data-hero]'); if (!hero) return;
    const track = hero.querySelector('.hero-track'), dots = hero.querySelectorAll('.dots i'), n = track.children.length;
    let paused = false;
    const idx = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    track.addEventListener('scroll', A.debounce(() => dots.forEach((d, i) => d.classList.toggle('on', i === idx())), 60), { passive: true });
    ['touchstart', 'pointerdown', 'mouseenter'].forEach(e => track.addEventListener(e, () => { paused = true; }, { passive: true }));
    ['touchend', 'mouseleave'].forEach(e => track.addEventListener(e, () => setTimeout(() => { paused = false; }, 3000), { passive: true }));
    if (n > 1) heroTimer = setInterval(() => { if (paused || document.hidden || A.cur !== 'bio') return; const i = (idx() + 1) % n; track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' }); }, 4200);
  }

  /* ---------- Pop-up promo ---------- */
  let popupShown = false;
  function maybePopup() {
    const s = S();
    if (popupShown || !ya(s.popup_aktif) || A.cur !== 'bio') return;
    if (s.popup_frekuensi !== 'setiap_buka' && A.Store.ss('popup:' + hashP(s)) === '1') return;
    popupShown = true;
    const gambar = s.popup_gambar || ((A.pub.banners || [])[0] || {}).gambar_url;
    setTimeout(() => {
      if (A.cur !== 'bio') { popupShown = false; return; }
      const o = A.sheet((gambar ? '<img class="popup-img" src="' + esc(img(gambar, 800)) + '" alt="">' : '') +
        '<h3 style="font:800 20px/26px var(--f-head);margin-top:14px">' + esc(s.popup_judul || 'Promo') + '</h3>' + (s.popup_teks ? '<p class="muted" style="margin:6px 0 0;line-height:20px">' + esc(s.popup_teks) + '</p>' : '') +
        '<div class="row mt16"><button class="btn btn-ghost" data-x>Nanti saja</button><a class="btn btn-amber grow" data-go href="' + esc(tujuan(s.popup_tombol_tujuan)) + '"' + (/^https?:/.test(s.popup_tombol_tujuan || '') ? ' target="_blank" rel="noopener"' : '') + '>' + esc(s.popup_tombol_teks || 'Lihat') + I('arrow_forward') + '</a></div>',
        { center: true, onClose: () => A.Store.ss('popup:' + hashP(s), '1') });
      o.querySelector('[data-go]').addEventListener('click', () => { A.Store.ss('popup:' + hashP(s), '1'); o.remove(); });
      o.querySelector('.sheet').insertAdjacentHTML('afterbegin', '<button class="icon-btn popup-x" data-x aria-label="Tutup">' + I('close') + '</button>');
    }, 700);
  }
  const hashP = s => A.hashStr([s.popup_judul, s.popup_gambar, s.popup_teks].join('|'));

  /* ======================= KATALOG ======================= */
  const K = A.kat = { q: '', cab: '', kat: '', sort: '', hideSold: false, n: 12, scroll: 0 };
  const PER = 12;
  const SORTS = [['', 'Rekomendasi'], ['murah', 'Harga terendah'], ['mahal', 'Harga tertinggi'], ['baru', 'Terbaru']];
  const CAT_LABEL = { '': 'Semua', 'HP Baru': 'HP Baru', 'HP Second': 'HP Second', 'Aksesoris': 'Aksesoris' };
  function filtered(f) {
    f = f || K; const q = f.q.trim().toLowerCase();
    const list = (A.pub.products || []).filter(p => {
      if (f.kat && p.kategori !== f.kat) return false;
      if (f.cab && p.cabang !== f.cab && p.cabang !== 'keduanya') return false;
      if (f.hideSold && p.status === 'Habis') return false;
      if (q && (p.nama + ' ' + p.merek + ' ' + p.ram + ' ' + p.memori + ' ' + p.kondisi + ' ' + p.kategori).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    const sold = (a, b) => (a.status === 'Habis') - (b.status === 'Habis');
    if (f.sort === 'murah') list.sort((a, b) => sold(a, b) || a.harga - b.harga);
    else if (f.sort === 'mahal') list.sort((a, b) => sold(a, b) || b.harga - a.harga);
    else if (f.sort === 'baru') list.sort((a, b) => sold(a, b) || String(b.dibuat).localeCompare(String(a.dibuat)));
    else list.sort(sold);
    return list;
  }
  const activeCount = () => (K.cab ? 1 : 0) + (K.sort ? 1 : 0) + (K.hideSold ? 1 : 0);
  function card(p) {
    const sold = p.status === 'Habis', foto = (p.foto || [])[0];
    return '<article class="pcard' + (sold ? ' sold' : '') + '" data-p="' + esc(p.id) + '" tabindex="0" aria-label="' + esc(p.nama) + '">' +
      '<div class="pimg">' + (foto ? '<img src="' + esc(img(foto, 500)) + '" alt="' + esc(p.nama) + '" loading="lazy" decoding="async">' : '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#c7c7cc">' + I('smartphone') + '</div>') +
      '<span class="chip c-tl">' + I(p.cabang === 'keduanya' ? 'domain' : 'location_on') + (p.cabang === 'keduanya' ? 'Keduanya' : cabNama(p.cabang)) + '</span>' +
      '<span class="chip c-br ' + (sold ? 'chip-no' : 'chip-ok') + '">' + (sold ? I('block') + 'Habis' : 'Tersedia') + '</span></div>' +
      '<div class="pbody"><div class="pmeta ell">' + esc([p.merek, p.kondisi].filter(Boolean).join(' • ')) + '</div><h3 class="pname">' + esc(p.nama) + '</h3>' +
      (p.garansi ? '<span class="chip">' + esc(p.garansi) + '</span>' : '') + '<div class="spacer"></div>' +
      '<div class="strike">' + (p.harga_coret ? rp(p.harga_coret) : '') + '</div><div class="price">' + rp(p.harga) + '</div>' +
      (sold ? '<button class="btn btn-soft" data-ask="' + esc(p.id) + '">' + I('inventory_2') + 'Stok Habis</button>' : '<button class="btn btn-wa" data-order="' + esc(p.id) + '">' + I('chat', 'fill') + 'Pesan via WA</button>') +
      '</div></article>';
  }
  A.page('katalog', {
    nav: 'katalog', title: () => 'Katalog Produk', keepScroll: true,
    render(el, param, rerender, changed) {
      if (!ready(el, true)) return;
      if (!el.dataset.built || rerender) build(el);
      renderGrid(el);
      if (changed) { const y = (A._fromDetail || A.prev === 'produk') ? K.scroll : 0; A.scrollY(y); requestAnimationFrame(() => A.scrollY(y)); }
      A._fromDetail = false;
      if (changed) A.track('buka_katalog');
    }
  });
  function build(el) {
    const s = S();
    el.innerHTML = '<div class="wide">' +
      '<a class="back" href="#/">' + I('arrow_back') + 'Kembali ke Link Bio</a>' + demoNote() +
      '<h1 class="kat-title">' + esc(s.katalog_judul || 'Katalog') + '</h1><p class="muted" style="margin:0">' + esc(s.katalog_sub || '') + '</p>' +
      '<div class="kat-bar"><div class="kat-tools"><div class="search">' + I('search') + '<input type="search" placeholder="Cari iPhone, Samsung, RAM…" value="' + esc(K.q) + '" aria-label="Cari produk" data-q><button class="clr" data-clr hidden aria-label="Hapus">' + I('close') + '</button></div>' +
      '<button class="btn-filter" data-filter aria-label="Filter & urutkan">' + I('tune') + '<span>Filter</span><b class="fbadge" data-fcount hidden></b></button></div>' +
      '<div class="pills seg-pills" data-kat>' + Object.keys(CAT_LABEL).map(c => '<button class="pill" data-v="' + c + '">' + CAT_LABEL[c] + ' <span class="cnt" data-cnt="' + c + '"></span></button>').join('') + '</div></div>' +
      '<div class="kat-info"><span data-count></span><span class="row wrap" data-active></span></div>' +
      '<div class="grid" data-grid></div><div class="more" data-more></div>' +
      '<div class="card cta-card"><h3>' + I('support_agent') + 'Butuh Tipe Lain yang Belum Terdaftar?</h3><p class="muted small" style="margin:6px 0 12px">Admin kami dapat mengecek ketersediaan unit di gudang atau melayani Pre-Order resmi.</p>' +
      '<div class="row">' + A.branches().map(b => '<button class="btn btn-ghost btn-sm grow" data-cs="' + esc(b.id) + '">' + I('chat') + 'CS ' + esc(cabNama(b.id)) + '</button>').join('') + '</div></div></div>';
    el.dataset.built = '1';
    const inp = el.querySelector('[data-q]'), clr = el.querySelector('[data-clr]');
    inp.addEventListener('input', A.debounce(() => { K.q = inp.value; K.n = PER; clr.hidden = !K.q; renderGrid(el); }, 200));
    clr.onclick = () => { inp.value = ''; K.q = ''; clr.hidden = true; renderGrid(el); inp.focus(); };
    clr.hidden = !K.q;
    el.querySelector('[data-kat]').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; K.kat = b.dataset.v; K.n = PER; renderGrid(el); };
    el.querySelector('[data-filter]').onclick = () => filterSheet(el);
    el.querySelector('[data-active]').onclick = e => { const x = e.target.closest('[data-rm]'); if (!x) return; if (x.dataset.rm === 'cab') K.cab = ''; if (x.dataset.rm === 'sort') K.sort = ''; if (x.dataset.rm === 'sold') K.hideSold = false; renderGrid(el); };
    el.querySelectorAll('[data-cs]').forEach(b => b.onclick = () => A.openWa(b.dataset.cs, 'Halo Admin Acc Cell ' + cabNama(b.dataset.cs) + ', saya mencari tipe HP: '));
    el.querySelector('[data-grid]').addEventListener('click', e => {
      const o = e.target.closest('[data-order]'), a = e.target.closest('[data-ask]'), c = e.target.closest('[data-p]');
      if (o) { e.stopPropagation(); return orderProduct(prod(o.dataset.order)); }
      if (a) { e.stopPropagation(); return askProduct(prod(a.dataset.ask)); }
      if (c) openDetail(c.dataset.p);
    });
    el.querySelector('[data-grid]').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset.p) openDetail(e.target.dataset.p); });
  }
  function filterSheet(el) {
    const f = Object.assign({}, K);
    const o = A.sheet('<div class="fsheet">' +
      '<h4>Lokasi toko</h4><div class="opt-grid" data-g="cab">' + [['', 'Semua cabang'], ['nabire', 'Nabire'], ['serui', 'Serui']].map(x => '<button class="opt" data-v="' + x[0] + '">' + esc(x[1]) + '</button>').join('') + '</div>' +
      '<h4>Kategori</h4><div class="opt-grid" data-g="kat">' + Object.keys(CAT_LABEL).map(c => '<button class="opt" data-v="' + c + '">' + CAT_LABEL[c] + '</button>').join('') + '</div>' +
      '<h4>Urutkan</h4><div class="opt-grid" data-g="sort">' + SORTS.map(x => '<button class="opt" data-v="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
      '<label class="row fswitch"><span class="grow"><b>Sembunyikan stok habis</b></span><span class="switch"><input type="checkbox" data-sold' + (f.hideSold ? ' checked' : '') + '><i></i></span></label>' +
      '<div class="row mt16"><button class="btn btn-ghost" data-reset>Reset</button><button class="btn btn-ink grow" data-apply></button></div></div>', { title: 'Filter & Urutkan' });
    const sync = () => {
      o.querySelectorAll('[data-g]').forEach(g => g.querySelectorAll('.opt').forEach(b => b.classList.toggle('on', b.dataset.v === f[g.dataset.g])));
      o.querySelector('[data-apply]').textContent = 'Tampilkan ' + filtered(f).length + ' produk';
    };
    o.addEventListener('click', e => {
      const b = e.target.closest('.opt'); if (b) { f[b.closest('[data-g]').dataset.g] = b.dataset.v; sync(); }
      if (e.target.closest('[data-reset]')) { f.cab = ''; f.kat = ''; f.sort = ''; f.hideSold = false; o.querySelector('[data-sold]').checked = false; sync(); }
      if (e.target.closest('[data-apply]')) { Object.assign(K, { cab: f.cab, kat: f.kat, sort: f.sort, hideSold: f.hideSold, n: PER }); o.close(); renderGrid(el); }
    });
    o.querySelector('[data-sold]').onchange = e => { f.hideSold = e.target.checked; sync(); };
    sync();
  }
  function openDetail(id) { K.scroll = window.scrollY; A.go('produk/' + encodeURIComponent(id)); }
  function renderGrid(el) {
    const list = filtered(), grid = el.querySelector('[data-grid]'), more = el.querySelector('[data-more]');
    el.querySelectorAll('[data-kat] .pill').forEach(b => b.classList.toggle('on', b.dataset.v === K.kat));
    const all = (A.pub.products || []).filter(p => !K.cab || p.cabang === K.cab || p.cabang === 'keduanya');
    el.querySelectorAll('[data-cnt]').forEach(s => { const c = s.dataset.cnt; s.textContent = all.filter(p => !c || p.kategori === c).length; });
    const n = activeCount(), badge = el.querySelector('[data-fcount]'); badge.hidden = !n; badge.textContent = n;
    el.querySelector('[data-filter]').classList.toggle('on', !!n);
    el.querySelector('[data-count]').textContent = list.length + ' produk';
    el.querySelector('[data-active]').innerHTML = (K.cab ? '<button class="chip chip-ink" data-rm="cab">' + I('location_on') + cabNama(K.cab) + ' ' + I('close') + '</button>' : '') +
      (K.sort ? '<button class="chip chip-ink" data-rm="sort">' + SORTS.find(x => x[0] === K.sort)[1] + ' ' + I('close') + '</button>' : '') +
      (K.hideSold ? '<button class="chip chip-ink" data-rm="sold">Tanpa stok habis ' + I('close') + '</button>' : '');
    if (!list.length) { grid.innerHTML = '<div class="empty" style="grid-column:1/-1">' + I('search_off') + '<h3 class="mt8">Produk tidak ditemukan</h3><p>Coba kata kunci lain atau ubah filter.</p><button class="btn btn-ghost btn-sm" data-reset>Reset pencarian</button></div>'; more.innerHTML = ''; grid.querySelector('[data-reset]').onclick = () => { Object.assign(K, { q: '', kat: '', cab: '', sort: '', hideSold: false }); el.querySelector('[data-q]').value = ''; renderGrid(el); }; return; }
    grid.innerHTML = list.slice(0, K.n).map(card).join('');
    more.innerHTML = (list.length > K.n ? '<button class="btn btn-ghost" data-m style="min-width:240px">' + I('sync') + 'Muat Lebih Banyak</button>' : '') + '<span class="muted small">Menampilkan ' + Math.min(K.n, list.length) + ' dari ' + list.length + ' produk</span>';
    const m = more.querySelector('[data-m]'); if (m) m.onclick = () => { K.n += PER; renderGrid(el); };
  }
  /* ======================= BAGIKAN: link + QR Code (unduh & pindai) ======================= */
  A.shareSheet = function (url, judul) {
    url = url || location.href.split('#')[0];
    const toko = S().nama_toko || 'Acc Cell', title = judul || toko + ' — Link Bio Resmi';
    const txt = title + '\n' + url, enc = encodeURIComponent;
    const tujuan = [['WhatsApp', 'whatsapp', 'https://wa.me/?text=' + enc(txt)], ['Facebook', 'facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url)],
      ['Telegram', 'telegram', 'https://t.me/share/url?url=' + enc(url) + '&text=' + enc(title)], ['X', 'x', 'https://twitter.com/intent/tweet?url=' + enc(url) + '&text=' + enc(title)]];
    let qrSvg = ''; try { qrSvg = window.QR ? QR.svg(url, { ecl: 'Q' }) : ''; } catch (e) { }
    const o = A.sheet('<div class="share">' +
      '<div class="qr-card"><div class="qr-box">' + qrSvg + '<img class="qr-logo" src="' + esc(logo()) + '" alt=""></div><b>' + esc(title) + '</b><span class="muted small">Pindai dengan kamera HP untuk membuka</span></div>' +
      '<div class="link-row"><span class="si-wrap">' + A.socIcon('link') + '</span><input class="inp mono" readonly value="' + esc(url) + '" aria-label="Tautan" data-url><button class="btn btn-amber btn-sm" data-copy>' + I('content_copy') + 'Salin</button></div>' +
      '<div class="share-grid">' + tujuan.map(t => '<a class="share-btn" href="' + esc(t[2]) + '" target="_blank" rel="noopener"><span class="b ' + t[1] + '">' + A.socIcon(t[1]) + '</span>' + t[0] + '</a>').join('') + '</div>' +
      '<div class="row mt12"><button class="btn btn-ink grow" data-dl>' + I('download') + 'Unduh QR Code</button>' + (navigator.share ? '<button class="btn btn-ghost" data-native>' + I('share') + 'Lainnya</button>' : '') + '</div></div>', { title: 'Bagikan' });
    o.querySelector('[data-copy]').onclick = () => { A.copy(url, 'Tautan'); o.querySelector('[data-url]').select(); };
    o.querySelector('[data-url]').onclick = e => e.target.select();
    const nat = o.querySelector('[data-native]'); if (nat) nat.onclick = () => navigator.share({ title, text: title, url }).catch(() => { });
    o.querySelector('[data-dl]').onclick = async e => {
      const btn = e.currentTarget; btn.disabled = true;
      try {
        const qc = await QR.canvas(url, { ecl: 'Q', size: 820, logo: logo() });
        const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
        x.fillStyle = '#F5F5F7'; x.fillRect(0, 0, W, H);
        x.fillStyle = '#0B0B0C'; x.fillRect(0, 0, W, 220);
        x.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--amber').trim() || '#F9B54C';
        x.font = '800 64px "Plus Jakarta Sans", Arial, sans-serif'; x.textAlign = 'center'; x.fillText(toko, W / 2, 125);
        x.fillStyle = '#fff'; x.font = '500 32px Inter, Arial, sans-serif'; x.fillText('Link Bio Resmi · Nabire & Serui', W / 2, 180);
        x.fillStyle = '#fff'; const r = 40, bx = 110, by = 280, bw = W - 220, bh = 860;
        x.beginPath(); x.moveTo(bx + r, by); x.arcTo(bx + bw, by, bx + bw, by + bh, r); x.arcTo(bx + bw, by + bh, bx, by + bh, r); x.arcTo(bx, by + bh, bx, by, r); x.arcTo(bx, by, bx + bw, by, r); x.fill();
        const qs = 720; x.drawImage(qc, (W - qs) / 2, by + 40, qs, qs);
        x.fillStyle = '#0B0B0C'; x.font = '700 34px Inter, Arial, sans-serif'; x.fillText('Pindai untuk membuka', W / 2, by + 815);
        x.fillStyle = '#6E6E73'; x.font = '500 28px Inter, Arial, sans-serif';
        let u = url.replace(/^https?:\/\//, ''); while (x.measureText(u).width > W - 160 && u.length > 10) u = u.slice(0, -2); if (u !== url.replace(/^https?:\/\//, '')) u += '…';
        x.fillText(u, W / 2, 1230);
        const blob = await new Promise(res => c.toBlob(res, 'image/png'));
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'QR-' + toko.replace(/[^\w]+/g, '-') + '.png';
        document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
        A.toast('QR Code diunduh');
      } catch (er) { A.toast('Gagal membuat gambar QR', 'err'); }
      btn.disabled = false;
    };
  };

  /* ======================= MENU PUBLIK (tombol "Menu") ======================= */
  A.openMenu = function () {
    const go = (h, kat) => '<a class="mtile" href="' + h + '"' + (kat !== undefined ? ' data-kat-go="' + kat + '"' : '') + '>';
    const soc = (A.pub && A.pub.socials) || [];
    const o = A.sheet('<div class="menu-tiles">' +
      go('#/') + I('storefront') + '<span>Beranda</span></a>' + go('#/katalog', '') + I('smartphone') + '<span>Semua Produk</span></a>' +
      go('#/katalog', 'HP Baru') + I('new_releases') + '<span>HP Baru</span></a>' + go('#/katalog', 'HP Second') + I('recycling') + '<span>HP Second</span></a>' +
      go('#/katalog', 'Aksesoris') + I('headphones') + '<span>Aksesoris</span></a>' + go('#/bayar') + I('account_balance_wallet') + '<span>Rekening &amp; QRIS</span></a>' +
      go('#/layanan') + I('build_circle') + '<span>Servis &amp; Tukar Tambah</span></a><button class="mtile" data-m-cs>' + I('chat') + '<span>Chat Admin</span></button>' +
      '<button class="mtile" data-m-share>' + I('share') + '<span>Bagikan</span></button></div>' +
      (soc.length ? '<h4 class="mt16" style="font:600 13px var(--f-body);color:var(--ink-2);margin-bottom:10px">Sosial media resmi</h4><div class="socs-r">' + sosmedList(soc, 'bulat') + '</div>' : ''), { title: 'Menu' });
    o.addEventListener('click', e => {
      const k = e.target.closest('[data-kat-go]'); if (k) { K.kat = k.dataset.katGo; K.n = PER; const kel = document.querySelector('.page[data-page="katalog"]'); if (kel && kel.dataset.built) renderGrid(kel); }
      if (e.target.closest('a')) { o.close(); if (k && A.cur === 'katalog') A.scrollY(0); }
      if (e.target.closest('[data-m-cs]')) { o.close(); A.pickBranch(b => 'Halo Admin Acc Cell ' + cabNama(b.id) + ', saya ingin bertanya.'); }
      if (e.target.closest('[data-m-share]')) { o.close(); A.shareSheet(); }
      const w = e.target.closest('[data-wa-any]'); if (w) { e.preventDefault(); o.close(); A.pickBranch(b => 'Halo Admin Acc Cell ' + cabNama(b.id) + ', saya ingin bertanya.'); }
    });
  };
  const prod = id => (A.pub.products || []).find(p => p.id === id);
  function pesanProduk(p, warna) {
    return b => 'Halo Admin Acc Cell ' + cabNama(b.id) + ', saya tertarik dengan *' + p.nama + '*' + ([p.ram, p.memori].filter(Boolean).length ? ' (' + [p.ram, p.memori].filter(Boolean).join('/') + ')' : '') +
      (warna ? ', warna ' + warna : '') + ' harga ' + rp(p.harga) + '. Apakah masih tersedia?\n' + location.href.split('#')[0] + '#/produk/' + encodeURIComponent(p.id);
  }
  function orderProduct(p, warna) {
    if (!p) return;
    if (p.cabang === 'keduanya') A.pickBranch(pesanProduk(p, warna), { track: { p: p.id }, sub: 'Produk ini tersedia di kedua cabang. Pilih cabang terdekat:' });
    else A.openWa(p.cabang, pesanProduk(p, warna), { p: p.id });
  }
  function askProduct(p) {
    if (!p) return;
    const msg = b => 'Halo Admin Acc Cell ' + cabNama(b.id) + ', apakah ' + p.nama + ' akan restok, atau ada unit serupa?';
    if (p.cabang === 'keduanya') A.pickBranch(msg, { track: { p: p.id } }); else A.openWa(p.cabang, msg, { p: p.id });
  }

  /* ======================= DETAIL PRODUK ======================= */
  A.page('produk', {
    nav: 'katalog', title: id => { const p = A.pub && prod(id); return p ? p.nama : 'Detail Produk'; },
    render(el, id) {
      if (!ready(el, true)) return;
      const p = prod(id);
      if (!p) { el.innerHTML = '<div class="wide"><a class="back" href="#/katalog">' + I('arrow_back') + 'Kembali ke Katalog</a><div class="empty">' + I('inventory_2') + '<h3 class="mt8">Produk tidak ditemukan</h3><p>Produk mungkin sudah terjual atau dihapus.</p></div></div>'; return; }
      const sold = p.status === 'Habis', foto = (p.foto || []).length ? p.foto : [''];
      const warna = String(p.warna || '').split(',').map(x => x.trim()).filter(Boolean);
      const kel = String(p.kelengkapan || '').split(/[,;\n]+/).map(x => x.trim()).filter(Boolean);
      const spec = [['RAM & Penyimpanan', [p.ram, p.memori].filter(Boolean).join(' / ')], ['Kondisi Fisik', p.kondisi], ['Garansi', p.garansi], ['Kategori', p.kategori]].filter(x => x[1]);
      const ctaLabel = sold ? 'Tanya Restok via WhatsApp' : (p.cabang === 'keduanya' ? 'Pesan via WhatsApp (Nabire / Serui)' : 'Pesan via WhatsApp Admin ' + cabNama(p.cabang));
      el.innerHTML = '<div class="wide"><div class="row" style="justify-content:space-between"><a class="back" href="#/katalog" data-back>' + I('arrow_back') + 'Kembali ke Katalog</a><button class="icon-btn" data-share aria-label="Bagikan">' + I('share') + '</button></div>' +
        '<div class="det mt12"><div class="card gal"><div class="gal-track" data-gal>' + foto.map((f, i) => f ? '<img src="' + esc(img(f, 1000)) + '" alt="' + esc(p.nama) + ' foto ' + (i + 1) + '"' + (i ? ' loading="lazy"' : '') + '>' : '<div style="flex:0 0 100%;display:flex;align-items:center;justify-content:center;color:#c7c7cc">' + I('smartphone') + '</div>').join('') + '</div>' +
        '<span class="chip badge ' + (sold ? 'chip-no' : 'chip-ok') + '">' + (sold ? 'Stok Habis' : I('check_circle') + 'Original ' + esc(p.merek || '')) + '</span>' + (foto.length > 1 ? '<span class="cnt" data-cnt>1 / ' + foto.length + '</span>' : '') +
        (foto.length > 1 ? '<div class="thumbs">' + foto.map((f, i) => '<button data-th="' + i + '"' + (i ? '' : ' class="on"') + ' aria-label="Foto ' + (i + 1) + '"><img src="' + esc(img(f, 160)) + '" alt="" loading="lazy"></button>').join('') + '</div>' : '') + '</div>' +
        '<div><div class="card pad"><div class="row wrap"><span class="chip ' + (sold ? 'chip-no' : 'chip-ok') + '">' + I(sold ? 'block' : 'check_circle') + (sold ? 'Habis' : 'Tersedia') + ' · ' + esc(p.kategori) + '</span>' +
        '<span class="chip chip-amber">' + I('location_on') + (p.cabang === 'keduanya' ? 'Ready di Nabire & Serui' : 'Stok di Cabang ' + cabNama(p.cabang)) + '</span></div>' +
        '<h1>' + esc(p.nama) + '</h1><div class="bigprice">' + rp(p.harga) + (p.harga_coret ? '<s>' + rp(p.harga_coret) + '</s>' : '') + '</div>' +
        (p.garansi ? '<div class="guar"><span class="ic">' + I('shield') + '</span><div><b style="font:600 14px var(--f-body)">' + esc(p.garansi) + '</b><div class="muted small">Klaim garansi dibantu langsung di toko Acc Cell.</div></div></div>' : '') + '</div>' +
        (warna.length ? '<div class="card pad mt12"><b style="font:600 14px var(--f-body)">Pilihan Warna: <span style="color:var(--amber-ink)" data-wl>' + esc(warna[0]) + '</span></b><div class="colors">' + warna.map((w, i) => '<button data-w="' + esc(w) + '"' + (i ? '' : ' class="on"') + '>' + esc(w) + '</button>').join('') + '</div></div>' : '') +
        '<div class="card pad mt12"><h3 style="font:700 17px var(--f-head)">Spesifikasi &amp; Detail</h3>' + (spec.length ? '<div class="specs">' + spec.map(x => '<div class="spec"><span>' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b></div>').join('') + '</div>' : '') +
        (kel.length ? '<h4 class="mt16" style="font:600 14px var(--f-body);display:flex;gap:6px;align-items:center">' + I('inventory_2') + 'Kelengkapan Paket</h4><ul class="checks">' + kel.map(k => '<li>' + I('check_circle') + esc(k) + '</li>').join('') + '</ul>' : '') +
        (p.deskripsi ? '<p class="mt12" style="font-size:14px;line-height:21px;white-space:pre-line">' + esc(p.deskripsi) + '</p>' : '') + '</div>' +
        '<div class="card trustrow mt12"><div>' + I('verified_user') + 'IMEI terdaftar Kemenperin</div><div>' + I('swap_horizontal_circle') + 'Bisa tukar tambah</div></div>' +
        '<div class="stickybar"><div class="in"><button class="btn ' + (sold ? 'btn-ink' : 'btn-wa') + '" data-cta>' + I('chat', 'fill') + esc(ctaLabel) + '</button></div></div></div></div>' +
        '</div>';
      document.body.classList.add('has-sticky');
      let pilihWarna = warna[0] || '';
      el.querySelector('[data-back]').onclick = e => { e.preventDefault(); A._fromDetail = true; A.go('katalog'); };
      el.querySelector('[data-cta]').onclick = () => sold ? askProduct(p) : orderProduct(p, pilihWarna);
      el.querySelector('[data-share]').onclick = () => A.shareSheet(location.href.split('#')[0] + '#/produk/' + encodeURIComponent(p.id), p.nama + ' — ' + rp(p.harga));
      el.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { pilihWarna = b.dataset.w; el.querySelectorAll('[data-w]').forEach(x => x.classList.toggle('on', x === b)); el.querySelector('[data-wl]').textContent = pilihWarna; });
      const gal = el.querySelector('[data-gal]'), cnt = el.querySelector('[data-cnt]');
      gal.addEventListener('scroll', A.debounce(() => { const i = Math.round(gal.scrollLeft / gal.clientWidth); if (cnt) cnt.textContent = (i + 1) + ' / ' + foto.length; el.querySelectorAll('[data-th]').forEach(t => t.classList.toggle('on', +t.dataset.th === i)); }, 50), { passive: true });
      el.querySelectorAll('[data-th]').forEach(t => t.onclick = () => gal.scrollTo({ left: +t.dataset.th * gal.clientWidth, behavior: 'smooth' }));
      gal.addEventListener('click', e => { if (e.target.tagName === 'IMG') A.sheet('<div class="zoom"><img src="' + esc(e.target.src) + '" alt=""></div>', { center: true, lg: true }); });
      if (A.Store.ss('v:' + p.id) !== '1') { A.Store.ss('v:' + p.id, '1'); A.track('lihat_produk', p.id, p.cabang === 'keduanya' ? '' : p.cabang); }
    }
  });

  /* ======================= REKENING & QRIS ======================= */
  A.page('bayar', {
    nav: 'bayar', title: () => 'Rekening & QRIS Resmi',
    render(el, param, rr, changed) {
      if (!ready(el)) return;
      const pays = A.pub.payments || [], banks = pays.filter(p => p.jenis !== 'QRIS'), qris = pays.filter(p => p.jenis === 'QRIS');
      el.innerHTML = '<div class="col"><a class="back" href="#/">' + I('arrow_back') + 'Kembali ke Link Bio</a>' +
        '<h1 class="kat-title">Rekening &amp; QRIS Resmi</h1><p class="muted" style="margin:0">Pusat Pembayaran Sah Acc Cell Cabang Nabire &amp; Serui</p>' +
        '<div class="warnbox"><span class="ic">' + I('gpp_maybe') + '</span><div><h4>Perhatian Keamanan</h4><p>' + esc(S().catatan_pembayaran || '') + '</p></div></div>' +
        (pays.some(p => p.contoh) ? '<div class="note amber mt12">' + I('info') + '<div>Data rekening di bawah masih <b>CONTOH</b>. Superadmin dapat menggantinya di dasbor → Rekening &amp; QRIS.</div></div>' : '') +
        (banks.length ? '<div class="sec-head"><h2 class="sec-title">' + I('account_balance') + 'Transfer Bank Resmi</h2><span class="chip">' + banks.length + ' Rekening Aktif</span></div>' + banks.map(b =>
          '<div class="card bankcard"><div class="bank-top"><span class="bank-logo">' + esc(b.kode_bank || (b.nama_bank || '').slice(0, 3).toUpperCase()) + '</span><div class="grow"><b style="font:700 15px var(--f-head)">' + esc(b.nama_bank) + '</b><div class="muted small">' + esc(b.catatan || '') + '</div></div>' +
          '<span class="chip chip-ok">' + (b.cabang && b.cabang !== 'Umum' ? esc(cabNama(String(b.cabang).toLowerCase())) : 'Aktif') + '</span></div>' +
          '<div class="rek"><div class="grow"><span class="muted small">Nomor Rekening:</span><b>' + esc(b.no_rekening) + '</b></div><button class="btn btn-amber btn-sm" data-copy="' + esc(String(b.no_rekening).replace(/\D/g, '')) + '">' + I('content_copy') + 'Salin</button></div>' +
          '<div class="an"><span>Atas Nama (A/N):</span><b>' + esc(b.atas_nama) + '</b></div></div>').join('') : '') +
        qris.map(qr => '<div class="sec-head"><h2 class="sec-title">' + I('qr_code_2') + 'QRIS Resmi Toko</h2><span class="chip chip-amber">Bebas Biaya Admin</span></div>' +
          '<div class="card qris"><div class="row"><b style="font:800 16px var(--f-head)">QRIS</b><span class="muted small">Standar ASPI / BI</span><span class="chip chip-ok right">' + I('verified') + 'Resmi</span></div>' +
          '<div class="qris-box"><img src="' + esc(img(qr.gambar_qris_url, 900)) + '" alt="QRIS ' + esc(qr.atas_nama) + '" data-zoom loading="lazy"><b style="display:block;margin-top:10px;font:700 13px var(--f-body)">' + esc(qr.atas_nama || qr.nama_bank) + '</b><span class="muted small">' + esc(qr.catatan || '') + '</span></div>' +
          '<div class="ewallet">' + ['BCA Mobile', 'GoPay', 'OVO', 'DANA', 'ShopeePay', 'Livin\'', 'BRImo'].map(x => '<span class="chip">' + x + '</span>').join('') + '</div>' +
          '<a class="btn btn-soft btn-block mt12" href="' + esc(img(qr.gambar_qris_url, 1200)) + '" download="QRIS-Acc-Cell" target="_blank" rel="noopener">' + I('download') + 'Unduh Gambar QRIS</a>' +
          '<div class="steps"><b>' + I('info') + ' Cara Bayar dengan QRIS:</b><ol><li>Buka aplikasi m-Banking atau e-Wallet.</li><li>Pilih menu <b>Pindai / Scan QRIS</b>.</li><li>Arahkan kamera ke layar atau unggah gambar QRIS yang diunduh.</li><li>Pastikan nama merchant tertera: <b>' + esc(qr.atas_nama || '') + '</b>.</li><li>Masukkan nominal sesuai total transaksi &amp; selesaikan pembayaran.</li></ol></div></div>').join('') +
        '<div class="sec-head"><h2 class="sec-title">' + I('mark_chat_read') + 'Konfirmasi Bukti Transfer</h2></div><p class="muted small" style="margin:-4px 2px 4px">Setelah transfer berhasil, kirim tangkapan layar bukti pembayaran ke admin cabang untuk verifikasi.</p>' +
        A.branches().map(b => '<button class="confirm" data-konf="' + esc(b.id) + '"><span class="grow"><b>Konfirmasi ke Admin ' + esc(cabNama(b.id)) + '</b><span>' + esc(hp08(b.nomor_wa)) + ' · ' + esc(b.jam_buka || '') + '</span></span>' + I('arrow_forward') + '</button>').join('') +
        '</div>';
      el.querySelectorAll('[data-copy]').forEach(b => b.onclick = () => A.copy(b.dataset.copy, 'Nomor rekening'));
      el.querySelectorAll('[data-konf]').forEach(b => b.onclick = () => A.openWa(b.dataset.konf, 'Halo Admin Acc Cell ' + cabNama(b.dataset.konf) + ', saya ingin konfirmasi pembayaran. Bukti transfer saya lampirkan.'));
      el.querySelectorAll('[data-zoom]').forEach(i => i.onclick = () => A.sheet('<div class="zoom"><img src="' + esc(i.src) + '" alt="QRIS"></div><p class="center muted small mt8">Pindai langsung dari layar ini</p>', { center: true }));
      if (changed) A.track('buka_pembayaran');
    }
  });

  /* ======================= LAYANAN ======================= */
  A.page('layanan', {
    nav: 'layanan', title: () => 'Jual HP, Tukar Tambah & Servis',
    render(el, param, rr, changed) {
      if (!ready(el)) return;
      const svc = A.pub.services || [];
      el.innerHTML = '<div class="col"><a class="back" href="#/">' + I('arrow_back') + 'Kembali ke Link Bio</a>' +
        '<h1 class="kat-title">' + esc(S().layanan_judul || 'Layanan') + '</h1><p class="muted" style="margin:0">' + esc(S().layanan_sub || '') + '</p>' +
        svc.map(s => '<div class="card svc"><span class="ic">' + I(s.ikon || 'build_circle') + '</span><h3>' + esc(s.judul) + '</h3><p>' + esc(s.deskripsi) + '</p>' +
          '<div class="acts">' + A.branches().map(b => '<button class="btn btn-wa btn-sm" data-svc="' + esc(s.id) + '" data-b="' + esc(b.id) + '">' + I('chat', 'fill') + esc(cabNama(b.id)) + '</button>').join('') + '</div></div>').join('') +
        '<div class="note mt16">' + I('lightbulb') + '<div>Siapkan merek, tipe, dan kondisi HP Anda (sertakan foto) agar admin dapat memberi taksiran lebih cepat.</div></div>' +
        '</div>';
      el.querySelectorAll('[data-svc]').forEach(b => b.onclick = () => {
        const s = svc.find(x => x.id === b.dataset.svc);
        A.openWa(b.dataset.b, br => String(s.template_wa || ('Halo Admin Acc Cell {cabang}, saya ingin ' + s.judul)).replace(/\{cabang\}/g, cabNama(br.id)));
      });
      if (changed) A.track('buka_layanan');
    }
  });
})();
