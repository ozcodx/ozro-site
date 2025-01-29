const fs = require('fs').promises;
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

// Función para convertir imagen a dataURL
async function imageToDataUrl(filePath) {
  try {
    const data = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const mimeType = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }[extension] || 'application/octet-stream';

    return `data:${mimeType};base64,${data.toString('base64')}`;
  } catch (error) {
    console.error(`Error al procesar ${filePath}:`, error);
    return null;
  }
}

// Función para procesar un archivo
async function processFile(filePath, collection) {
  try {
    const dataUrl = await imageToDataUrl(filePath);
    if (!dataUrl) return null;

    // Usar el nombre del archivo (sin extensión) como ID
    const id = path.basename(filePath, path.extname(filePath));

    return {
      id,
      image_data: dataUrl,
      updated_at: new Date()
    };
  } catch (error) {
    console.error(`Error al procesar archivo ${filePath}:`, error);
    return null;
  }
}

// Función para procesar un directorio
async function processDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
    });

    return imageFiles.map(file => path.join(dirPath, file));
  } catch (error) {
    console.error('Error al leer directorio:', error);
    return [];
  }
}

// Función principal
async function uploadImages(collectionName, sourcePath) {
  if (!collectionName || !sourcePath) {
    console.error('Uso: node uploadImages.js <collectionName> <sourcePath>');
    process.exit(1);
  }

  try {
    // Conectar a MongoDB
    const client = new MongoClient(process.env.VITE_MONGODB_URI);
    await client.connect();
    console.log('Conectado a MongoDB');

    const db = client.db(process.env.VITE_MONGODB_DB_NAME);
    const collection = db.collection(collectionName);

    // Determinar si es archivo o directorio
    const stats = await fs.stat(sourcePath);
    const filePaths = stats.isDirectory() 
      ? await processDirectory(sourcePath)
      : [sourcePath];

    console.log(`Procesando ${filePaths.length} archivo(s)...`);

    // Procesar cada archivo
    for (const filePath of filePaths) {
      const imageData = await processFile(filePath, collection);
      if (!imageData) continue;

      // Actualizar o insertar en MongoDB
      await collection.updateOne(
        { id: imageData.id },
        { $set: imageData },
        { upsert: true }
      );

      console.log(`Procesado: ${imageData.id}`);
    }

    console.log('Proceso completado');
    await client.close();

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Ejecutar el script
const [,, collectionName, sourcePath] = process.argv;
uploadImages(collectionName, sourcePath); 