/* Acc Cell WebApp — penghubung akhir: tombol CS & Menu di header/navigasi, lalu mulai aplikasi.
 * © Nabire Kreatif — template berlisensi */
(function () {
  'use strict';
  const A = window.App;
  const cs = document.querySelector('[data-cs]');
  if (cs && cs.tagName === 'BUTTON') cs.addEventListener('click', () =>
    A.pickBranch(b => 'Halo Admin Acc Cell ' + A.cabNama(b.id) + ', saya ingin bertanya.', { title: 'Customer Service Acc Cell' }));
  document.addEventListener('click', e => { const m = e.target.closest('[data-menu]'); if (m && A.openMenu) { e.preventDefault(); A.openMenu(); } });
  A.start();
})();
