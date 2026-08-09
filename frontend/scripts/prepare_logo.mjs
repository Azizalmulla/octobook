// implements [S5.12] and STEP 5 logo pipeline
// Source: frontend/assets/source/logo_source.png
// Output: transparent marks in frontend/public/ plus favicon.ico

import { mkdir, copyFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const sourcePath = path.join(root, 'assets', 'source', 'logo_source.png')
const publicDir = path.join(root, 'public')

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function trimAndSquare(inputBuffer) {
  // Trim near empty margin, then square the canvas with equal padding.
  const trimmed = await sharp(inputBuffer)
    .trim({ threshold: 20 })
    .ensureAlpha()
    .png()
    .toBuffer({ resolveWithObject: true })

  const size = Math.max(trimmed.info.width, trimmed.info.height)
  return sharp(trimmed.data)
    .resize({
      width: size,
      height: size,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()
}

async function writePng(buffer, fileName, size) {
  const outPath = path.join(publicDir, fileName)
  await sharp(buffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath)
  console.log('wrote', fileName)
}

async function writeAppleIcon(buffer) {
  // iOS does not honour transparency. Solid ground from var(--shade) = #070B12.
  const sized = await sharp(buffer)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 3,
      background: { r: 7, g: 11, b: 18 },
    },
  })
    .composite([{ input: sized, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple_icon.png'))
  console.log('wrote apple_icon.png')
}

async function writeFavicon(buffer) {
  const sizes = [16, 32, 48]
  const pngBuffers = []
  for (const size of sizes) {
    pngBuffers.push(
      await sharp(buffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer(),
    )
  }

  // Build a minimal multi size ICO manually (BITMAPINFOHEADER + XOR + AND).
  const images = []
  for (let i = 0; i < sizes.length; i += 1) {
    const size = sizes[i]
    const { data, info } = await sharp(pngBuffers[i])
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const headerSize = 40
    const xorSize = size * size * 4
    const andRow = Math.ceil(size / 32) * 4
    const andSize = andRow * size
    const dib = Buffer.alloc(headerSize + xorSize + andSize)

    dib.writeUInt32LE(headerSize, 0)
    dib.writeInt32LE(size, 4)
    dib.writeInt32LE(size * 2, 8)
    dib.writeUInt16LE(1, 12)
    dib.writeUInt16LE(32, 14)
    dib.writeUInt32LE(0, 16)
    dib.writeUInt32LE(xorSize + andSize, 20)

    // BMP rows are bottom up, BGRA.
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const srcY = size - 1 - y
        const srcIndex = (srcY * info.width + x) * 4
        const dstIndex = headerSize + (y * size + x) * 4
        dib[dstIndex] = data[srcIndex + 2]
        dib[dstIndex + 1] = data[srcIndex + 1]
        dib[dstIndex + 2] = data[srcIndex]
        dib[dstIndex + 3] = data[srcIndex + 3]
      }
    }

    images.push({ size, dib })
  }

  const dirSize = 6 + images.length * 16
  let offset = dirSize
  const total = dirSize + images.reduce((sum, image) => sum + image.dib.length, 0)
  const ico = Buffer.alloc(total)
  ico.writeUInt16LE(0, 0)
  ico.writeUInt16LE(1, 2)
  ico.writeUInt16LE(images.length, 4)

  for (let i = 0; i < images.length; i += 1) {
    const image = images[i]
    const entry = 6 + i * 16
    ico[entry] = image.size >= 256 ? 0 : image.size
    ico[entry + 1] = image.size >= 256 ? 0 : image.size
    ico[entry + 2] = 0
    ico[entry + 3] = 0
    ico.writeUInt16LE(1, entry + 4)
    ico.writeUInt16LE(32, entry + 6)
    ico.writeUInt32LE(image.dib.length, entry + 8)
    ico.writeUInt32LE(offset, entry + 12)
    image.dib.copy(ico, offset)
    offset += image.dib.length
  }

  await sharp(pngBuffers[1]).toFile(path.join(publicDir, '_favicon32.png')).catch(() => {})
  const { writeFile } = await import('node:fs/promises')
  await writeFile(path.join(publicDir, 'favicon.ico'), ico)
  console.log('wrote favicon.ico')
}

async function main() {
  if (!(await exists(sourcePath))) {
    throw new Error(`Missing source logo at ${sourcePath}`)
  }

  await mkdir(publicDir, { recursive: true })
  const source = await sharp(sourcePath).ensureAlpha().png().toBuffer()
  const squared = await trimAndSquare(source)

  await writePng(squared, 'logo.png', 512)
  await writePng(squared, 'icon_192.png', 192)
  await writePng(squared, 'icon_512.png', 512)
  await writeAppleIcon(squared)
  await writeFavicon(squared)

  // Keep a copy of the processed square mark next to the source for audits.
  await copyFile(path.join(publicDir, 'logo.png'), path.join(root, 'assets', 'source', 'logo_square.png'))
  console.log('logo pipeline complete')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
