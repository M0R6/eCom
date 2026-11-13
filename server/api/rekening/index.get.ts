export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)

  return prisma.akunbank.findMany({
    where: { idProfilPetani: profil.idPetani },
    orderBy: { idRekening: 'desc' },
  })
})
