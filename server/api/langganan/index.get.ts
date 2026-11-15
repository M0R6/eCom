export default defineEventHandler(async (event) => {
  const profil = await getProfilKonsumen(event)

  return prisma.langganan.findMany({
    where: { idProfilKonsumen: profil.idKonsumen },
    include: {
      alamat: { select: { alamatTersimpan: true, namaPenerima: true, detailAlamat: true } },
      itemlangganan: { include: { produk: { select: { nama: true, harga: true, satuan: true } } } }
    },
    orderBy: { idLangganan: 'desc' }
  })
})
