const fs = require('fs');
const path = require('path');

// Directorio de imágenes
const citiesDir = path.join(__dirname, '../public/cities');
const outputFile = path.join(__dirname, '../public/cities/index.json');

// Obtener lista de archivos de imagen
const imageFiles = fs.readdirSync(citiesDir)
  .filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

// Escribir el archivo index.json
fs.writeFileSync(outputFile, JSON.stringify(imageFiles, null, 2));

console.log('Índice de imágenes generado con éxito.');
console.log('Imágenes encontradas:', imageFiles.length);
console.log('Archivos:', imageFiles); 