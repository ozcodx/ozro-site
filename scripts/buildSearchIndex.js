const { subscribe } = require('diagnostics_channel');
const fs = require('fs');
const lunr = require('lunr');
const path = require('path');

// Funciones para preparar los datos
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

function cleanCondensed(condensedValue) {
    // extraer los id de categoria (cada potencia de 2 es una categoria)
    const categories = [];
    for (let i = 0; i < 32; i++) {
        if (condensedValue & (1 << i)) {
            categories.push(i);
        }

    }
    return categories;
}
// funciones para procesar los datos

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
                descriptions.set(currentId, {
                    raw: currentDescription.join('\n'),
                    cleaned: cleanDescription(currentDescription.join('\n'))
                });
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
        descriptions.set(currentId, {
            raw: currentDescription.join('\n'),
            cleaned: cleanDescription(currentDescription.join('\n'))
        });
    }


    return descriptions;
}

async function processIndex(documents) {
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
    return idx;
}

async function processDb(dbFile) {
    const items = new Map();
    const types = new Map();
    
    try {
        // read the db file
        const rawData = fs.readFileSync(dbFile, 'utf-8');
        const db = JSON.parse(rawData);

        // Verificar si db es un array directamente
        const itemsArray = Array.isArray(db) ? db : (db.items || []);

        // for each item in db, take the id as the key and format the item data.
        for (const item of itemsArray) {
            const id = item.id.toString();
            
            if (types.has(item.type)) {
                types.get(item.type).push(id);
            } else {
                types.set(item.type, [id]);
            }
            
            items.set(id, {
                codename1: item.name_english || '',
                codename2: item.name_japanese || '',
                type: item.type || 0,
                subtypes: item.subtype || 0,
                atk: item.atk || 0,
                matk: item.matk || 0,
                defence: item.defence || 0,
                price_buy: item.price_buy || 0,
                price_sell: item.price_sell || 0,
                weight: item.weight || 0,
                equip_jobs: cleanCondensed(item.equip_jobs || 0),
                equip_upper: cleanCondensed(item.equip_upper || 0),
                slots: item.slots || 0,
                equip_level_min: item.equip_level_min || 0,
                equip_locations: cleanCondensed(item.equip_locations || 0),
                script: item.script || '',
                unequip_script: item.unequip_script || '',
                weapon_level: item.weapon_level || 0,
                delay: item.delay || 0,
                range: item.range || 0,
                stack_amount: item.stack_amount || 0,
                stack_flag: item.stack_flag || 0,
                trade_flag: item.trade_flag || 0,
                trade_group: item.trade_group || 0,
                no_use_flag: item.nouse_flag || 0,
                no_use_group: item.nouse_group || 0,
            });
        }

        return { items, types };
    } catch (error) {
        console.error('Error procesando el archivo de base de datos:', error);
        return { items: new Map(), types: new Map() };
    }
}

async function processImages(folder) {
    if (!fs.existsSync(folder)) {
        console.log(`Carpeta ${folder} no encontrada, saltando procesamiento de imágenes`);
        return { batches: [], idMap: new Map() };
    }

    // se crean los batches de 1000 imagenes
    const batchSize = 1000;
    const batches = [];
    let currentBatch = new Map();
    const idToBatch = new Map(); // Mapa de ID -> número de batch
    
    try {
        const imageFiles = fs.readdirSync(folder);
        console.log(`Procesando ${imageFiles.length} imágenes de ${folder}`);

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            if (file.match(/\.(png|jpg|jpeg|gif)$/i)) {
                // el nombre de archivo sin extension es el id  
                const id = file.split('.')[0];
                // el contenido se pasa a base64 para construir el urldata
                const content = fs.readFileSync(path.join(folder, file));
                const base64 = content.toString('base64');
                const urlData = `data:image/png;base64,${base64}`;
                
                // verificar si el batch está lleno
                if (currentBatch.size >= batchSize) {
                    batches.push(currentBatch);
                    currentBatch = new Map();
                }
                
                currentBatch.set(id, urlData);
                idToBatch.set(id, batches.length); // El índice del próximo batch
                
                if ((i + 1) % 100 === 0) {
                    console.log(`Procesadas ${i + 1} imágenes...`);
                }
            }
        }
        
        // Agregar el último batch si contiene imágenes
        if (currentBatch.size > 0) {
            batches.push(currentBatch);
        }
        
        return { batches, idMap: idToBatch };
    } catch (error) {
        console.error(`Error procesando imágenes en ${folder}:`, error);
        return { batches: [], idMap: new Map() };
    }
}

// funcion para guardar archivos json
function writeJsonFile(filename, data) {
    // crear carpeta de salida si no existe
    const outputPath = './data';

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    let processedData = data;
    
    // Si es un Map, convertirlo a objeto
    if (data instanceof Map) {
        processedData = Object.fromEntries(data);
    }

    // Guardar el archivo
    fs.writeFileSync(
        path.join(outputPath, filename),
        JSON.stringify(processedData, null, 2)
    );
}

// funcion para procesar los archivos
async function processFiles(files) {
    const outputPath = './data';

    try {
        // 1. procesar los archivos de nombres y descripciones
        console.log('Procesando nombres...');
        const names = await processNames(files.namesFile);
        console.log('Procesando descripciones...');
        const descriptions = await processDescriptions(files.descFile);

        const documents = [];

        for (const [id, name] of names) {
            if (descriptions.has(id)) {
                documents.push({
                    id: id,
                    name: name,
                    searchdesc: descriptions.get(id).cleaned,
                    description: descriptions.get(id).raw
                });
            }
        }

        console.log(`Procesados ${documents.length} nombres y descripciones de items`);

        // construir el indice
        console.log('Construyendo índice de búsqueda...');
        const idx = await processIndex(documents);

        // remove searchdesc from documents
        documents.forEach(doc => {
            delete doc.searchdesc;
        });

        // write json files
        console.log('Guardando archivos...');
        writeJsonFile('search-index.json', idx);
        writeJsonFile('namedesc.json', documents);

        console.log(`Índice de búsqueda creado en ${outputPath}/search-index.json`);
        console.log(`Documentos guardados en ${outputPath}/namedesc.json`);

        // 2. Procesar los archivos de base de datos
        console.log('Procesando base de datos...');
        const { items, types } = await processDb(files.dbFile);
        
        writeJsonFile('items.json', items);
        writeJsonFile('types.json', types);
        
        console.log(`Base de datos guardada en ${outputPath}/items.json`);
        console.log(`Tipos guardados en ${outputPath}/types.json`);

        // 3. Procesar los archivos de imágenes
        console.log('\nProcesando imágenes...');
        
        console.log('Procesando iconos...');
        const { batches: iconBatches, idMap: iconIdMap } = await processImages(files.iconsFolder);
        
        console.log('Procesando ilustraciones...');
        const { batches: illustrationBatches, idMap: illustrationIdMap } = await processImages(files.illustrationsFolder);

        // Crear el descriptor de imágenes
        const imageDescriptor = {
            icons: Object.fromEntries(iconIdMap),
            illustrations: Object.fromEntries(illustrationIdMap)
        };

        // Guardar el descriptor
        writeJsonFile('images_descriptor.json', imageDescriptor);
        console.log(`Descriptor de imágenes guardado en ${outputPath}/images_descriptor.json`);

        // Guardar los batches
        console.log('\nGuardando batches de imágenes...');
        
        for (let i = 0; i < iconBatches.length; i++) {
            writeJsonFile(`icons_batch_${i}.json`, iconBatches[i]);
            console.log(`Batch de iconos ${i} guardado (${iconBatches[i].size} imágenes)`);
        }

        for (let i = 0; i < illustrationBatches.length; i++) {
            writeJsonFile(`illustrations_batch_${i}.json`, illustrationBatches[i]);
            console.log(`Batch de ilustraciones ${i} guardado (${illustrationBatches[i].size} imágenes)`);
        }

        console.log('\nProcesamiento completado con éxito!');

    } catch (error) {
        console.error('Error en el procesamiento:', error);
    }
}

// Ejecutar el proceso
processFiles({
    namesFile: './data/input/idnum2itemdisplaynametable.txt',
    descFile: './data/input/idnum2itemdesctable.txt',
    dbFile: './data/input/item_db.json',
    iconsFolder: './data/input/icon',
    illustrationsFolder: './data/input/illustration'
}).catch(console.error); 

/* data structures:

search-index.json:
{
    "index": {
        "fields": ["name", "description"]
    }
}

namedesc.json:
{
    "id": "1",
    "name": "item name",
    "description": "item description"
}

items.json:
{
    "id": "1",
    "codename1": "item name",
    "codename2": "item name",
    "type": 1,
    "subtypes": 1,
    "atk": 1,
    "matk": 1,
    "defence": 1,
    "price_buy": 1,
    "price_sell": 1,
    "weight": 1,
    "equip_jobs": 1, // the number is the power of 2 that represents the job
    "equip_upper": 1, // the number is the power of 2 that represents the restriction
    "slots": 1,
    "equip_level_min": 1,
    "equip_locations": 1, // the number is the power of 2 that represents the location
    "script": 1,
    "unequip_script": 1,

    "weapon_level": 1,
    "delay": 1,
    "range": 1,
    "stack_amount": 1,
    "stack_flag": 1,
    "trade_flag": 1,
    "trade_group": 1,
    "no_use_flag": 1,
    "no_use_group": 1
}

    images_descriptor.json:
{
    "icons": {
        "1": 0, // the key is the id, the value is the batch number
        "2": 0
    },
    "illustrations": {
        "1": 1, // the key is the id, the value is the batch number
        "2": 2
    }
}

icons_batch_0.json:
{
    "1": "urldata", // the key is the id, the value is the urldata
    "2": "urldata"
}


illustrations_batch_0.json:
{
    "1": "urldata", // the key is the id, the value is the urldata
    "2": "urldata"
}


*/
