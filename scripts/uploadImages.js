const fs = require('fs').promises;
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc, collection, query, where, getDocs } = require('firebase/firestore');
require('dotenv').config({ path: '../.env' });

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
async function processFile(filePath, collectionName, imageField) {
  try {
    const dataUrl = await imageToDataUrl(filePath);
    if (!dataUrl) return null;

    // Usar el nombre del archivo (sin extensión) como ID
    const imageId = path.basename(filePath, path.extname(filePath));

    // Buscar el documento que tenga el campo id igual al imageId
    const q = query(collection(db, collectionName), where('id', '==', imageId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No existe documento con id: ${imageId}`);
      return null;
    }

    // Actualizar el primer documento encontrado
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      [imageField]: dataUrl,
      updated_at: new Date().toISOString()
    });

    return imageId;
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
async function uploadImages(collectionName, imageField, sourcePath) {
  if (!collectionName || !imageField || !sourcePath) {
    console.error('Uso: node uploadImages.js <collectionName> <imageField> <sourcePath>');
    console.error('Ejemplo: node uploadImages.js items icon_data ./images');
    process.exit(1);
  }

  try {
    // Determinar si es archivo o directorio
    const stats = await fs.stat(sourcePath);
    const filePaths = stats.isDirectory() 
      ? await processDirectory(sourcePath)
      : [sourcePath];

    console.log(`Procesando ${filePaths.length} archivo(s)...`);
    console.log(`Colección: ${collectionName}, Campo: ${imageField}`);

    // Procesar cada archivo
    let successCount = 0;
    let errorCount = 0;

    for (const filePath of filePaths) {
      const result = await processFile(filePath, collectionName, imageField);
      if (result) {
        console.log(`✅ Procesado: ${result}`);
        successCount++;
      } else {
        console.log(`❌ Error al procesar: ${path.basename(filePath)}`);
        errorCount++;
      }
    }

    console.log('\nResumen:');
    console.log(`✅ Éxitos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log('Proceso completado');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Ejecutar el script
const [,, collectionName, imageField, sourcePath] = process.argv;
uploadImages(collectionName, imageField, sourcePath); 