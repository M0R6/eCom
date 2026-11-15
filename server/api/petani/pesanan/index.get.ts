import { z } from 'zod'

const querySchema = z.object({
  status: z.enum(['Menunggu_Pembayaran', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan']).optional()
})

export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)
  const { status } = await getValidatedQuery(event, querySchema.parse)

  const daftar = await prisma.pesanan.findMany({
    where: {
      ...(status ? { status } : {}),
      barangpesanan: { some: { produk: { idProfilPetani: profil.idPetani } } }
    },
    include: {
      profilkonsumen: { include: { pengguna: { select: { nama: true } } } },
      barangpesanan: { include: { produk: { select: { idProfilPetani: true, satuan: true } } } }
    },
    orderBy: { idPesanan: 'desc' }
  })

  return daftar.map((p) => {
    const milikku = p.barangpesanan.filter(b => b.produk?.idProfilPetani === profil.idPetani)
    // Status hanya boleh diubah bila seluruh isi pesanan milik petani ini
    const semuaMilikku = p.barangpesanan.every(
      b => b.idProduk === null || b.produk?.idProfilPetani === profil.idPetani
    )
    const statusSekarang = p.status ?? 'Menunggu_Pembayaran'

    return {
      idPesanan: p.idPesanan,
      status: statusSekarang,
      namaKonsumen: p.profilkonsumen.pengguna.nama,
      alamatPengiriman: p.alamatPengiriman,
      dibuatPada: p.dibuatPada,
      barang: milikku.map(b => ({
        idBarangPesanan: b.idBarangPesanan,
        namaProduk: b.namaProduk,
        jumlah: b.jumlah,
        satuan: b.produk?.satuan ?? null,
        subtotal: Number(b.subtotal)
      })),
      totalBagianku: milikku.reduce((jumlah, b) => jumlah + Number(b.subtotal), 0),
      transisi: semuaMilikku ? TRANSISI_PESANAN_PETANI[statusSekarang] ?? [] : []
    }
  })
})
