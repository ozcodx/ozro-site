const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const fs = require('fs');
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

// Función para cargar datos
async function uploadData() {
  try {
    // Leer el archivo JSON
    const jsonData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    
    // Agregar timestamp al objeto
    const dataWithTimestamp = {
      ...jsonData,
      timestamp: serverTimestamp()
    };

    // Agregar documento a la colección server-status con ID autogenerado
    const docRef = await addDoc(collection(db, 'server-status'), dataWithTimestamp);
    console.log('Documento agregado exitosamente con ID:', docRef.id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    process.exit(1);
  }
}

// Ejecutar la función
uploadData(); 
