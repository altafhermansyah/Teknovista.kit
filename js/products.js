/**
 * AMERTA 2026 Official Order Website — Product Catalog Configuration
 * Senior Frontend Architecture — Centralized Product Definitions
 * Future backend integration should replace or supplement this configuration.
 */

const productsList = [
  {
    id: 'Booklet',
    name: 'Booklet AMERTA 2026',
    price: 19000,
    desc: 'Booklet AMERTA 2026 penunjang kegiatan kalian selama PKKMB Universitas Airlangga.',
    image: 'assets/products/Booklet.webp'
  },
  {
    id: 'id-card',
    name: 'ID Card',
    price: 14000,
    desc: 'ID card identitas mahasiswa baru lengkap dengan tali.',
    image: 'assets/products/id_Card1.webp'
  },
  {
    id: 'lembar-hymne',
    name: 'Lembar Hymne & Mars Universitas Airlangga',
    price: 5000,
    desc: 'Cetakan lirik Hymne & Mars Universitas Airlangga.',
    image: 'assets/products/Hymne_Unair.webp'
  }
  // {
  //   id: 'janji-ksatria',
  //   name: 'Janji Ksatria Airlangga',
  //   price: 15000,
  //   desc: 'Naskah ikrar ikatan ksatria Airlangga berbahan kertas karton premium bersegel resmi.',
  //   image: 'assets/products/janji-ksatria.svg'
  // }
];

const bundlePackage = {
  id: 'bundle-package',
  name: 'Bundle Package Lengkap AMERTA 2026',
  price: 35000, // Regular total = 35.000 (Hemat 3.000)
  originalPrice: 38000,
  savings: 3000,
  desc: 'Paket lengkap seluruh atribut AMERTA 2026 (Booklet, ID Card, Lembar Hymne & Mars Universitas Airlangga) dengan harga spesial.',
  image: 'assets/products/bundle-package.svg',
  includes: ['Booklet', 'id-card', 'lembar-hymne']
};
