'use strict';
document.documentElement.classList.add('js');

/* ===== PENGATURAN TOKO (edit bagian ini) ===== */
const CONFIG = { waNumber: '6283150364042', voucherCode: 'PASARIN10', voucherPercent: 10 };

/* Produk: ubah, tambah, atau hapus. Untuk foto asli, taruh file di folder "img"
   lalu isi photo, contoh: photo: 'img/kaos.jpg' (kosong = pakai gambar ilustrasi) */
const PRODUCTS = [
  { id: 1, name: 'Kaos Polos Premium', cat: 'Fashion', price: 89000, old: 129000, stock: 20, rating: 4.8, sold: 320, emoji: '👕', color: ['#EDE9FE', '#C4B5FD'], flash: true, photo: '', desc: 'Kaos katun combed 30s, adem, jahitan rapi, dan tidak mudah melar.' },
  { id: 2, name: 'Tote Bag Kanvas', cat: 'Fashion', price: 65000, old: 85000, stock: 15, rating: 4.7, sold: 210, emoji: '👜', color: ['#FFE4E6', '#FDA4AF'], flash: false, photo: '', desc: 'Tas kanvas tebal dengan resleting dan kantong dalam.' },
  { id: 3, name: 'Topi Baseball', cat: 'Fashion', price: 55000, old: 75000, stock: 12, rating: 4.6, sold: 150, emoji: '🧢', color: ['#E0F2FE', '#7DD3FC'], flash: false, photo: '', desc: 'Topi polos dengan strap belakang yang bisa diatur.' },
  { id: 4, name: 'Earphone Bluetooth', cat: 'Gadget', price: 149000, old: 229000, stock: 8, rating: 4.9, sold: 540, emoji: '🎧', color: ['#FEF3C7', '#FCD34D'], flash: true, photo: '', desc: 'Baterai tahan 20 jam, koneksi stabil, dilengkapi mikrofon.' },
  { id: 5, name: 'Power Bank 10.000 mAh', cat: 'Gadget', price: 159000, old: 199000, stock: 10, rating: 4.8, sold: 410, emoji: '🔋', color: ['#DCFCE7', '#86EFAC'], flash: true, photo: '', desc: 'Dua port output, ringkas, cocok dibawa bepergian.' },
  { id: 6, name: 'Kabel Data Type-C', cat: 'Gadget', price: 35000, old: 49000, stock: 30, rating: 4.5, sold: 780, emoji: '🔌', color: ['#F1F5F9', '#CBD5E1'], flash: false, photo: '', desc: 'Kabel 1 meter, mendukung fast charging.' },
  { id: 7, name: 'Madu Hutan 250 ml', cat: 'Makanan', price: 75000, old: 95000, stock: 18, rating: 4.9, sold: 265, emoji: '🍯', color: ['#FEF3C7', '#FBBF24'], flash: true, photo: '', desc: 'Madu murni tanpa campuran gula, kemasan botol kaca.' },
  { id: 8, name: 'Keripik Singkong Pedas', cat: 'Makanan', price: 22000, old: 28000, stock: 40, rating: 4.7, sold: 890, emoji: '🍟', color: ['#FFEDD5', '#FDBA74'], flash: false, photo: '', desc: 'Renyah, gurih, dan pedasnya pas. Kemasan 200 gram.' }
];
const CAT_ICON = { Fashion: '👗', Gadget: '📱', Makanan: '🍜' };
const FAQ = [
  ['Bagaimana cara memesan?', 'Masukkan produk ke keranjang, isi nama dan alamat, lalu klik "Pesan lewat WhatsApp". Pesan sudah terisi otomatis, tinggal kirim ke penjual.'],
  ['Bagaimana cara membayar?', 'Penjual mengirim detail pembayaran (transfer bank, QRIS, atau e-wallet) setelah pesananmu dikonfirmasi.'],
  ['Berapa ongkos kirimnya?', 'Ongkir dihitung penjual sesuai alamatmu dan dikonfirmasi lewat WhatsApp sebelum kamu membayar.'],
  ['Apakah keranjang saya tersimpan?', 'Ya, keranjang dan wishlist tersimpan di browser perangkatmu, tidak dikirim ke server mana pun.']
];

/* ===== UTILITAS ===== */
const $ = (s) => document.querySelector(s);
const rupiah = (n) => 'Rp ' + n.toLocaleString('id-ID');
const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { t.hidden = true; }, 2200);
}
function readList(key, valid) {
  try {
    const d = JSON.parse(localStorage.getItem(key));
    return Array.isArray(d) ? d.filter(valid) : [];
  } catch (e) { return []; }
}
function write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* abaikan */ } }

/* ===== STATE ===== */
let category = 'Semua', query = '', sortBy = 'baru', voucherOn = false;
let cart = readList('pasarin_cart', (i) => i && getProduct(i.id) && Number.isInteger(i.qty) && i.qty > 0);
let wish = readList('pasarin_wish', (id) => getProduct(id));

/* ===== TAMPILAN PRODUK ===== */
function art(p) {
  const a = el('span', 'art');
  a.style.background = 'linear-gradient(145deg,' + p.color[0] + ',' + p.color[1] + ')';
  if (p.photo) {
    const img = el('img');
    img.src = p.photo; img.alt = p.name; img.loading = 'lazy';
    img.addEventListener('error', () => { img.remove(); a.appendChild(el('span', 'emo', p.emoji)); });
    a.appendChild(img);
  } else {
    a.appendChild(el('span', 'emo', p.emoji));
  }
  return a;
}

function toggleWish(id) {
  wish = wish.includes(id) ? wish.filter((w) => w !== id) : [...wish, id];
  write('pasarin_wish', wish);
  toast(wish.includes(id) ? 'Disimpan ke wishlist' : 'Dihapus dari wishlist');
}

function card(p, i) {
  const c = el('article', 'card');
  c.style.animationDelay = (i * 60) + 'ms';
  const pic = el('div', 'pic');
  const th = el('button', 'thumb');
  th.type = 'button';
  th.setAttribute('aria-label', 'Lihat detail ' + p.name);
  th.appendChild(art(p));
  th.addEventListener('click', () => openDetail(p.id));
  pic.appendChild(th);
  if (p.old > p.price) pic.appendChild(el('span', 'tag', '-' + Math.round((1 - p.price / p.old) * 100) + '%'));
  const h = el('button', 'heart', '♥');
  h.type = 'button';
  h.setAttribute('aria-label', 'Simpan ' + p.name + ' ke wishlist');
  h.setAttribute('aria-pressed', String(wish.includes(p.id)));
  h.addEventListener('click', () => { toggleWish(p.id); h.setAttribute('aria-pressed', String(wish.includes(p.id))); });
  pic.appendChild(h);
  const body = el('div', 'card-body');
  const name = el('button', 'card-name', p.name);
  name.type = 'button';
  name.addEventListener('click', () => openDetail(p.id));
  const price = el('div', 'price');
  price.appendChild(el('span', 'card-price', rupiah(p.price)));
  if (p.old > p.price) price.appendChild(el('s', 'old', rupiah(p.old)));
  const add = el('button', 'btn btn-primary', p.stock > 0 ? 'Tambah ke keranjang' : 'Stok habis');
  add.type = 'button';
  add.disabled = p.stock < 1;
  add.addEventListener('click', () => addToCart(p.id));
  body.append(name, el('span', 'card-meta', '★ ' + p.rating.toFixed(1) + ' · Terjual ' + p.sold), price, el('span', 'card-stock', 'Stok: ' + p.stock), add);
  c.append(pic, body);
  return c;
}

function renderCats() {
  const box = $('#cats');
  box.replaceChildren();
  Object.keys(CAT_ICON).forEach((c) => {
    const b = el('button', 'cat');
    b.type = 'button';
    b.append(el('span', '', CAT_ICON[c]), document.createTextNode(c));
    b.addEventListener('click', () => { category = c; renderFilters(); renderGrid(); $('#katalog').scrollIntoView({ behavior: 'smooth' }); });
    box.appendChild(b);
  });
}

function renderFilters() {
  const box = $('#filters');
  box.replaceChildren();
  ['Semua', ...Object.keys(CAT_ICON)].forEach((c) => {
    const b = el('button', 'chip', c);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(c === category));
    b.addEventListener('click', () => { category = c; renderFilters(); renderGrid(); });
    box.appendChild(b);
  });
}

function renderGrid() {
  const grid = $('#grid');
  grid.replaceChildren();
  const q = query.trim().toLowerCase();
  const sorters = { murah: (a, b) => a.price - b.price, mahal: (a, b) => b.price - a.price, laris: (a, b) => b.sold - a.sold, rating: (a, b) => b.rating - a.rating, baru: (a, b) => a.id - b.id };
  const list = PRODUCTS.filter((p) => (category === 'Semua' || p.cat === category) && p.name.toLowerCase().includes(q)).sort(sorters[sortBy]);
  $('#empty').hidden = list.length > 0;
  list.forEach((p, i) => grid.appendChild(card(p, i)));
}

function renderFlash() {
  const box = $('#flash-grid');
  PRODUCTS.filter((p) => p.flash).forEach((p, i) => box.appendChild(card(p, i)));
}

function openDetail(id) {
  const p = getProduct(id), d = $('#detail');
  d.replaceChildren();
  const body = el('div', 'detail-body');
  const price = el('div', 'price');
  price.appendChild(el('span', 'card-price', rupiah(p.price)));
  if (p.old > p.price) price.appendChild(el('s', 'old', rupiah(p.old)));
  const add = el('button', 'btn btn-primary full', 'Tambah ke keranjang');
  add.type = 'button';
  add.disabled = p.stock < 1;
  add.addEventListener('click', () => { addToCart(p.id); d.close(); });
  const buy = el('button', 'btn btn-ghost full', 'Beli sekarang');
  buy.type = 'button';
  buy.disabled = p.stock < 1;
  buy.addEventListener('click', () => { addToCart(p.id); d.close(); setDrawer(true); });
  const close = el('button', 'btn btn-link', 'Tutup');
  close.type = 'button';
  close.addEventListener('click', () => d.close());
  body.append(el('h3', '', p.name), el('span', 'card-meta', p.cat + ' · ★ ' + p.rating.toFixed(1) + ' · Terjual ' + p.sold + ' · Stok ' + p.stock), price, el('p', '', p.desc), add, buy, close);
  d.append(art(p), body);
  d.showModal();
}

/* ===== KERANJANG ===== */
function addToCart(id) {
  const p = getProduct(id), item = cart.find((i) => i.id === id);
  if (item) {
    if (item.qty >= p.stock) { toast('Stok ' + p.name + ' hanya ' + p.stock); return; }
    item.qty += 1;
  } else { cart.push({ id, qty: 1 }); }
  write('pasarin_cart', cart);
  renderCart();
  const b = $('#cart-count');
  b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  toast(p.name + ' masuk keranjang');
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.min(item.qty + delta, getProduct(id).stock);
  if (item.qty < 1) cart = cart.filter((i) => i.id !== id);
  write('pasarin_cart', cart);
  renderCart();
}

function totals() {
  const sub = cart.reduce((s, i) => s + getProduct(i.id).price * i.qty, 0);
  const disc = voucherOn ? Math.round(sub * CONFIG.voucherPercent / 100) : 0;
  return { sub, disc, total: sub - disc };
}

function renderCart() {
  const box = $('#cart-items');
  box.replaceChildren();
  if (!cart.length) box.appendChild(el('p', 'muted', 'Keranjang masih kosong. Pilih produk dari katalog.'));
  cart.forEach((i) => {
    const p = getProduct(i.id), row = el('div', 'line');
    const emo = el('div', 'line-emoji', p.emoji);
    emo.style.background = p.color[0];
    const info = el('div');
    info.append(el('div', 'line-name', p.name), el('div', 'line-price', rupiah(p.price)));
    const qty = el('div', 'qty'), minus = el('button', '', '-'), plus = el('button', '', '+');
    minus.type = plus.type = 'button';
    minus.setAttribute('aria-label', 'Kurangi ' + p.name);
    plus.setAttribute('aria-label', 'Tambah ' + p.name);
    minus.addEventListener('click', () => changeQty(i.id, -1));
    plus.addEventListener('click', () => changeQty(i.id, 1));
    qty.append(minus, el('span', '', String(i.qty)), plus);
    row.append(emo, info, qty);
    box.appendChild(row);
  });
  const t = totals();
  $('#sum-sub').textContent = rupiah(t.sub);
  $('#sum-disc').textContent = '- ' + rupiah(t.disc);
  $('#sum-total').textContent = rupiah(t.total);
  $('#cart-count').textContent = String(cart.reduce((s, i) => s + i.qty, 0));
  $('#checkout').disabled = cart.length === 0;
}

function setDrawer(open) {
  $('#drawer').classList.toggle('open', open);
  $('#drawer').setAttribute('aria-hidden', String(!open));
  $('#overlay').hidden = !open;
  if (open) $('#cart-close').focus();
}

function applyVoucher() {
  const code = $('#voucher').value.trim().toUpperCase(), msg = $('#voucher-msg');
  voucherOn = code === CONFIG.voucherCode;
  msg.textContent = voucherOn ? 'Voucher dipakai: diskon ' + CONFIG.voucherPercent + '%.' : (code ? 'Kode voucher tidak valid.' : 'Masukkan kode voucher.');
  renderCart();
}

function openWhatsApp(text) {
  window.open('https://wa.me/' + CONFIG.waNumber + '?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
}

function checkout() {
  if (!cart.length) return;
  const name = $('#buyer-name').value.trim(), addr = $('#buyer-addr').value.trim();
  if (!name || !addr) { $('#buyer-err').textContent = 'Isi nama penerima dan alamat pengiriman.'; return; }
  $('#buyer-err').textContent = '';
  const t = totals();
  const lines = cart.map((i, n) => { const p = getProduct(i.id); return (n + 1) + '. ' + p.name + ' x' + i.qty + ' = ' + rupiah(p.price * i.qty); });
  let text = 'Halo Pasarin, saya mau pesan:\n' + lines.join('\n') + '\n\nSubtotal: ' + rupiah(t.sub);
  if (voucherOn) text += '\nDiskon (' + CONFIG.voucherCode + '): -' + rupiah(t.disc);
  text += '\nTotal: ' + rupiah(t.total) + '\n\nNama: ' + name + '\nAlamat: ' + addr;
  openWhatsApp(text);
}

/* ===== FAQ, KONTAK, EFEK ===== */
function renderFaq() {
  FAQ.forEach(([q, a]) => { const d = el('details'); d.append(el('summary', '', q), el('p', '', a)); $('#faq-list').appendChild(d); });
}

function submitContact(e) {
  e.preventDefault();
  const name = $('#c-name').value.trim(), msg = $('#c-msg').value.trim();
  if (!name || !msg) { $('#c-err').textContent = 'Isi nama dan pesan terlebih dahulu.'; return; }
  $('#c-err').textContent = '';
  openWhatsApp('Halo Pasarin, saya ' + name + '.\n' + msg);
  e.target.reset();
}

function tick() {
  const n = new Date(), end = new Date(n);
  end.setHours(24, 0, 0, 0);
  const s = Math.floor((end - n) / 1000), f = (v) => String(v).padStart(2, '0');
  $('#timer').textContent = f(Math.floor(s / 3600)) + ':' + f(Math.floor(s % 3600 / 60)) + ':' + f(s % 60);
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { items.forEach((x) => x.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12 });
  items.forEach((x) => io.observe(x));
}

/* ===== INISIALISASI ===== */
function init() {
  renderCats(); renderFilters(); renderFlash(); renderGrid(); renderFaq(); renderCart(); tick(); initReveal();
  setInterval(tick, 1000);
  $('#year').textContent = String(new Date().getFullYear());
  $('#wa-fab').href = 'https://wa.me/' + CONFIG.waNumber;
  $('#search').addEventListener('input', (e) => { query = e.target.value; renderGrid(); });
  $('#sort').addEventListener('change', (e) => { sortBy = e.target.value; renderGrid(); });
  $('#reset').addEventListener('click', () => { category = 'Semua'; query = ''; $('#search').value = ''; renderFilters(); renderGrid(); });
  $('#cart-btn').addEventListener('click', () => setDrawer(true));
  $('#cart-close').addEventListener('click', () => setDrawer(false));
  $('#overlay').addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });
  $('#voucher-btn').addEventListener('click', applyVoucher);
  $('#checkout').addEventListener('click', checkout);
  $('#clear').addEventListener('click', () => { cart = []; write('pasarin_cart', cart); renderCart(); });
  $('#contact-form').addEventListener('submit', submitContact);
  $('#copy-promo').addEventListener('click', () => {
    if (navigator.clipboard) navigator.clipboard.writeText(CONFIG.voucherCode).then(() => toast('Kode disalin'), () => toast('Salin manual: ' + CONFIG.voucherCode));
    else toast('Kode voucher: ' + CONFIG.voucherCode);
  });
  $('#menu-btn').addEventListener('click', () => { const o = $('#nav').classList.toggle('open'); $('#menu-btn').setAttribute('aria-expanded', String(o)); });
  $('#nav').addEventListener('click', () => $('#nav').classList.remove('open'));
  $('#totop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => { $('#totop').hidden = window.scrollY < 600; }, { passive: true });
}
init();
