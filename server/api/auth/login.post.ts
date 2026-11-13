import { z } from 'zod'

const schema = z.object({ email: z.string().email(), kataSandi: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const { email, kataSandi } = await readValidatedBody(event, schema.parse)

  const pengguna = await prisma.pengguna.findUnique({ where: { email } })
  if (!pengguna || !(await verifyPassword(pengguna.kataSandi, kataSandi))) {
    throw createError({ statusCode: 401, statusMessage: 'Email atau password salah' })
  }

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
