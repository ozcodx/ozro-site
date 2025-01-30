const fs = require('fs');
const lunr = require('lunr');

// Función para limpiar la descripción
function cleanDescription(description) {
    // Eliminar códigos de color (^XXXXXX)
    let cleaned = description.replace(/\^[0-9A-Fa-f]{6}/g, '');
    
    // Eliminar líneas específicas
    const linesToRemove = [
        /Type:\s*.+/,
        /Position:\s*.+/,
        /Defence:\s*\d+/,
        /Attack:\s*\d+/,
        /Refinable:\s*.+/,
        /Quantity:\s*\d+/,
        /Contain:\s*.+/,
        /Level Requirement:\s*\d+/,
        /Weight:\s*\d+/,
        /Heal:\s*.+/
    ];
    
    cleaned = cleaned.split('\n')
        .filter(line => !linesToRemove.some(regex => regex.test(line)))
        .join('. ');
    
    // Eliminar caracteres repetidos
    cleaned = cleaned.replace(/[:.\_]{2,}/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    // Convertir a minúsculas para que el índice sea case insensitive
    return cleaned.toLowerCase();
}

function cleanName(name) {
    // Reemplazar _ por espacios y pasar a minúsculas
    return name.replace(/_/g, ' ').toLowerCase();
}

async function processNames(namesFile) {
    const names = new Map();
    const nameLines = fs.readFileSync(namesFile, 'utf-8').split('\n');
    
    for (const line of nameLines) {
        if (line.trim()) {
            const [id, name] = line.split('#');
            if (id && name) {
                names.set(id.trim(), cleanName(name.trim()));
            }
        }
    }
    return names;
}

async function processDescriptions(descFile) {
    const descriptions = new Map();
    let currentId = null;
    let currentDescription = [];

    // Leer archivo de descripciones
    const descLines = fs.readFileSync(descFile, 'utf-8').split('\n');
    
    for (const line of descLines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '#') {
            // Si encontramos una línea que es solo #, es el fin de una descripción
            if (currentId && currentDescription.length > 0) {
                descriptions.set(currentId, cleanDescription(currentDescription.join('\n')));
            }
            currentDescription = [];
        } else if (trimmedLine.endsWith('#')) {
            // Es una línea de ID
            currentId = trimmedLine.slice(0, -1).trim();
        } else if (currentId && trimmedLine) {
            // Agregar línea a la descripción actual
            currentDescription.push(trimmedLine);
        }
    }

    // Procesar último item si existe
    if (currentId && currentDescription.length > 0) {
        descriptions.set(currentId, cleanDescription(currentDescription.join('\n')));
    }

    return descriptions;
}

async function processFiles(files) {
    const names = await processNames(files.namesFile);
    const descriptions = await processDescriptions(files.descFile);
    // Crear array de documentos para el índice
    const documents = [];

    for (const [id, name] of names) {
        if (descriptions.has(id)) {
            documents.push({
                id: id,
                name: name,
                description: descriptions.get(id)
            });
        }
    }

    console.log(`Procesados ${documents.length} items`);

    // Construir el índice
    const idx = lunr(function () {
        this.ref('id');
        this.field('name', { boost: 10 }); // Dar más peso al nombre
        this.field('description');

        // Agregar cada documento al índice
        documents.forEach(function (doc) {
            this.add(doc);
        }, this);
    });

    // Guardar el índice y los documentos
    const outputPath = './data';
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    // Guardar el índice
    fs.writeFileSync(
        `${outputPath}/search-index.json`,
        JSON.stringify(idx)
    );

    // Guardar los documentos (necesarios para mostrar resultados)
    fs.writeFileSync(
        `${outputPath}/documents.json`,
        JSON.stringify(documents)
    );

    console.log(`Índice de búsqueda creado en ${outputPath}/search-index.json`);
    console.log(`Documentos guardados en ${outputPath}/documents.json`);
}

// Ejecutar el proceso
processFiles({
    namesFile: './data/idnum2itemdisplaynametable.txt',
    descFile: './data/idnum2itemdesctable.txt'
}).catch(console.error); 