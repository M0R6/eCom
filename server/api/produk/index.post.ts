import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

const schema = z.object({
  nama: z.string().min(3).max(150),
  deskripsi: z.string().optional(),
  harga: z.coerce.number().positive(),
  stok: z.coerce.number().int().min(0),
  satuan: z.string().max(20),
  idKategori: z.coerce.number().int().positive().nullable().optional(),
})

export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)
  const parts = await readMultipartFormData(event)
  const fields = Object.fromEntries(
    (parts ?? [])
      .filter(part => part.name && !part.filename)
      .map(part => [part.name!, part.data.toString()]),
  )
  const body = schema.parse(fields)
  const image = parts?.find(part => part.name === 'gambar' && part.filename)

  if (image && (!image.type?.startsWith('image/') || image.data.length > 5 * 1024 * 1024)) {
    throw createError({ statusCode: 400, statusMessage: 'Foto harus berupa gambar maksimal 5 MB' })
  }

  let imagePath: string | undefined
  let imageUrl: string | undefined
  if (image) {
    const extension = extname(image.filename!).toLowerCase() || '.jpg'
    const filename = `${randomUUID()}${extension}`
    const uploadDirectory = join(process.cwd(), 'public', 'uploads', 'products')
    await mkdir(uploadDirectory, { recursive: true })
    imagePath = join(uploadDirectory, filename)
    imageUrl = `/uploads/products/${filename}`
    await writeFile(imagePath, image.data)
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const produk = await tx.produk.create({
        data: {
          ...body,
          idProfilPetani: profil.idPetani,
          status: body.stok === 0 ? 'Habis' : 'Tersedia',
        },
      })

      if (imageUrl) {
        await tx.gambarproduk.create({
          data: { idProduk: produk.idProduk, tautanGambar: imageUrl },
        })
      }

      return produk
    })
  } catch (error) {
    if (imagePath) await unlink(imagePath).catch(() => undefined)
    throw error
  }
})