import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('public/sheep.svg')
for (const size of [192, 512]) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(`public/icon-${size}.png`)
  console.log(`icon-${size}.png OK`)
}
