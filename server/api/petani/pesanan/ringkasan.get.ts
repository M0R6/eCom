export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)
  const milikku = { produk: { idProfilPetani: profil.idPetani } }

  // Awal bulan WIB (00:00 WIB = 17:00 UTC hari sebelumnya)
  const awalBulan = hariIni()
  awalBulan.setUTCDate(1)
  const awalBulanWib = new Date(awalBulan.getTime() - 7 * 60 * 60 * 1000)

  const [pesananBaru, perluDikirim, omzet] = await Promise.all([
    prisma.pesanan.count({
      where: { status: 'Menunggu_Pembayaran', barangpesanan: { some: milikku } }
    }),
    prisma.pesanan.count({
      where: { status: 'Diproses', barangpesanan: { some: milikku } }
    }),
    prisma.barangpesanan.aggregate({
      _sum: { subtotal: true },
      where: { ...milikku, pesanan: { status: 'Selesai', diperbaruiPada: { gte: awalBulanWib } } }
    })
  ])

  return {
    pesananBaru,
    perluDikirim,
    omzetBulanIni: Number(omzet._sum.subtotal ?? 0)
  }
})
