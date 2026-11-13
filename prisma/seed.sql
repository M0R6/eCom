-- ============================================================
-- SEED DATA DUMMY — eCom (database: ecom)
-- Password semua akun: password123
-- Jalankan:  mysql -u root ecom < prisma/seed.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Bersihkan data (TRUNCATE tidak bisa dipakai karena FK; pakai DELETE)
DELETE FROM pesanchat;
DELETE FROM percakapanchat;
DELETE FROM pengetahuanchatbot;
DELETE FROM itemlangganan;
DELETE FROM langganan;
DELETE FROM riwayatstatuspesanan;
DELETE FROM barangpesanan;
DELETE FROM pesanan;
DELETE FROM itemkeranjang;
DELETE FROM keranjang;
DELETE FROM gambarproduk;
DELETE FROM produk;
DELETE FROM kategori;
DELETE FROM akunbank;
DELETE FROM alamat;
DELETE FROM profilkonsumen;
DELETE FROM profilpetani;
DELETE FROM pengguna;

-- Reset nomor urut agar mulai dari 1 lagi
ALTER TABLE pesanchat           AUTO_INCREMENT = 1;
ALTER TABLE percakapanchat      AUTO_INCREMENT = 1;
ALTER TABLE pengetahuanchatbot  AUTO_INCREMENT = 1;
ALTER TABLE itemlangganan       AUTO_INCREMENT = 1;
ALTER TABLE langganan           AUTO_INCREMENT = 1;
ALTER TABLE riwayatstatuspesanan AUTO_INCREMENT = 1;
ALTER TABLE barangpesanan       AUTO_INCREMENT = 1;
ALTER TABLE pesanan             AUTO_INCREMENT = 1;
ALTER TABLE itemkeranjang       AUTO_INCREMENT = 1;
ALTER TABLE keranjang           AUTO_INCREMENT = 1;
ALTER TABLE gambarproduk        AUTO_INCREMENT = 1;
ALTER TABLE produk              AUTO_INCREMENT = 1;
ALTER TABLE kategori            AUTO_INCREMENT = 1;
ALTER TABLE akunbank            AUTO_INCREMENT = 1;
ALTER TABLE alamat              AUTO_INCREMENT = 1;
ALTER TABLE profilkonsumen      AUTO_INCREMENT = 1;
ALTER TABLE profilpetani        AUTO_INCREMENT = 1;
ALTER TABLE pengguna            AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. PENGGUNA (1 Petani + 2 Konsumen)
-- ============================================================
INSERT INTO pengguna (idPengguna, nama, email, kataSandi, peran, dibuatPada) VALUES
(1, 'Budi Santoso',   'petani@ecom.test',   '$scrypt$n=16384,r=8,p=1$JkMrylrNbdsig1seGb0n5A$O9kPa3ZC+1SC4Cl3yY4y5tnmf0Ux7iVYnXoqa3vMitoMISBaEvfOGiCOTLvoXBViYVyR/Sc1IDsPS2ovZ+K82A', 'Petani',  NOW()),
(2, 'Siti Aminah',    'siti@ecom.test',     '$scrypt$n=16384,r=8,p=1$JkMrylrNbdsig1seGb0n5A$O9kPa3ZC+1SC4Cl3yY4y5tnmf0Ux7iVYnXoqa3vMitoMISBaEvfOGiCOTLvoXBViYVyR/Sc1IDsPS2ovZ+K82A', 'Konsumen', NOW()),
(3, 'Andi Wijaya',    'andi@ecom.test',     '$scrypt$n=16384,r=8,p=1$JkMrylrNbdsig1seGb0n5A$O9kPa3ZC+1SC4Cl3yY4y5tnmf0Ux7iVYnXoqa3vMitoMISBaEvfOGiCOTLvoXBViYVyR/Sc1IDsPS2ovZ+K82A', 'Konsumen', NOW());

-- ============================================================
-- 2. PROFIL
-- ============================================================
INSERT INTO profilpetani (idPetani, idPengguna, namaPertanian, nomorTelepon, alamat, deskripsi) VALUES
(1, 1, 'Tani Makmur Desa Sukamaju', '081234567890',
 'Dusun II, Desa Sukamaju, Kec. Natar, Lampung Selatan',
 'Petani sayur organik keluarga, sudah 3 generasi menekuni hortikultura tanpa pestisida kimia.');

INSERT INTO profilkonsumen (idKonsumen, idPengguna, nomorTelepon) VALUES
(1, 2, '089876543210'),
(2, 3, '081211112222');

-- ============================================================
-- 3. ALAMAT (drop point / alamat pengiriman konsumen)
-- ============================================================
INSERT INTO alamat (idAlamat, idPengguna, namaPenerima, nomorTelepon, detailAlamat, desa, kecamatan, kota, provinsi, kodePos, alamatTersimpan) VALUES
(1, 2, 'Siti Aminah', '089876543210', 'Jl. Melati No. 12', 'Sukamaju', 'Natar', 'Lampung Selatan', 'Lampung', '35362', 'Rumah'),
(2, 2, 'Siti Aminah', '089876543210', 'Kantor Dinas Pendidikan, Jl. Wolter Monginsidi No. 45', 'Rajabasa', 'Rajabasa', 'Bandar Lampung', 'Lampung', '35142', 'Kantor'),
(3, 3, 'Andi Wijaya', '081211112222', 'Jl. Kenanga No. 8', 'Gedong Meneng', 'Telukbetung Selatan', 'Bandar Lampung', 'Lampung', '35241', 'Rumah');

-- ============================================================
-- 4. AKUN BANK (pencairan dana petani)
-- ============================================================
INSERT INTO akunbank (idRekening, idProfilPetani, namaBank, nomorRekening, pemilikRekening) VALUES
(1, 1, 'BCA',        '1234567890', 'Budi Santoso'),
(2, 1, 'Bank Mandiri', '9876543210', 'Budi Santoso');

-- ============================================================
-- 5. KATEGORI
-- ============================================================
INSERT INTO kategori (idKategori, nama, deskripsi) VALUES
(1, 'Sayur Daun',   'Sayuran daun segar seperti bayam, kangkung, dan sawi'),
(2, 'Buah',         'Buah-buahan hasil panen lokal'),
(3, 'Bumbu Dapur',  'Bumbu segar seperti cabai, bawang, dan tomat'),
(4, 'Umbi & Biji',  'Umbi-umbian dan biji-bijian');

-- ============================================================
-- 6. PRODUK (hasil panen milik petani id 1)
-- ============================================================
INSERT INTO produk (idProduk, idProfilPetani, idKategori, nama, deskripsi, harga, stok, satuan, status, dibuatPada, diperbaruiPada) VALUES
(1, 1, 1, 'Bayam Hijau', 'Bayam hijau segar dipetik pagi hari, tanpa pestisida kimia.', 8000.00, 50, 'ikat', 'Tersedia', NOW(), NOW()),
(2, 1, 1, 'Kangkung Hidroponik', 'Kangkung hidroponik renyah, cocok untuk tumis dan lalapan.', 6000.00, 80, 'ikat', 'Tersedia', NOW(), NOW()),
(3, 1, 2, 'Semangka Local', 'Semangka manih dari kebun Sukamaju, dipanen saat matang pohon.', 25000.00, 30, 'buah', 'Tersedia', NOW(), NOW()),
(4, 1, 3, 'Cabai Rawit Merah', 'Cabai rawit merah pedas khas Lampung.', 45000.00, 15, 'kg', 'Tersedia', NOW(), NOW()),
(5, 1, 3, 'Tomat Sayur', 'Tomat sayur segar untuk sambal dan masakan.', 12000.00, 0, 'kg', 'Habis', NOW(), NOW()),
(6, 1, 4, 'Ubi Jalar Ungu', 'Ubi jalar ungu berkualitas tinggi, manis legit.', 15000.00, 40, 'kg', 'Tersedia', NOW(), NOW());

-- ============================================================
-- 7. GAMBAR PRODUK (placeholder, ganti dengan foto asli nanti)
-- ============================================================
INSERT INTO gambarproduk (idGambarProduk, idProduk, tautanGambar, urutanTampil) VALUES
(1, 1, 'https://placehold.co/600x400/22c55e/fff?text=Bayam+Hijau', 1),
(2, 1, 'https://placehold.co/600x400/16a34a/fff?text=Bayam+Detail', 2),
(3, 2, 'https://placehold.co/600x400/22c55e/fff?text=Kangkung', 1),
(4, 3, 'https://placehold.co/600x400/ef4444/fff?text=Semangka', 1),
(5, 4, 'https://placehold.co/600x400/dc2626/fff?text=Cabai+Rawit', 1),
(6, 5, 'https://placehold.co/600x400/f59e0b/fff?text=Tomat', 1),
(7, 6, 'https://placehold.co/600x400/8b5cf6/fff?text=Ubi+Ungu', 1);

-- ============================================================
-- 8. KERANJANG (milik konsumen 1)
-- ============================================================
INSERT INTO keranjang (idKeranjang, idProfilKonsumen, dibuatPada, diperbaruiPada) VALUES
(1, 1, NOW(), NOW());

INSERT INTO itemkeranjang (idItemKeranjang, idKeranjang, idProduk, jumlah) VALUES
(1, 1, 1, 2),
(2, 1, 4, 1);

-- ============================================================
-- 9. PESANAN + BARANG PESANAN + RIWAYAT STATUS
-- ============================================================
-- Pesanan 1: sudah selesai
INSERT INTO pesanan (idPesanan, idProfilKonsumen, status, jumlahTotal, alamatPengiriman, dibuatPada, diperbaruiPada) VALUES
(1, 1, 'Selesai', 61000.00,
 'Jl. Melati No. 12, Desa Sukamaju, Kec. Natar, Lampung Selatan 35362 (Siti Aminah, 089876543210)',
 DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY));

INSERT INTO barangpesanan (idBarangPesanan, idPesanan, idProduk, namaProduk, harga, jumlah, subtotal) VALUES
(1, 1, 1, 'Bayam Hijau', 8000.00, 5, 40000.00),
(2, 1, 3, 'Semangka Local', 21000.00, 1, 21000.00);

INSERT INTO riwayatstatuspesanan (idRiwayatStatusPesanan, idPesanan, idDiubahOlehPengguna, statusLama, statusBaru, catatan, dibuatPada) VALUES
(1, 1, 2, NULL, 'Menunggu Pembayaran', 'Pesanan dibuat', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 1, 2, 'Menunggu Pembayaran', 'Diproses', 'Pembayaran diterima via transfer', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(3, 1, 1, 'Diproses', 'Dikirim', 'Barang diantar ke drop point desa', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(4, 1, 1, 'Dikirim', 'Selesai', 'Pesanan diterima konsumen', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Pesanan 2: sedang dikirim
INSERT INTO pesanan (idPesanan, idProfilKonsumen, status, jumlahTotal, alamatPengiriman, dibuatPada, diperbaruiPada) VALUES
(2, 1, 'Dikirim', 8000.00,
 'Jl. Melati No. 12, Desa Sukamaju, Kec. Natar, Lampung Selatan 35362 (Siti Aminah, 089876543210)',
 DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

INSERT INTO barangpesanan (idBarangPesanan, idPesanan, idProduk, namaProduk, harga, jumlah, subtotal) VALUES
(3, 2, 2, 'Kangkung Hidroponik', 8000.00, 1, 8000.00);

INSERT INTO riwayatstatuspesanan (idRiwayatStatusPesanan, idPesanan, idDiubahOlehPengguna, statusLama, statusBaru, catatan, dibuatPada) VALUES
(5, 2, 2, NULL, 'Menunggu Pembayaran', 'Pesanan dibuat', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 2, 2, 'Menunggu Pembayaran', 'Diproses', 'COD di drop point', NOW()),
(7, 2, 1, 'Diproses', 'Dikirim', 'Barang diantar ke drop point desa', NOW());

-- Pesanan 3: konsumen 2, masih menunggu pembayaran
INSERT INTO pesanan (idPesanan, idProfilKonsumen, status, jumlahTotal, alamatPengiriman, dibuatPada, diperbaruiPada) VALUES
(3, 2, 'Menunggu Pembayaran', 15000.00,
 'Jl. Kenanga No. 8, Gedong Meneng, Telukbetung Selatan, Bandar Lampung 35241 (Andi Wijaya, 081211112222)',
 NOW(), NOW());

INSERT INTO barangpesanan (idBarangPesanan, idPesanan, idProduk, namaProduk, harga, jumlah, subtotal) VALUES
(4, 3, 6, 'Ubi Jalar Ungu', 15000.00, 1, 15000.00);

INSERT INTO riwayatstatuspesanan (idRiwayatStatusPesanan, idPesanan, idDiubahOlehPengguna, statusLama, statusBaru, catatan, dibuatPada) VALUES
(8, 3, 3, NULL, 'Menunggu Pembayaran', 'Pesanan dibuat', NOW());

-- ============================================================
-- 10. LANGGANAN (otomatis mingguan) + itemnya
-- ============================================================
INSERT INTO langganan (idLangganan, idProfilKonsumen, idAlamat, status, frekuensi, tanggalPengirimanBerikutnya, dibuatPada) VALUES
(1, 1, 1, 'Aktif', 'Mingguan', DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY));

INSERT INTO itemlangganan (idItemLangganan, idLangganan, idProduk, jumlah) VALUES
(1, 1, 1, 3),
(2, 1, 2, 3);

-- ============================================================
-- 11. CHATBOT: PERCAKAPAN + PESAN
-- ============================================================
INSERT INTO percakapanchat (idPercakapanChat, idPengguna, judul, dibuatPada, diperbaruiPada) VALUES
(1, 2, 'Tanya cara pesan', NOW(), NOW());

INSERT INTO pesanchat (idPesanChat, idPercakapan, peran, konten, dibuatPada) VALUES
(1, 1, 'User', 'Bagaimana cara pesan sayur di sini?', NOW()),
(2, 1, 'Bot',  'Silakan pilih produk di katalog, tambahkan ke keranjang, lalu lakukan checkout. Selamat berbelanja!', NOW()),
(3, 1, 'User', 'Bisa COD nggak ya?', NOW());

-- ============================================================
-- 12. PENGETAHUAN CHATBOT (FAQ)
-- ============================================================
INSERT INTO pengetahuanchatbot (idPengetahuanchatbot, pertanyaan, jawaban, kataKunci, kategori, aktif, diperbaruiPada) VALUES
(1, 'Bagaimana cara daftar akun?', 'Klik menu Daftar, isi nama, email, password, dan pilih peran Petani atau Konsumen, lalu klik Daftar.', 'daftar;registrasi;akun', 'Akun', 1, NOW()),
(2, 'Bagaimana cara memesan produk?', 'Pilih produk di katalog, klik Tambah ke Keranjang, buka halaman Keranjang, lalu klik Checkout.', 'pesan;beli;keranjang;checkout', 'Transaksi', 1, NOW()),
(3, 'Metode pembayaran apa saja yang tersedia?', 'Saat ini tersedia transfer bank dan pembayaran tunai (COD) di drop point desa.', 'bayar;pembayaran;transfer;cod', 'Transaksi', 1, NOW()),
(4, 'Berapa lama pengiriman produk?', 'Pengiriman dilakukan 1-2 hari setelah pesanan dikonfirmasi, ke drop point desa terdekat.', 'kirim;pengiriman;antar', 'Pengiriman', 1, NOW()),
(5, 'Apa itu fitur langganan?', 'Langganan memungkinkan kamu mendapatkan sayur secara rutin (harian, mingguan, atau bulanan) tanpa perlu memesan ulang.', 'langganan;rutin;otomatis', 'Langganan', 1, NOW());
