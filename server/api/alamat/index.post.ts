import { z } from 'zod'

const schema = z.object({
  namaPenerima: z.string().min(1).max(100),
  nomorTelepon: z.string().min(5).max(20),
  detailAlamat: z.string().min(1),
  desa: z.string().max(100).optional(),
  kecamatan: z.string().max(100).optional(),
  kota: z.string().max(100).optional(),
  provinsi: z.string().max(100).optional(),
  kodePos: z.string().max(10).optional(),
  alamatTersimpan: z.string().max(100).optional(), // label, mis. "Rumah" / "Kebun"
})

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readValidatedBody(event, schema.parse)

  return prisma.alamat.create({
    data: { ...body, idPengguna: user.id },
  })
})
