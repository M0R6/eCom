import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.boolean(),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, schema.parse)

  const exists = await prisma.user.findUnique({ where: { email: body.email } })
  if (exists) {
    throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar' })
  }

  const user = await prisma.user.create({
    data: { ...body, password: await hashPassword(body.password) },
  })

  await setUserSession(event, {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
  return { ok: true }
})