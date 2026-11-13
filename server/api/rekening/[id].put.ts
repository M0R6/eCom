import { z } from 'zod'

const schema = z.object({
  namaBank: z.string().min(1).max(50).optional(),
  nomorRekening: z.string().min(5).max(50).optional(),
  pemilikRekening: z.string().min(1).max(100).optional(),
})

export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, schema.parse)

  const rekening = await prisma.akunbank.findUnique({ where: { idRekening: id } })
  if (!rekening || rekening.idProfilPetani !== profil.idPetani) {
    throw createError({ statusCode: 404, statusMessage: 'Rekening tidak ditemukan' })
  }

  return prisma.akunbank.update({ where: { idRekening: id }, data: body })
})
