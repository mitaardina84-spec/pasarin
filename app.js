'use strict';

/* ===== PENGATURAN TOKO (edit bagian ini) ===== */
const CONFIG = {
  waNumber: '6281234567890',   // GANTI dengan nomor WhatsApp penjual, format 62, tanpa + dan tanpa 0 di depan
  voucherCode: 'PASARIN10',
  voucherPercent: 10
};

/* Data produk: tambah, ubah, atau hapus baris di sini */
const PRODUCTS = [
  { id: 1, name: 'Kaos Polos Premium', cat: 'Fashion', price: 89000, stock: 20, emoji: '👕', desc: 'Kaos katun combed 30s, adem dan tidak mudah melar.' },
  { id: 2, name: 'Tote Bag Kanvas', cat: 'Fashion', price: 65000, stock: 15, emoji: '👜', desc: 'Tas kanvas tebal dengan resleting dan kantong dalam.' },
  { id: 3, name: 'Topi Baseball', cat: 'Fashion', price: 55000, stock: 12, emoji: '🧢', desc: 'Topi polos dengan strap yang bisa diatur.' },
  { id: 4, name: 'Earphone Bluetooth', cat: 'Gadget', price: 149000, stock: 8, emoji: '🎧', desc: 'Baterai tahan 20 jam, koneksi stabil, dengan mic.' },
  { id: 5, name: 'Power Bank 10.000 mAh', cat: 'Gadget', price: 159000, stock: 10, emoji: '🔋', desc: 'Dua port output, cocok dibawa bepergian.' },
  { id: 6, name: 'Kabel Data Type-C', cat: 'Gadget', price: 35000, stock: 30, emoji: '🔌', desc: 'Kabel 1 meter, mendukung fast charging.' },
  { id: 7, name: 'Madu Hutan 250 ml', cat: 'Makanan', price: 75000, stock: 18, emoji: '🍯', desc: 'Madu murni tanpa campuran gula.' },
  { id: 8, name: 'Keripik Singkong Pedas', cat: 'Makanan', price: 22000, stock: 40, emoji: '🍟', desc: 'Renyah dan gurih, kemasan 200 gram.' }
];

const FAQ = [
  ['Bagaimana cara memesan?', 'Masukkan produk ke keranjang, klik "Pesan lewat WhatsApp", lalu kirim pesan yang sudah terisi otomatis ke penjual.'],
  ['Bagaimana cara membayar?', 'Penjual akan mengirim detail pembayaran (transfer bank, QRIS, atau e-wallet) setelah pesananmu dikonfirmasi.'],
  ['Berapa ongkos kirimnya?', 'Ongkir dihitung penjual sesuai alamatmu dan dikonfirmasi lewat WhatsApp sebelum kamu membayar.'],
  ['Apakah keranjang saya tersimpan?', 'Ya, keranjang tersimpan di browser perangkatmu. Data ini tidak dikirim ke server mana pun.']
];

/* ===== UTILITAS ===== */
const $ = (s) => document.querySelector(s);
const rupiah = (n) => 'Rp ' + n.toLocaleString('id-ID');

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
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 2200);
}

/* ===== STATE ===== */
let category = 'Semua';
let query = '';
let voucherOn = false;
let cart = loadCart();

function loadCart() {
  try {
    const data = JSON.parse(localStorage.getItem('pasarin_cart'));
    if (!Array.isArray(data)) return [];
    return data.filter((i) => PRODUCTS.some((p) => p.id === i.id) && Number.isInteger(i.qty) && i.qty > 0);
  } catch (e) { return []; }
}
function saveCart() {
  try { localStorage.setItem('pasarin_cart', JSON.stringify(cart)); } catch (e) { /* abaikan */ }
}
const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

/* ===== KATALOG ===== */
function renderFilters() {
  const box = $('#filters');
  box.replaceChildren();
  ['Semua', ...new Set(PRODUCTS.map((p) => p.cat))].forEach((c) => {
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
  const list = PRODUCTS.filter((p) => (category === 'Semua' || p.cat === category) && p.name.toLowerCase().includes(q));
  $('#empty').hidden = list.length > 0;
  list.forEach((p) => {
    const card = el('article', 'card');
    const thumb = el('button', 'thumb', p.emoji);
    thumb.type = 'button';
    thumb.setAttribute('aria-label', 'Lihat detail ' + p.name);
    thumb.addEventListener('click', () => openDetail(p.id));
    const body = el('div', 'card-body');
    const name = el('button', 'card-name', p.name);
    name.type = 'button';
    name.addEventListener('click', () => openDetail(p.id));
    const add = el('button', 'btn btn-primary', p.stock > 0 ? 'Tambah ke keranjang' : 'Stok habis');
    add.type = 'button';
    add.disabled = p.stock < 1;
    add.addEventListener('click', () => addToCart(p.id));
    body.append(name, el('span', 'card-cat', p.cat), el('span', 'card-price', rupiah(p.price)), el('span', 'card-stock', 'Stok: ' + p.stock), add);
    card.append(thumb, body);
    grid.appendChild(card);
  });
}

function openDetail(id) {
  const p = getProduct(id);
  const d = $('#detail');
  d.replaceChildren();
  const body = el('div', 'detail-body');
  const add = el('button', 'btn btn-primary full', 'Tambah ke keranjang');
  add.type = 'button';
  add.disabled = p.stock < 1;
  add.addEventListener('click', () => { addToCart(p.id); d.close(); });
  const close = el('button', 'btn btn-link', 'Tutup');
  close.type = 'button';
  close.addEventListener('click', () => d.close());
  body.append(el('h3', '', p.name), el('p', 'muted', p.cat + ' - Stok ' + p.stock), el('p', '', p.desc), el('p', 'card-price', rupiah(p.price)), add, close);
  d.append(el('div', 'thumb', p.emoji), body);
  d.showModal();
}

/* ===== KERANJANG ===== */
function addToCart(id) {
  const p = getProduct(id);
  const item = cart.find((i) => i.id === id);
  if (item) {
    if (item.qty >= p.stock) { toast('Stok ' + p.name + ' hanya ' + p.stock); return; }
    item.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart();
  renderCart();
  toast(p.name + ' masuk keranjang');
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  const p = getProduct(id);
  item.qty = Math.min(item.qty + delta, p.stock);
  if (item.qty < 1) cart = cart.filter((i) => i.id !== id);
  saveCart();
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
    const p = getProduct(i.id);
    const row = el('div', 'line');
    const info = el('div');
    info.append(el('div', 'line-name', p.name), el('div', 'line-price', rupiah(p.price)));
    const qty = el('div', 'qty');
    const minus = el('button', '', '-');
    const plus = el('button', '', '+');
    minus.type = plus.type = 'button';
    minus.setAttribute('aria-label', 'Kurangi ' + p.name);
    plus.setAttribute('aria-label', 'Tambah ' + p.name);
    minus.addEventListener('click', () => changeQty(i.id, -1));
    plus.addEventListener('click', () => changeQty(i.id, 1));
    qty.append(minus, el('span', '', String(i.qty)), plus);
    row.append(el('div', 'line-emoji', p.emoji), info, qty);
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
  const code = $('#voucher').value.trim().toUpperCase();
  const msg = $('#voucher-msg');
  if (code === CONFIG.voucherCode) {
    voucherOn = true;
    msg.textContent = 'Voucher dipakai: diskon ' + CONFIG.voucherPercent + '%.';
  } else {
    voucherOn = false;
    msg.textContent = code ? 'Kode voucher tidak valid.' : 'Masukkan kode voucher.';
  }
  renderCart();
}

function openWhatsApp(text) {
  const url = 'https://wa.me/' + CONFIG.waNumber + '?text=' + encodeURIComponent(text);
  window.open(url, '_blank', 'noopener,noreferrer');
}

function checkout() {
  if (!cart.length) return;
  const t = totals();
  const lines = cart.map((i, n) => {
    const p = getProduct(i.id);
    return (n + 1) + '. ' + p.name + ' x' + i.qty + ' = ' + rupiah(p.price * i.qty);
  });
  let text = 'Halo Pasarin, saya mau pesan:\n' + lines.join('\n') + '\n\nSubtotal: ' + rupiah(t.sub);
  if (voucherOn) text += '\nDiskon (' + CONFIG.voucherCode + '): -' + rupiah(t.disc);
  text += '\nTotal: ' + rupiah(t.total) + '\n\nNama:\nAlamat pengiriman:';
  openWhatsApp(text);
}

/* ===== FAQ & KONTAK ===== */
function renderFaq() {
  const box = $('#faq-list');
  FAQ.forEach(([q, a]) => {
    const d = el('details');
    d.append(el('summary', '', q), el('p', '', a));
    box.appendChild(d);
  });
}

function submitContact(e) {
  e.preventDefault();
  const name = $('#c-name').value.trim();
  const msg = $('#c-msg').value.trim();
  const err = $('#c-err');
  if (!name || !msg) { err.textContent = 'Isi nama dan pesan terlebih dahulu.'; return; }
  err.textContent = '';
  openWhatsApp('Halo Pasarin, saya ' + name + '.\n' + msg);
  e.target.reset();
}

/* ===== INISIALISASI ===== */
function init() {
  renderFilters();
  renderGrid();
  renderFaq();
  renderCart();
  $('#year').textContent = String(new Date().getFullYear());

  $('#search').addEventListener('input', (e) => { query = e.target.value; renderGrid(); });
  $('#reset').addEventListener('click', () => { category = 'Semua'; query = ''; $('#search').value = ''; renderFilters(); renderGrid(); });
  $('#cart-btn').addEventListener('click', () => setDrawer(true));
  $('#cart-close').addEventListener('click', () => setDrawer(false));
  $('#overlay').addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });
  $('#voucher-btn').addEventListener('click', applyVoucher);
  $('#checkout').addEventListener('click', checkout);
  $('#clear').addEventListener('click', () => { cart = []; saveCart(); renderCart(); });
  $('#contact-form').addEventListener('submit', submitContact);
  $('#copy-promo').addEventListener('click', () => {
    if (navigator.clipboard) navigator.clipboard.writeText(CONFIG.voucherCode).then(() => toast('Kode disalin'), () => toast('Salin manual: ' + CONFIG.voucherCode));
    else toast('Kode voucher: ' + CONFIG.voucherCode);
  });
  $('#menu-btn').addEventListener('click', () => {
    const open = $('#nav').classList.toggle('open');
    $('#menu-btn').setAttribute('aria-expanded', String(open));
  });
  $('#nav').addEventListener('click', () => $('#nav').classList.remove('open'));
}

init();
