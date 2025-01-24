# 🚀 React + TypeScript Base Project

Base para proyectos web usando React 18, TypeScript y Firebase. Diseñada para iniciar rápidamente nuevos proyectos con una estructura limpia y moderna.

## ⚡️ Características

- React 18
- TypeScript
- React Router v6
- CSS Modules
- Estructura de carpetas optimizada
- Configuración de ESLint y Prettier
- Componentes base reutilizables

## 📁 Estructura del Proyecto

src/
├── components/ # Componentes reutilizables de la aplicación
│   ├── Main.tsx
│   └── NotFound.tsx
├── styles/ # Archivos CSS globales
│   └── App.css
├── App.tsx # Configuración de rutas y componente principal
└── main.tsx # Punto de entrada de la aplicación

## 🚀 Inicio Rápido

1. **Clona el repositorio**

```bash
git clone https://github.com/forjadecodigo/base-project.git
cd base-project
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**
```bash
cp .env.example .env
```
Edita el archivo `.env` con tus credenciales

4. **Inicia el servidor de desarrollo**
```bash
npm run dev
```

## 📦 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo en `http://localhost:5173`
- `npm run build`: Construye la aplicación para producción en `/dist`
- `npm run preview`: Vista previa de la build de producción
- `npm run deploy`: Despliega la aplicación en Firebase Hosting

## 🔧 Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Copia las credenciales en tu archivo `.env`
3. Instala Firebase CLI: `npm install -g firebase-tools`
4. Inicia sesión: `firebase login`
5. Inicializa Firebase: `firebase init`

## 📄 Licencia

MIT License - ver el archivo [LICENSE](LICENSE) para más detalles

---

Desarrollado por [OzCodeX](https://github.com/ozcodex) para [Forja de Código](https://forjadecodigo.com) ⚒️
