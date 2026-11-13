export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)
  const id = Number(getRouterParam(event, 'id'))

  const rekening = await prisma.akunbank.findUnique({ where: { idRekening: id } })
  if (!rekening || rekening.idProfilPetani !== profil.idPetani) {
    throw createError({ statusCode: 404, statusMessage: 'Rekening tidak ditemukan' })
  }

  await prisma.akunbank.delete({ where: { idRekening: id } })
  return { ok: true }
})
