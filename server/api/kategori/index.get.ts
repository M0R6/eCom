export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)

  return prisma.kategori.findMany({
    orderBy: { nama: 'asc' },
  })
})