import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));

const palette = {
  transparent: [0, 0, 0, 0],
  huskDark: [43, 109, 39, 255],
  husk: [63, 156, 57, 255],
  huskLight: [114, 196, 87, 255],
  kernelDark: [215, 159, 24, 255],
  kernel: [242, 191, 46, 255],
  kernelLight: [255, 224, 114, 255],
  outline: [112, 74, 13, 255],
  shine: [255, 248, 204, 255],
};

const pixelArt = [
  '................',
  '......oo........',
  '.....oggo.......',
  '....ogyygo......',
  '...ogyyyygo.....',
  '...ggyyyyyg.....',
  '..ogyyyyyyygo...',
  '..ggyyyyyyyyg...',
  '.ogyyyyyyyyyygo..',
  '.ggyyyyyyyyyyyg..',
  '.ggyyyyyyyyyyyg..',
  '..ggyyyyyyyyyg...',
  '..sgggyyyyggg...',
  '...ssggggggs....',
  '....sssgggss....',
  '......sss.......',
];

const colorMap = {
  '.': palette.transparent,
  'o': palette.outline,
  'g': palette.husk,
  's': palette.huskDark,
  'l': palette.huskLight,
  'y': palette.kernel,
  'd': palette.kernelDark,
  'h': palette.kernelLight,
  'w': palette.shine,
};

function applyHighlights(grid) {
  const mutable = grid.map((row) => row.split(''));
  const highlights = [
    [4, 6],
    [5, 7],
    [6, 7],
    [7, 8],
    [8, 8],
    [9, 9],
  ];

  const huskLights = [
    [2, 7],
    [3, 6],
    [12, 4],
    [13, 5],
  ];

  for (const [y, x] of highlights) {
    if (mutable[y]?.[x] === 'y') mutable[y][x] = 'h';
  }

  for (const [y, x] of huskLights) {
    if (mutable[y]?.[x] === 'g') mutable[y][x] = 'l';
  }

  return mutable.map((row) => row.join(''));
}

function upscale(grid, size) {
  const source = applyHighlights(grid);
  const sourceSize = source.length;
  const rgba = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const srcY = Math.floor((y * sourceSize) / size);
      const srcX = Math.floor((x * sourceSize) / size);
      const key = source[srcY][srcX];
      const [r, g, b, a] = colorMap[key] ?? palette.transparent;
      const offset = (y * size + x) * 4;

      rgba[offset] = r;
      rgba[offset + 1] = g;
      rgba[offset + 2] = b;
      rgba[offset + 3] = a;
    }
  }

  return rgba;
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);

  const crcBuffer = Buffer.alloc(4);
  const crcValue = crc32(Buffer.concat([typeBuffer, data]));
  crcBuffer.writeUInt32BE(crcValue, 0);

  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function createPng(size) {
  const rgba = upscale(pixelArt, size);
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);

  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * stride, y * stride + stride);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', deflateSync(raw)),
    createChunk('IEND', Buffer.alloc(0)),
  ]);
}

function createIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry[0] = size === 256 ? 0 : size;
  entry[1] = size === 256 ? 0 : size;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

const faviconPng = createPng(48);
const appleTouchIcon = createPng(180);
const androidIcon = createPng(192);
const faviconIco = createIco(createPng(64), 64);

writeFileSync(join(publicDir, 'favicon.png'), faviconPng);
writeFileSync(join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);
writeFileSync(join(publicDir, 'android-chrome-192x192.png'), androidIcon);
writeFileSync(join(publicDir, 'favicon.ico'), faviconIco);