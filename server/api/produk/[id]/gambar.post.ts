import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { randomUUID } from 'node:crypto'

/**
 * Upload satu gambar untuk produk yang sudah ada.
 * Body: multipart/form-data dengan field `gambar`.
 */
export default defineEventHandler(async (event) => {
  const profil = await getProfilPetani(event)
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'ID produk tidak valid' })
  }

  const produk = await prisma.produk.findUnique({
    where: { idProduk: id },
    include: { gambarproduk: { orderBy: { urutanTampil: 'asc' } } },
  })

  if (!produk || produk.idProfilPetani !== profil.idPetani) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
  }

  const parts = await readMultipartFormData(event)
  const image = parts?.find(part => part.name === 'gambar' && part.filename)

  if (!image) {
    throw createError({ statusCode: 400, statusMessage: 'Berkas gambar wajib diisi' })
  }

  if (!image.type?.startsWith('image/') || image.data.length > 5 * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: 'Foto harus berupa gambar maksimal 5 MB' })
  }

  const extension = extname(image.filename!).toLowerCase() || '.jpg'
  const filename = `${randomUUID()}${extension}`
  const uploadDirectory = join(process.cwd(), 'public', 'uploads', 'products')
  await mkdir(uploadDirectory, { recursive: true })

  const imagePath = join(uploadDirectory, filename)
  await writeFile(imagePath, image.data)

  try {
    return await prisma.gambarproduk.create({
      data: {
        idProduk: id,
        tautanGambar: `/uploads/products/${filename}`,
        urutanTampil: produk.gambarproduk.length + 1,
      },
    })
  } catch (error) {
    await unlink(imagePath).catch(() => undefined)
    throw error
  }
})
