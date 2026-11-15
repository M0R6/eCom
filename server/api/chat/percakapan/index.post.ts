import { z } from 'zod'

const schema = z.object({
  judul: z
    .string()
    .trim()
    .max(150, 'Judul percakapan maksimal 150 karakter')
    .optional()
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const rawBody = await readBody(event).catch(() => ({}))
  const parsed = schema.safeParse(rawBody ?? {})

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message || 'Data percakapan tidak valid'
    })
  }

  const judul = parsed.data.judul || 'Percakapan Baru'

  return prisma.percakapanchat.create({
    data: {
      idPengguna: user.id,
      judul
    }
  })
})
