// implements [S5.11] [S6.6] keep every served PNG under 500 KB

import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '..', 'public')
const MAX_BYTES = 500 * 1024

const TARGETS = [
  'hero_bg.png',
  'sessions_bg.png',
  'form_bg.png',
  'payment_bg.png',
  'og_share.png',
  'octopus_hero.png',
]

async function compressOne(fileName) {
  const filePath = path.join(publicDir, fileName)
  try {
    await stat(filePath)
  } catch {
    console.log('skip missing', fileName)
    return
  }

  const before = (await stat(filePath)).size
  let quality = 80
  let width = 1920
  let buffer = await sharp(filePath)
    .resize({ width, withoutEnlargement: true })
    .png({ compressionLevel: 9, quality, palette: true, colours: 128 })
    .toBuffer()

  while (buffer.length > MAX_BYTES && (quality > 40 || width > 1200)) {
    if (quality > 40) quality -= 10
    else width -= 200
    buffer = await sharp(filePath)
      .resize({ width, withoutEnlargement: true })
      .png({ compressionLevel: 9, quality, palette: true, colours: Math.max(48, quality) })
      .toBuffer()
  }

  await sharp(buffer).toFile(filePath)
  const after = (await stat(filePath)).size
  console.log(
    `${fileName}: ${(before / 1024).toFixed(0)} KB to ${(after / 1024).toFixed(0)} KB`,
  )
}

async function main() {
  const present = new Set(await readdir(publicDir))
  for (const fileName of TARGETS) {
    if (present.has(fileName)) await compressOne(fileName)
    else console.log('skip missing', fileName)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
