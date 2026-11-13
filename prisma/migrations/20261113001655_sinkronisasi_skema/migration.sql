-- CreateTable
CREATE TABLE `akunbank` (
    `idRekening` INTEGER NOT NULL AUTO_INCREMENT,
    `idProfilPetani` INTEGER NOT NULL,
    `namaBank` VARCHAR(50) NULL,
    `nomorRekening` VARCHAR(50) NULL,
    `pemilikRekening` VARCHAR(100) NULL,

    INDEX `idProfilPetani`(`idProfilPetani`),
    PRIMARY KEY (`idRekening`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alamat` (
    `idAlamat` INTEGER NOT NULL AUTO_INCREMENT,
    `idPengguna` INTEGER NOT NULL,
    `namaPenerima` VARCHAR(100) NULL,
    `nomorTelepon` VARCHAR(20) NULL,
    `detailAlamat` TEXT NULL,
    `desa` VARCHAR(100) NULL,
    `kecamatan` VARCHAR(100) NULL,
    `kota` VARCHAR(100) NULL,
    `provinsi` VARCHAR(100) NULL,
    `kodePos` VARCHAR(10) NULL,
    `alamatTersimpan` VARCHAR(100) NULL,

    INDEX `idPengguna`(`idPengguna`),
    PRIMARY KEY (`idAlamat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `barangpesanan` (
    `idBarangPesanan` INTEGER NOT NULL AUTO_INCREMENT,
    `idPesanan` INTEGER NOT NULL,
    `idProduk` INTEGER NULL,
    `namaProduk` VARCHAR(150) NULL,
    `harga` DECIMAL(10, 2) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `subtotal` DECIMAL(15, 2) NOT NULL,

    INDEX `idPesanan`(`idPesanan`),
    INDEX `idProduk`(`idProduk`),
    PRIMARY KEY (`idBarangPesanan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gambarproduk` (
    `idGambarProduk` INTEGER NOT NULL AUTO_INCREMENT,
    `idProduk` INTEGER NOT NULL,
    `tautanGambar` VARCHAR(255) NOT NULL,
    `urutanTampil` INTEGER NULL DEFAULT 1,

    INDEX `idProduk`(`idProduk`),
    PRIMARY KEY (`idGambarProduk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itemkeranjang` (
    `idItemKeranjang` INTEGER NOT NULL AUTO_INCREMENT,
    `idKeranjang` INTEGER NOT NULL,
    `idProduk` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL DEFAULT 1,

    INDEX `idKeranjang`(`idKeranjang`),
    INDEX `idProduk`(`idProduk`),
    PRIMARY KEY (`idItemKeranjang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itemlangganan` (
    `idItemLangganan` INTEGER NOT NULL AUTO_INCREMENT,
    `idLangganan` INTEGER NOT NULL,
    `idProduk` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,

    INDEX `idLangganan`(`idLangganan`),
    INDEX `idProduk`(`idProduk`),
    PRIMARY KEY (`idItemLangganan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kategori` (
    `idKategori` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `deskripsi` TEXT NULL,

    PRIMARY KEY (`idKategori`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `keranjang` (
    `idKeranjang` INTEGER NOT NULL AUTO_INCREMENT,
    `idProfilKonsumen` INTEGER NOT NULL,
    `dibuatPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `diperbaruiPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idProfilKonsumen`(`idProfilKonsumen`),
    PRIMARY KEY (`idKeranjang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `langganan` (
    `idLangganan` INTEGER NOT NULL AUTO_INCREMENT,
    `idProfilKonsumen` INTEGER NOT NULL,
    `idAlamat` INTEGER NOT NULL,
    `status` ENUM('Aktif', 'Jeda', 'Berhenti') NULL DEFAULT 'Aktif',
    `frekuensi` ENUM('Harian', 'Mingguan', 'Bulanan') NOT NULL,
    `tanggalPengirimanBerikutnya` DATE NOT NULL,
    `dibuatPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idAlamat`(`idAlamat`),
    INDEX `idProfilKonsumen`(`idProfilKonsumen`),
    PRIMARY KEY (`idLangganan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengetahuanchatbot` (
    `idPengetahuanChatbot` INTEGER NOT NULL AUTO_INCREMENT,
    `pertanyaan` TEXT NOT NULL,
    `jawaban` TEXT NOT NULL,
    `kataKunci` VARCHAR(255) NULL,
    `kategori` VARCHAR(100) NULL,
    `aktif` BOOLEAN NULL DEFAULT true,
    `diperbaruiPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`idPengetahuanChatbot`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengguna` (
    `idPengguna` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `kataSandi` VARCHAR(255) NOT NULL,
    `peran` ENUM('Petani', 'Konsumen') NOT NULL,
    `dibuatPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`idPengguna`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `percakapanchat` (
    `idPercakapanChat` INTEGER NOT NULL AUTO_INCREMENT,
    `idPengguna` INTEGER NOT NULL,
    `judul` VARCHAR(150) NULL,
    `dibuatPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `diperbaruiPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idPengguna`(`idPengguna`),
    PRIMARY KEY (`idPercakapanChat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pesanan` (
    `idPesanan` INTEGER NOT NULL AUTO_INCREMENT,
    `idProfilKonsumen` INTEGER NOT NULL,
    `status` ENUM('Menunggu Pembayaran', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan') NULL DEFAULT 'Menunggu Pembayaran',
    `jumlahTotal` DECIMAL(15, 2) NOT NULL,
    `alamatPengiriman` TEXT NOT NULL,
    `dibuatPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `diperbaruiPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idProfilKonsumen`(`idProfilKonsumen`),
    PRIMARY KEY (`idPesanan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pesanchat` (
    `idPesanChat` INTEGER NOT NULL AUTO_INCREMENT,
    `idPercakapan` INTEGER NOT NULL,
    `peran` ENUM('User', 'Bot', 'Admin') NOT NULL,
    `konten` TEXT NOT NULL,
    `dibuatPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idPercakapan`(`idPercakapan`),
    PRIMARY KEY (`idPesanChat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produk` (
    `idProduk` INTEGER NOT NULL AUTO_INCREMENT,
    `idProfilPetani` INTEGER NOT NULL,
    `idKategori` INTEGER NULL,
    `nama` VARCHAR(150) NOT NULL,
    `deskripsi` TEXT NULL,
    `harga` DECIMAL(10, 2) NOT NULL,
    `stok` INTEGER NULL DEFAULT 0,
    `satuan` VARCHAR(20) NULL,
    `status` ENUM('Tersedia', 'Habis', 'Disembunyikan') NULL DEFAULT 'Tersedia',
    `dibuatPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `diperbaruiPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idKategori`(`idKategori`),
    INDEX `idProfilPetani`(`idProfilPetani`),
    PRIMARY KEY (`idProduk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profilkonsumen` (
    `idKonsumen` INTEGER NOT NULL AUTO_INCREMENT,
    `idPengguna` INTEGER NOT NULL,
    `nomorTelepon` VARCHAR(20) NULL,

    INDEX `idPengguna`(`idPengguna`),
    PRIMARY KEY (`idKonsumen`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profilpetani` (
    `idPetani` INTEGER NOT NULL AUTO_INCREMENT,
    `idPengguna` INTEGER NOT NULL,
    `namaPertanian` VARCHAR(150) NULL,
    `nomorTelepon` VARCHAR(20) NULL,
    `alamat` TEXT NULL,
    `deskripsi` TEXT NULL,

    INDEX `idPengguna`(`idPengguna`),
    PRIMARY KEY (`idPetani`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `riwayatstatuspesanan` (
    `idRiwayatStatusPesanan` INTEGER NOT NULL AUTO_INCREMENT,
    `idPesanan` INTEGER NOT NULL,
    `idDiubahOlehPengguna` INTEGER NOT NULL,
    `statusLama` VARCHAR(50) NULL,
    `statusBaru` VARCHAR(50) NULL,
    `catatan` TEXT NULL,
    `dibuatPada` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idDiubahOlehPengguna`(`idDiubahOlehPengguna`),
    INDEX `idPesanan`(`idPesanan`),
    PRIMARY KEY (`idRiwayatStatusPesanan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `akunbank` ADD CONSTRAINT `akunbank_ibfk_1` FOREIGN KEY (`idProfilPetani`) REFERENCES `profilpetani`(`idPetani`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `alamat` ADD CONSTRAINT `alamat_ibfk_1` FOREIGN KEY (`idPengguna`) REFERENCES `pengguna`(`idPengguna`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `barangpesanan` ADD CONSTRAINT `barangpesanan_ibfk_1` FOREIGN KEY (`idPesanan`) REFERENCES `pesanan`(`idPesanan`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `barangpesanan` ADD CONSTRAINT `barangpesanan_ibfk_2` FOREIGN KEY (`idProduk`) REFERENCES `produk`(`idProduk`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `gambarproduk` ADD CONSTRAINT `gambarproduk_ibfk_1` FOREIGN KEY (`idProduk`) REFERENCES `produk`(`idProduk`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `itemkeranjang` ADD CONSTRAINT `itemkeranjang_ibfk_1` FOREIGN KEY (`idKeranjang`) REFERENCES `keranjang`(`idKeranjang`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `itemkeranjang` ADD CONSTRAINT `itemkeranjang_ibfk_2` FOREIGN KEY (`idProduk`) REFERENCES `produk`(`idProduk`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `itemlangganan` ADD CONSTRAINT `itemlangganan_ibfk_1` FOREIGN KEY (`idLangganan`) REFERENCES `langganan`(`idLangganan`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `itemlangganan` ADD CONSTRAINT `itemlangganan_ibfk_2` FOREIGN KEY (`idProduk`) REFERENCES `produk`(`idProduk`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `keranjang` ADD CONSTRAINT `keranjang_ibfk_1` FOREIGN KEY (`idProfilKonsumen`) REFERENCES `profilkonsumen`(`idKonsumen`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `langganan` ADD CONSTRAINT `langganan_ibfk_1` FOREIGN KEY (`idProfilKonsumen`) REFERENCES `profilkonsumen`(`idKonsumen`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `langganan` ADD CONSTRAINT `langganan_ibfk_2` FOREIGN KEY (`idAlamat`) REFERENCES `alamat`(`idAlamat`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `percakapanchat` ADD CONSTRAINT `percakapanchat_ibfk_1` FOREIGN KEY (`idPengguna`) REFERENCES `pengguna`(`idPengguna`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pesanan` ADD CONSTRAINT `pesanan_ibfk_1` FOREIGN KEY (`idProfilKonsumen`) REFERENCES `profilkonsumen`(`idKonsumen`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pesanchat` ADD CONSTRAINT `pesanchat_ibfk_1` FOREIGN KEY (`idPercakapan`) REFERENCES `percakapanchat`(`idPercakapanChat`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `produk` ADD CONSTRAINT `produk_ibfk_1` FOREIGN KEY (`idProfilPetani`) REFERENCES `profilpetani`(`idPetani`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `produk` ADD CONSTRAINT `produk_ibfk_2` FOREIGN KEY (`idKategori`) REFERENCES `kategori`(`idKategori`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `profilkonsumen` ADD CONSTRAINT `profilkonsumen_ibfk_1` FOREIGN KEY (`idPengguna`) REFERENCES `pengguna`(`idPengguna`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `profilpetani` ADD CONSTRAINT `profilpetani_ibfk_1` FOREIGN KEY (`idPengguna`) REFERENCES `pengguna`(`idPengguna`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `riwayatstatuspesanan` ADD CONSTRAINT `riwayatstatuspesanan_ibfk_1` FOREIGN KEY (`idPesanan`) REFERENCES `pesanan`(`idPesanan`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `riwayatstatuspesanan` ADD CONSTRAINT `riwayatstatuspesanan_ibfk_2` FOREIGN KEY (`idDiubahOlehPengguna`) REFERENCES `pengguna`(`idPengguna`) ON DELETE CASCADE ON UPDATE RESTRICT;
