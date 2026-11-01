/* Acc Cell WebApp — penghubung akhir: tombol CS di header lalu mulai aplikasi.
 * © Nabire Kreatif — template berlisensi */
(function () {
  'use strict';
  const A = window.App;
  document.querySelector('[data-cs]').addEventListener('click', () =>
    A.pickBranch(b => 'Halo Admin Acc Cell ' + A.cabNama(b.id) + ', saya ingin bertanya.', { title: 'Customer Service Acc Cell' }));
  A.start();
})();
