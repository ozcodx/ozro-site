# 🎮 OzRo - Sitio Web

Sitio web para el servidor privado familiar OzRo. Este servidor es solo accesible dentro de nuestra VPN privada.

## 🚀 Inicio Rápido

1. **Clona el repositorio**
```bash
git clone https://github.com/ozcodex/ozro-site.git
cd ozro-site
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**
   - Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   - Edita el archivo `.env` con tus credenciales

### Configuración de MongoDB

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) o usa tu MongoDB local
2. Crea un nuevo cluster (si usas Atlas)
3. Obtén tu URI de conexión
4. Configura las siguientes variables en tu archivo `.env`:
   ```
   VITE_MONGODB_URI=tu_uri_de_mongodb
   VITE_MONGODB_DB_NAME=nombre_de_tu_base_de_datos
   VITE_MONGODB_USER=tu_usuario_mongodb
   VITE_MONGODB_PASSWORD=tu_contraseña_mongodb
   ```

### Configuración de Firebase (Opcional)

Si planeas usar Firebase además de MongoDB:

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Obtén las credenciales de tu proyecto
3. Configura las variables de Firebase en tu archivo `.env`

## Estructura de la Base de Datos

### Colección de Objetos
La colección `items` debe tener la siguiente estructura:
```typescript
interface Item {
  id: string;
  name_english: string;
  description: string;
  type: string;
  atk: number;
  matk: number;
  defence: number;
  price_buy: number;
  price_sell: number;
  image_data: string; // URL de datos en base64
}
```

### Colección de Monstruos
La colección `mobs` debe tener la siguiente estructura:
```typescript
interface Mob {
  id: string;
  iName: string;
  map: string;
  level: number;
  hp: number;
  exp: number;
  job_exp: number;
  is_boss: boolean;
  is_miniboss: boolean;
  image_data: string; // URL de datos en base64
}
```

## Desarrollo Local

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 📖 Documentación Técnica

Para detalles sobre la estructura del proyecto, configuración y guías técnicas, consulta el repositorio base:
[base-react-firebase-site](https://github.com/ozcodx/base-react-firebase-site)

---

Desarrollado por [OzCodeX](https://github.com/ozcodex) 🎮
