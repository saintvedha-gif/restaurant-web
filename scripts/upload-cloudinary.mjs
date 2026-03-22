import { v2 as cloudinary } from 'cloudinary';
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const REQUIRED_ENV_VARS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missingVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
if (missingVars.length > 0) {
  console.error('Faltan variables de entorno requeridas:', missingVars.join(', '));
  process.exit(1);
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const folder = process.env.CLOUDINARY_FOLDER || 'restaurant-web';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const rootDir = process.cwd();
const imagesDir = path.join(rootDir, 'assets-source', 'images');
const outputFile = path.join(rootDir, 'src', 'data', 'cloudinaryImages.ts');

const files = (await readdir(imagesDir))
  .filter((file) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(file))
  .filter((file) => !file.startsWith('borrar-'))
  .sort((a, b) => a.localeCompare(b, 'es'));

if (files.length === 0) {
  console.error('No se encontraron imágenes en assets-source/images.');
  process.exit(1);
}

console.log(`Subiendo ${files.length} imágenes a Cloudinary en la carpeta "${folder}"...`);

const imageMap = {};

for (const fileName of files) {
  const localPath = path.join(imagesDir, fileName);
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  const publicId = `${folder}/${baseName}`.replace(/\\/g, '/');

  const uploadResult = await cloudinary.uploader.upload(localPath, {
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
  });

  const optimizedUrl = cloudinary.url(uploadResult.public_id, {
    secure: true,
    fetch_format: 'auto',
    quality: 'auto',
  });

  imageMap[fileName] = optimizedUrl;
  console.log(`OK ${fileName}`);
}

const outputContent =
  '// Archivo autogenerado por scripts/upload-cloudinary.mjs\n' +
  '// No editar manualmente: vuelve a correr el script si cambian las imágenes.\n\n' +
  `export const CLOUDINARY_IMAGE_MAP: Record<string, string> = ${JSON.stringify(imageMap, null, 2)};\n`;

await writeFile(outputFile, outputContent, 'utf8');

console.log(`\nListo. Mapa generado en: ${path.relative(rootDir, outputFile)}`);
console.log('Ahora ejecuta npm run build para validar.');
