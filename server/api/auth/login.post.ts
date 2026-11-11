import { z } from 'zod'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, schema.parse)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await verifyPassword(user.password, password))) {
    throw createError({ statusCode: 401, statusMessage: 'Email atau password salah' })
  }

  await setUserSession(event, { user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  return { ok: true }
})