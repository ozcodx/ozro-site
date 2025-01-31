const fs = require('fs');
const lunr = require('lunr');

// DEBUG: readline for debugging
const readline = require('readline');

// notes about the item info:
// https://github.com/ozcodex/hercules/blob/b975675e62dfa9cf7ddfd5017bfabeee68bf91ba/doc/item_db.txt#L259



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
    // Crear array de documentos solo con el id
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

    console.log(`Índice de búsqueda creado en ${outputPath}/search-index.json`);
}

// DEBUG: funcion para realizar la busqueda
async function searchIndex(query) {
    const idx = lunr.Index.load(JSON.parse(fs.readFileSync('./data/search-index.json', 'utf-8')));
    
    // Realizar la búsqueda
    const results = idx.search(query);

    // Parsear los resultados para obtener el id y el score a dos decimales
    const parsedResults = results.map(result => ({
        id: result.ref,
        score: result.score.toFixed(2)
    }));

    return parsedResults;
}

// DEBUG: Crear una interfaz de readline para la entrada del usuario
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// DEBUG: Función para pedir input por consola
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// DEBUG: Función para probar la búsqueda
async function testSearch() {
    const query = await askQuestion("Ingrese su consulta: ");

    const results = await searchIndex(query);
    console.log(`Resultados de búsqueda para "${query}":`);
    results.forEach(result => {
        console.log(`${result.id} - ${result.score}%`);
    });
    rl.close(); // Cerrar la interfaz de readline
}


// Ejecutar el proceso
processFiles({
    namesFile: './data/idnum2itemdisplaynametable.txt',
    descFile: './data/idnum2itemdesctable.txt'
}).then(() => {
    // DEBUG: Probar la búsqueda después de que se complete el proceso
    testSearch();
}).catch(console.error); 