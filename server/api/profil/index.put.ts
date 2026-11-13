import { z } from 'zod'

const schema = z.object({
  nama: z.string().min(2).optional(),
  profilPetani: z
    .object({
      namaPertanian: z.string().min(1).max(150).optional(),
      nomorTelepon: z.string().max(20).optional(),
      alamat: z.string().optional(),
      deskripsi: z.string().optional(),
    })
    .optional(),
  profilKonsumen: z
    .object({ nomorTelepon: z.string().max(20).optional() })
    .optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readValidatedBody(event, schema.parse)

  const { nama, profilPetani, profilKonsumen } = body

  await prisma.$transaction(async (tx) => {
    if (nama) {
      await tx.pengguna.update({
        where: { idPengguna: user.id },
        data: { nama },
      })
    }
    if (profilPetani && user.peran === 'Petani') {
      await tx.profilpetani.update({
        where: { idPengguna: user.id },
        data: profilPetani,
      })
    }
    if (profilKonsumen && user.peran === 'Konsumen') {
      await tx.profilkonsumen.update({
        where: { idPengguna: user.id },
        data: profilKonsumen,
      })
    }
  })

  return { ok: true }
})
