import { z } from 'zod'

const schema = z.object({
  namaPenerima: z.string().min(1).max(100).optional(),
  nomorTelepon: z.string().min(5).max(20).optional(),
  detailAlamat: z.string().min(1).optional(),
  desa: z.string().max(100).optional(),
  kecamatan: z.string().max(100).optional(),
  kota: z.string().max(100).optional(),
  provinsi: z.string().max(100).optional(),
  kodePos: z.string().max(10).optional(),
  alamatTersimpan: z.string().max(100).optional(),
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readValidatedBody(event, schema.parse)

  // pastikan alamat milik user ini
  const alamat = await prisma.alamat.findUnique({ where: { idAlamat: id } })
  if (!alamat || alamat.idPengguna !== user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Alamat tidak ditemukan' })
  }

  return prisma.alamat.update({ where: { idAlamat: id }, data: body })
})
