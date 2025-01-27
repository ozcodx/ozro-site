const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
require('dotenv').config({ path: '../.env' });

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Verificar que todas las variables de entorno estén definidas
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
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
    
    // Nombre de la colección donde se guardarán los datos
    const collectionName = 'server-status';
    
    // Iterar sobre los datos y subirlos a Firestore
    for (const [key, value] of Object.entries(jsonData)) {
      await setDoc(doc(db, collectionName, key), value);
      console.log(`Documento ${key} cargado exitosamente`);
    }
    
    console.log('Todos los datos han sido cargados exitosamente');
  } catch (error) {
    console.error('Error al cargar los datos:', error);
  }
}

// Ejecutar la función
uploadData(); 
