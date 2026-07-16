/**
 * AMERTA 2026 Official Order Website — Product Catalog Configuration
 * Senior Frontend Architecture — Centralized Product Definitions
 * Future backend integration should replace or supplement this configuration.
 */

const productsList = [
  {
    id: 'buku-panduan',
    name: 'Buku Panduan AMERTA 2026',
    price: 45000,
    desc: 'Buku panduan resmi berisi seluruh regulasi, materi penugasan, dan pedoman hidup ksatria Airlangga.',
    image: 'assets/products/buku-panduan.svg'
  },
  {
    id: 'id-card',
    name: 'ID Card & Lanyard Resmi',
    price: 30000,
    desc: 'ID card identitas mahasiswa baru lengkap dengan lanyard eksklusif AMERTA UNAIR.',
    image: 'assets/products/id-card.svg'
  },
  {
    id: 'lembar-hymne',
    name: 'Lembar Hymne & Airlangga Jiwaku',
    price: 15000,
    desc: 'Cetakan resmi partitur dan lirik Hymne Airlangga serta lagu kebanggaan Airlangga Jiwaku.',
    image: 'assets/products/lembar-hymne.svg'
  },
  {
    id: 'janji-ksatria',
    name: 'Janji Ksatria Airlangga',
    price: 15000,
    desc: 'Naskah ikrar ikatan ksatria Airlangga berbahan kertas karton premium bersegel resmi.',
    image: 'assets/products/janji-ksatria.svg'
  }
];

const bundlePackage = {
  id: 'bundle-package',
  name: 'Bundle Package Lengkap AMERTA 2026',
  price: 85000, // Regular total is 105.000 (Hemat 20.000)
  originalPrice: 105000,
  savings: 20000,
  desc: 'Paket lengkap seluruh atribut AMERTA 2026 (Buku Panduan, ID Card & Lanyard, Lembar Hymne, dan Janji Ksatria) dengan harga spesial hemat Rp 20.000.',
  image: 'assets/products/bundle-package.svg',
  includes: ['buku-panduan', 'id-card', 'lembar-hymne', 'janji-ksatria']
};
