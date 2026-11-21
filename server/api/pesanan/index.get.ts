export default defineEventHandler(async (event) => {
  const profil = await getProfilKonsumen(event)

  const daftar = await prisma.pesanan.findMany({
    where: { idProfilKonsumen: profil.idKonsumen },
    include: { barangpesanan: { select: { namaProduk: true, jumlah: true, subtotal: true } } },
    orderBy: { idPesanan: 'desc' }
  })

  return daftar.map(p => ({
    idPesanan: p.idPesanan,
    status: p.status ?? 'Menunggu_Pembayaran',
    jumlahTotal: Number(p.jumlahTotal),
    alamatPengiriman: p.alamatPengiriman,
    dibuatPada: p.dibuatPada,
    barang: p.barangpesanan.map(b => ({
      namaProduk: b.namaProduk,
      jumlah: b.jumlah,
      subtotal: Number(b.subtotal)
    }))
  }))
})
