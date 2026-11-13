import { z } from 'zod'

const schema = z.object({
  namaBank: z.string().min(1).max(50),
  nomorRekening: z.string().min(5).max(50),
  pemilikRekening: z.string().min(1).max(100),
})

export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)
  const body = await readValidatedBody(event, schema.parse)

  return prisma.akunbank.create({
    data: { ...body, idProfilPetani: profil.idPetani },
  })
})
