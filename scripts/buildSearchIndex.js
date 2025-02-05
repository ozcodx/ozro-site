const { subscribe } = require('diagnostics_channel');
const fs = require('fs');
const lunr = require('lunr');
const path = require('path');
const cheerio = require('cheerio');
const axios = require('axios');

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
    if (!fs.existsSync(namesFile)) {
        console.error('Error: El archivo de nombres no existe');
        return new Map();
    }

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
    if (!fs.existsSync(descFile)) {
        console.error('Error: El archivo de descripciones no existe');
        return new Map();
    }

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

async function processItemIndex(documents) {
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

async function processMobIndex(documents) {
    const idx = lunr(function () {
        this.ref('id');
        this.field('name', { boost: 10 }); // Dar más peso al nombre
        this.field('name2');

        // Agregar cada documento al índice
        documents.forEach(function (doc) {
            this.add(doc);
        }, this);
    });
    return idx;
}

async function processItemDb(dbFile) {
    const items = new Map();

    const types = new Map();

    if (!fs.existsSync(dbFile)) {
        console.error('Error: El archivo de base de datos no existe');
        return { items, types };
    }
    
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

async function processMobDb(dbFile) {
    const mobs = new Map();

    console.log(`Procesando mobs...`);

    if (!fs.existsSync(dbFile)) {
        console.error('Error: El archivo de base de datos no existe');
        return { mobs };
    }

    try {
        // read the db file
        console.log(`Leyendo archivo de base de datos...`);
        const rawData = fs.readFileSync(dbFile, 'utf-8');
        const db = JSON.parse(rawData);

        console.log(`Procesando ${db.length} mobs...`);

        // for each mob in db, take the id as the key and format the mob data.

        for (const mob of db) {
            const id = mob.ID.toString();
            const mobData = {
                id: id,
                name: mob.iName,
                name2: mob.kName,
                sprite: mob.Sprite,
                hp: mob.HP,
                lvl: mob.LV,
                def: mob.DEF,
                mdef: mob.MDEF,
                atk: Math.min(mob.ATK1, mob.ATK2) + " - " + Math.max(mob.ATK1, mob.ATK2),

                //stats
                str: mob.STR,
                agi: mob.AGI,
                vit: mob.VIT,
                int: mob.INT,
                dex: mob.DEX,
                luk: mob.LUK,
                //experience
                exp: mob.EXP,
                jexp: mob.JEXP,
                mexp: mob.MEXP, //mvp experience
                // characteristics
                element: mob.Element,
                size: mob.Scale,
                race: mob.Race,

                mode: cleanCondensed(mob.Mode),
            }
            // add the mob drop
            const dropTable = [];
            for (let i = 0; i < 10; i++) {
                if (mob["Drop" + i + "id"] !== 0 && mob["Drop" + i + "per"] !== 0) {
                    dropTable.push({
                        type: "normal",
                        id: mob["Drop" + i + "id"],
                        per: mob["Drop" + i + "per"]
                    });
                }
            }
            // check the card drop
            if (mob["DropCardid"] !== 0 && mob["DropCardper"] !== 0) {
                dropTable.push({
                    type: "card",
                    id: mob["DropCardid"],
                    per: mob["DropCardper"]
                });
            }
            // check the mvp drop
            for (let i = 1; i <= 3; i++) {
                if (mob["MVP" + i + "id"] !== 0 && mob["MVP" + i + "per"] !== 0) {
                    dropTable.push({
                        type: "mvp",
                        id: mob["MVP" + i + "id"],
                        per: mob["MVP" + i + "per"]

                    });
                }
            }
            // add the drop table to the mob data
            mobData.drop = dropTable;

            mobs.set(id, mobData);
        }
        return mobs;
    } catch (error) {
        console.error('Error procesando el archivo de base de datos:', error);
        return { mobs: new Map() };
    }
}

async function processItemImages(folder) {
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

// mini scrapper tool
// using https://nn.ai4rei.net/dev/npclist/?q={sprite}&qq=search&s=kro as alternative source


async function searchSpriteWeb(sprite, folder) {
    console.log(`Buscando sprite ${sprite} en la web...`);
    // Pequeño timeout para evitar limitaciones de tasa
    await new Promise(resolve => setTimeout(resolve, 300));
    const baseUrl = 'https://nn.ai4rei.net/dev/npclist/';
    const url = `${baseUrl}?q=${sprite}&qq=search&s=kro`;
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        const $ = cheerio.load(response.data);
        const contentMatrix = $('#content-matrix');
        const firstDiv = contentMatrix.children().first();
        const img = firstDiv.find('img');
        const src = img.attr('src');

        // remove "i/" at beginning of the string
        // and remove .gif at the end of the string
        const imageUrl = src.replace('i/', '').replace('.gif', '');
        console.log(`Encontrado sprite ${sprite} en la web: ${imageUrl}`);

        return imageUrl;
    } catch (error) {
        console.error(`Error al buscar o descargar el sprite: ${error.message}`);
        return undefined;
    }

}



async function processMobImages(database, folder) {
    if (!fs.existsSync(folder)) {
        console.log(`Carpeta ${folder} no encontrada, saltando procesamiento de imágenes`);
        return { batches: [], idMap: new Map() };
    }
    
    const batchSize = 1000;
    const batches = [];
    let currentBatch = new Map();
    const idToBatch = new Map();
    const missingSprites = [];

    try {
        const imageFiles = fs.readdirSync(folder);
        console.log(`Procesando ${imageFiles.length} imágenes de ${folder}`);

        //loop through the database and get the id and the sprite name
        for (const [id, mob] of database) {
            const sprite = mob.sprite;

            // read the file using the sprite as name and gif as extension
            let file;
            try {
                file = fs.readFileSync(path.join(folder, sprite + '.gif'));
            } catch (error) {
                console.log(`Sprite ${sprite} no encontrado, buscando en la web...`);
                const result = await searchSpriteWeb(sprite, folder);
                if (result) {
                    try { 

                        file = fs.readFileSync(path.join(folder, result + '.gif'));
                    } catch (error) {
                        // save the sprite name
                        missingSprites.push(sprite);
                        continue;
                    }
                } else {
                    // save the sprite name
                    missingSprites.push(sprite);
                    continue;
                }
            }

            const base64 = file.toString('base64');
            const urlData = `data:image/gif;base64,${base64}`;

            if (currentBatch.size >= batchSize) {
                batches.push(currentBatch);
                currentBatch = new Map();
            }

            // Agregar el sprite al batch actual
            currentBatch.set(id, urlData);
            idToBatch.set(id, batches.length);
        }

        // Agregar el último batch si contiene imágenes
        if (currentBatch.size > 0) {
            batches.push(currentBatch);
        }
        
        // save the missing sprites
        fs.writeFileSync(path.join(folder, 'missing_sprites.txt'), missingSprites.join('\n'));
        console.log(`Mobs con sprites faltantes: ${missingSprites.length}`);

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

async function processMobFiles(files) {
    console.log('Procesando archivos de mobs...');
    const outputPath = './data';

    try {
        // 1. procesar base de datos
        console.log('Procesando base de datos...');
        const mobs = await processMobDb(files.mob_dbFile);

        // 2. construir indice de búsqueda
        console.log('Construyendo índice de búsqueda...');
        const idx = await processMobIndex(mobs);

        // 3. procesar imágenes
        console.log('Procesando imágenes...');
        const { batches: mobBatches, idMap: mobIdMap } = await processMobImages(mobs, files.mob_spritesFolder);

        // crear descriptor de imágenes
        const imageDescriptor = Object.fromEntries(mobIdMap);

        // guardar batches de imágenes 
        console.log('Guardando batches de imágenes...');
        for (let i = 0; i < mobBatches.length; i++) {
            writeJsonFile(`mob_sprites_batch_${i}.json`, mobBatches[i]);
            console.log(`Batch de imágenes ${i} guardado (${mobBatches[i].size} imágenes)`);
        }


        // 5. guardar archivos
        console.log('Guardando archivos...');
        writeJsonFile('mobs.json', mobs);
        writeJsonFile('mob-search-index.json', idx);
        writeJsonFile('mob-images-descriptor.json', imageDescriptor);

        console.log('\nProcesamiento completado con éxito!');

    } catch (error) {
        console.error('Error en el procesamiento:', error);
    }
}


// funcion para procesar los archivos
async function processItemFiles(files) {
    const outputPath = './data';

    try {
        // 1. procesar los archivos de nombres y descripciones
        console.log('Procesando nombres...');
        const names = await processNames(files.item_namesFile);
        console.log('Procesando descripciones...');
        const descriptions = await processDescriptions(files.item_descFile);


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
        const idx = await processItemIndex(documents);

        // remove searchdesc from documents
        documents.forEach(doc => {
            delete doc.searchdesc;
        });

        // write json files
        console.log('Guardando archivos...');
        writeJsonFile('item-search-index.json', idx);
        writeJsonFile('item-namedesc.json', documents);


        console.log(`Índice de búsqueda creado en ${outputPath}/item-search-index.json`);
        console.log(`Documentos guardados en ${outputPath}/item-namedesc.json`);


        // 2. Procesar los archivos de base de datos
        console.log('Procesando base de datos...');
        const { items, types } = await processItemDb(files.item_dbFile);
        

        writeJsonFile('items.json', items);
        writeJsonFile('item-types.json', types);
        
        console.log(`Base de datos guardada en ${outputPath}/items.json`);
        console.log(`Tipos guardados en ${outputPath}/types.json`);

        // 3. Procesar los archivos de imágenes
        console.log('\nProcesando imágenes...');
        
        console.log('Procesando iconos...');
        const { batches: iconBatches, idMap: iconIdMap } = await processItemImages(files.item_iconsFolder);
        

        console.log('Procesando ilustraciones...');
        const { batches: illustrationBatches, idMap: illustrationIdMap } = await processItemImages(files.item_illustrationsFolder);


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

async function processFiles(files) {
    //await processItemFiles(files);
    await processMobFiles(files);
}

// Ejecutar el proceso
processFiles({
    // item files
    item_namesFile: './data/input/idnum2itemdisplaynametable.txt',
    item_descFile: './data/input/idnum2itemdesctable.txt',
    item_dbFile: './data/input/item_db.json',
    item_iconsFolder: './data/input/icon',
    item_illustrationsFolder: './data/input/illustration',
    // mobs files
    mob_dbFile: './data/input/mob_db.json',
    //mob_spritesFolder: './data/input/sprites'
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

mob-search-index.json:
{
    "index": {
        "fields": ["name", "name2"]
    }
}   

mob-images-descriptor.json:
{
    "1": 0, // the key is the id, the value is the batch number
    "2": 0
}


mob_sprites_batch_0.json:
{
    "1": "urldata", // the key is the id, the value is the urldata
    "2": "urldata"
}   

mobs.json:
{
    "id": "1",
    "name": "mob name",
    "name2": "mob name",
    "sprite": "mob sprite",
    "hp": 1,
    "lvl": 1,
    "def": 1,
    "mdef": 1,
    "atk": 1,
    "str": 1,
    "agi": 1,
    "vit": 1,
    "int": 1,
    "dex": 1,
    "luk": 1,
    "exp": 1,
    "jexp": 1,
    "mexp": 1,
    "element": 1,
    "size": 1,
    "race": 1,
    "drop": [
        {
            "id": 1,
            "type": "can be normal, card or mvp",
            "per": 1,
        }
    ]
}


*/
