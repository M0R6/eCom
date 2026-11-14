export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)

  return prisma.produk.findMany({
    where: { idProfilPetani: profil.idPetani },
    include: { kategori: { select: { nama: true } }, gambarproduk: { orderBy: { urutanTampil: 'asc' } } },
    orderBy: { idProduk: 'desc' },
  })
})