import { z } from 'zod'

const schema = z.object({
  nama: z.string().min(2),
  email: z.string().email(),
  kataSandi: z.string().min(8),
  peran: z.enum(['Petani', 'Konsumen']),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, schema.parse)

  const exists = await prisma.pengguna.findUnique({ where: { email: body.email } })
  if (exists) {
    throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar' })
  }

  const { pengguna } = await prisma.$transaction(async (tx) => {
    const pengguna = await tx.pengguna.create({
      data: {
        nama: body.nama,
        email: body.email,
        kataSandi: await hashPassword(body.kataSandi),
        peran: body.peran,
      },
    })

    if (body.peran === 'Petani') {
      await tx.profilpetani.create({ data: { idPengguna: pengguna.idPengguna } })
    } else {
      await tx.profilkonsumen.create({ data: { idPengguna: pengguna.idPengguna } })
    }

    return { pengguna }
  })

  await setUserSession(event, {
    user: {
      id: pengguna.idPengguna,
      nama: pengguna.nama,
      email: pengguna.email,
      peran: pengguna.peran,
    },
  })
  return { ok: true }
})
