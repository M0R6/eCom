export default defineEventHandler(async (event) => {
  const profil = await getProfilKonsumen(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'ID pesanan tidak valid' })
  }

  const p = await prisma.pesanan.findFirst({
    where: { idPesanan: id, idProfilKonsumen: profil.idKonsumen },
    include: {
      barangpesanan: true,
      riwayatstatuspesanan: { orderBy: { dibuatPada: 'asc' } }
    }
  })
  if (!p) {
    throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan' })
  }

  return {
    idPesanan: p.idPesanan,
    status: p.status ?? 'Menunggu_Pembayaran',
    jumlahTotal: Number(p.jumlahTotal),
    alamatPengiriman: p.alamatPengiriman,
    dibuatPada: p.dibuatPada,
    barang: p.barangpesanan.map(b => ({
      idBarangPesanan: b.idBarangPesanan,
      namaProduk: b.namaProduk,
      harga: Number(b.harga),
      jumlah: b.jumlah,
      subtotal: Number(b.subtotal)
    })),
    riwayat: p.riwayatstatuspesanan.map(r => ({
      statusLama: r.statusLama,
      statusBaru: r.statusBaru,
      catatan: r.catatan,
      dibuatPada: r.dibuatPada
    }))
  }
})
