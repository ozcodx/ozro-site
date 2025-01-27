const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, writeBatch, doc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.length < 2 || args.length > 3) {
  console.error('Uso: node uploadToFirestore.js <nombre_coleccion> <ruta_archivo> [--no-timestamp]');
  console.error('Ejemplo: node uploadToFirestore.js server-status ./data.json');
  console.error('Ejemplo con timestamp desactivado: node uploadToFirestore.js server-status ./data.json --no-timestamp');
  process.exit(1);
}

const [collectionName, filePath] = args;
const addTimestamp = !args.includes('--no-timestamp');

// Verificar que el archivo existe
const absoluteFilePath = path.resolve(filePath);
if (!fs.existsSync(absoluteFilePath)) {
  console.error(`Error: El archivo ${filePath} no existe`);
  process.exit(1);
}

// Verificar variables de entorno
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Error: Faltan las siguientes variables de entorno:');
  console.error(missingEnvVars.join(', '));
  process.exit(1);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para procesar los datos en lotes
async function processBatch(data, collectionRef) {
  let batch = writeBatch(db);
  let operationsCount = 0;
  let totalProcessed = 0;
  const batchPromises = [];

  for (const item of data) {
    const docData = addTimestamp 
      ? { ...item, timestamp: serverTimestamp() }
      : { ...item };
      
    const newDocRef = doc(collection(db, collectionName));
    batch.set(newDocRef, docData);
    operationsCount++;
    totalProcessed++;

    // Firestore tiene un límite de 500 operaciones por lote
    if (operationsCount === 500) {
      batchPromises.push(batch.commit());
      batch = writeBatch(db);
      operationsCount = 0;
      console.log(`Progreso: ${totalProcessed}/${data.length} documentos procesados...`);
    }
  }

  // Procesar el último lote si quedan operaciones pendientes
  if (operationsCount > 0) {
    batchPromises.push(batch.commit());
    console.log(`Procesando lote final de ${operationsCount} documentos...`);
  }

  await Promise.all(batchPromises);
  return totalProcessed;
}

// Función para cargar datos
async function uploadData() {
  try {
    console.log('Leyendo archivo...');
    const startTime = Date.now();
    const fileContent = fs.readFileSync(absoluteFilePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    const collectionRef = collection(db, collectionName);
    let totalDocuments = 0;
    
    // Si es un array, procesamos en lotes
    if (Array.isArray(jsonData)) {
      console.log(`Procesando array de ${jsonData.length} elementos...`);
      totalDocuments = await processBatch(jsonData, collectionRef);
    } 
    // Si es un objeto individual, lo agregamos directamente
    else {
      console.log('Procesando objeto individual...');
      const docData = addTimestamp 
        ? { ...jsonData, timestamp: serverTimestamp() }
        : { ...jsonData };
      
      const docRef = await addDoc(collectionRef, docData);
      console.log('Documento agregado exitosamente con ID:', docRef.id);
      totalDocuments = 1;
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convertir a segundos

    console.log('\n=== Resumen de la operación ===');
    console.log(`Colección: ${collectionName}`);
    console.log(`Archivo procesado: ${filePath}`);
    console.log(`Timestamp añadido: ${addTimestamp ? 'Sí' : 'No'}`);
    console.log(`Total documentos procesados: ${totalDocuments}`);
    console.log(`Tiempo total de ejecución: ${duration.toFixed(2)} segundos`);
    console.log(`Velocidad promedio: ${(totalDocuments / duration).toFixed(2)} documentos/segundo`);
    console.log('==============================');
    
    process.exit(0);
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    process.exit(1);
  }
}

// Ejecutar la función
console.log(`Iniciando carga de datos en la colección '${collectionName}'...`);
console.log(`Timestamp ${addTimestamp ? 'activado' : 'desactivado'}`);
uploadData(); 
