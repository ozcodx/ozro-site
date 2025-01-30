const fs = require('fs');
const readline = require('readline');

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
    
    return cleaned;
}

async function processFiles(namesFile, descFile, limit = 1000) {
    const names = new Map();
    const descriptions = new Map();
    let currentId = null;
    let currentDescription = [];
    
    // Leer archivo de nombres
    const nameLines = fs.readFileSync(namesFile, 'utf-8')
        .split('\n')
        .slice(0, limit);
    
    for (const line of nameLines) {
        if (line.trim()) {
            const [id, name] = line.split('#');
            if (id && name) {
                names.set(id.trim(), name.trim().replace(/_/g, ' '));
            }
        }
    }
    
    // Leer archivo de descripciones
    const descLines = fs.readFileSync(descFile, 'utf-8')
        .split('\n')
        .slice(0, limit);
    
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
    
    // Seleccionar un item aleatorio para mostrar como ejemplo
    const ids = Array.from(descriptions.keys());
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    
    if (randomId) {
        const exampleItem = {
            id: randomId,
            name: names.get(randomId),
            description: descriptions.get(randomId)
        };
        console.log('Ejemplo de item procesado:');
        console.log(JSON.stringify(exampleItem, null, 2));
    }
}

// Ejemplo de uso
processFiles(
    './data/idnum2itemdisplaynametable.txt',
    './data/idnum2itemdesctable.txt'
).catch(console.error); 