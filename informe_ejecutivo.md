# Informe Ejecutivo - Proyecto Devtree

## Resumen General

Proyecto **Devtree** es una aplicación Node.js con Express y TypeScript para gestionar un árbol de links (similar a Linktree). Incluye:
- Backend con Express + TypeScript (tipado fuerte)
- Base de datos MongoDB con Mongoose (validaciones automáticas)
- Sistema de autenticación y registro de usuarios
- Gestión de variables de entorno con dotenv (seguridad)
- Manejo centralizado de rutas y controladores (handlers)
- Logging coloreado en consola para mejor legibilidad

---

## Estado Actual del Proyecto

### Dependencias Instaladas

**Producción (runtime):**
- `express` (^5.2.1) - Framework web
- `mongoose` (^9.1.5) - ODM para MongoDB
- `colors` - Colorear salida en consola
- `dotenv` - Cargar variables de entorno desde `.env`

**Desarrollo (devDependencies):**
- `nodemon` (^3.1.11) - Reload automático en cambios
- `typescript` (^5.9.3) - Compilador TypeScript
- `ts-node` (^10.9.2) - Ejecutar TypeScript sin compilar
- `@types/express` - Tipos para Express

### Estructura del Proyecto

```
src/
├── index.ts              # Punto de entrada (startup del servidor)
├── server.ts             # Configuración de Express
├── router.ts             # Rutas/endpoints definidas
├── config/
│   └── db.ts             # Conexión a MongoDB (Mongoose)
├── handlers/
│   └── index.ts          # Controladores/lógica de negocio
└── models/
    └── User.ts           # Schema/modelo de Usuario (Mongoose)
```

---

## Detalles Técnicos por Componente

### 1. **src/index.ts** - Punto de Entrada (Startup)

```typescript
import colors from 'colors';
import server from './server';

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(colors.magenta.bold(`Server is running on: ${port}`));
});
```

**¿Qué hace?**
- Importa la instancia de Express desde `server.ts`
- Lee el puerto desde variable de entorno `PORT` (o usa 3000 por defecto)
- Inicia el servidor con `.listen()`
- Muestra un mensaje coloreado en magenta

**¿Por qué se hace así?**
- **Separación de responsabilidades:** El startup está separado de la configuración de Express
- **Variables de entorno:** Permite cambiar puerto en producción sin tocar código
- **Logging visual:** Colors mejora la legibilidad de los logs (importante en desarrollo)
- **Modularidad:** El archivo es corto y claro, solo inicia el servidor

---

### 2. **src/server.ts** - Configuración de Express

```typescript
import express from 'express';
import 'dotenv/config';
import router from './router';
import {connectDB} from './config/db';

const app = express();
connectDB();

//Leer datos de form
app.use(express.json());

app.use('/', router)

export default app;
```

**¿Qué hace?**
- Crea la instancia de Express
- Carga variables de entorno desde `.env` con `import 'dotenv/config'`
- Conecta a la base de datos al iniciar
- Configura middleware para parsear JSON
- Registra las rutas desde `router.ts`

**¿Por qué se hace así?**
- **Middleware antes de rutas:** `express.json()` debe estar antes de las rutas para que funcione
- **dotenv en el servidor:** Se carga aquí para que `process.env` esté disponible globalmente
- **Conexión a BD al startup:** Asegura que la BD esté disponible antes de procesar requests
- **Exportar app:** Separa la configuración de Express del startup, facilitando tests

---

### 3. **src/router.ts** - Rutas de la Aplicación

```typescript
import { Router } from 'express';
import { createAccount } from './handlers';

const router = Router();
// autenticacion y registro de users

router.post('/auth/register', createAccount);

export default router;
```

**¿Qué hace?**
- Define las rutas/endpoints de la API
- Importa `createAccount` desde `handlers/index.ts`
- Ruta POST para registro: `/auth/register` → llama `createAccount`

**¿Por qué se hace así?**
- **Router separado:** Mantiene las rutas organizadas en un archivo específico
- **Handlers importados:** La lógica está en `handlers`, no en el router (patrón MVC)
- **Rutas modulares:** Facilita agregar más rutas en el futuro
- **POST para registro:** HTTP POST es el estándar para crear recursos (usuarios)

---

### 4. **src/handlers/index.ts** - Controladores (Lógica de Negocio)

```typescript
import User from "../models/User";

export const createAccount = async (req, res) => {
  const user = new User(req.body);

  await user.save();
  res.send({message: 'User registered successfully'});
}
```

**¿Qué hace?**
- Recibe datos del request (`req.body` contiene `name`, `email`, `password`)
- Crea un nuevo documento Usuario
- Lo guarda en MongoDB (`.save()`)
- Retorna un JSON con mensaje de éxito

**¿Por qué se hace así?**
- **Separación de lógica:** La lógica de negocio está separada de las rutas
- **Async/await:** Maneja operaciones asincrónicas de BD correctamente
- **Validación automática:** Mongoose valida antes de guardar (ver modelo User)
- **Response JSON:** Retorna datos en JSON para consumo de frontend

**Mejoras futuras:**
- ⚠️ Añadir try/catch para manejar errores (email duplicado, validación)
- ⚠️ Hashear password antes de guardar
- ⚠️ No retornar el usuario con contraseña en la respuesta

---

### 5. **src/models/User.ts** - Schema de Base de Datos

```typescript
import mongoose, {Schema} from "mongoose";

export interface IUser {
    name: string;
    email: string;
    password: string;
}

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }

})

const User = mongoose.model<IUser >('User', userSchema);
export default User;
```

**¿Qué hace?**
- Define la estructura de documentos User en MongoDB
- Especifica tipos de campos y validaciones
- Interfaz TypeScript `IUser` para tipado en el código
- Modelo exportado para usarlo en handlers

**Validaciones implementadas:**

| Validación | Campo | Propósito |
|-----------|-------|----------|
| `required: true` | name, email, password | Campo obligatorio (no puede estar vacío) |
| `trim: true` | name, email | Elimina espacios al inicio/final |
| `unique: true` | email | No permite emails duplicados en la BD |

**¿Por qué se hace así?**
- **Schema**: Define la estructura de datos en BD (evita datos inconsistentes)
- **TypeScript Interface**: Proporciona autocompletado y seguridad de tipos en el código
- **Mongoose Model**: Facilita operaciones CRUD automáticamente
- **Validaciones Mongoose**: Se aplican automáticamente en `.save()` (no necesita validación manual)
- **Unique email**: Evita registros duplicados (fundamental para autenticación)

**Validaciones faltantes que se pueden agregar:**
- `hashPassword()` - Hashear password con bcrypt antes de guardar
- `minlength` - Longitud mínima de password (ej: 8 caracteres)
- `email` validator - Validar formato de email con regex
- `timestamps` - Agregar `createdAt` y `updatedAt` automáticamente

---

### 6. **src/config/db.ts** - Conexión a MongoDB

```typescript
import colors from 'colors';
import mongoose from "mongoose";
import User, {IUser}  from '../models/User';

export const connectDB = async () => {
  try {
    const {connection} = await mongoose.connect(process.env.MONGO_URI)
    const URL = `${connection.host}:${connection.port}`
    console.log(colors.magenta.bold(`DB connected in ${URL}`));

  }catch (error) {
    console.log(colors.bgRed.white.bold(`DB connection error: ${error}`));
  }
};
```

**¿Qué hace?**
- Conecta a MongoDB usando la URI desde variable de entorno
- Extrae host y puerto de la conexión
- Muestra log con información de conexión
- Maneja errores con try/catch

**¿Por qué se hace así?**
- **process.env.MONGO_URI**: Se carga desde `.env` (**seguridad** - no hardcodear credenciales)
- **Async/await**: La conexión es asincrónica (no bloquea el proceso)
- **Try/catch**: Maneja errores de conexión gracefully (si falla BD, el server no crashea sin aviso)
- **Logging**: Informa si conexión fue exitosa o falló
- **Error handling coloreado**: Fondo rojo para errores, fácil de notar en producción

---

## Datos de Acceso a la Base de Datos

**MongoDB Atlas (Cloud):**
- **Usuario:** izzobee21
- **Contraseña:** KjveMzeExDN2VUil
- **Nombre de BD:** linktree_node_typescript
- **Cluster:** cluster0.7dl6y7d.mongodb.net
- **URI de conexión:** `mongodb+srv://izzobee21:KjveMzeExDN2VUil@cluster0.7dl6y7d.mongodb.net/linktree_node_typescript`

**Ubicación en código:**
- Variables de entorno se cargan desde archivo `.env` (no incluido en Git por seguridad)
- La conexión se realiza en `src/config/db.ts` usando `process.env.MONGO_URI`

**⚠️ Recomendación crítica de seguridad:**
- Crear archivo `.env` en la raíz del proyecto con:
  ```
  PORT=3000
  MONGO_URI=mongodb+srv://izzobee21:KjveMzeExDN2VUil@cluster0.7dl6y7d.mongodb.net/linktree_node_typescript
  ```
- Añadir `.env` a `.gitignore` para NO pushear credenciales
- Nunca compartir credenciales en Slack, email, o repositorio público

---

## Configuración TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ESNext"],
    "target": "ESNext",
    "moduleResolution": "NodeNext",
    "module": "NodeNext",
    "strict": false,
    "sourceMap": true,
    "esModuleInterop": true,
    "declaration": true
  },
  "include": ["src/**/*.ts"]
}
```

**Explicación de opciones clave:**

| Opción | Valor | Razón |
|--------|-------|-------|
| `outDir` | `./dist` | Carpeta donde se compilan archivos `.js` |
| `rootDir` | `./src` | Carpeta raíz de código fuente TypeScript |
| `target` | `ESNext` | Usa características modernas de JavaScript |
| `module` | `NodeNext` | Genera módulos ES (import/export) compatibles con Node.js moderno |
| `moduleResolution` | `NodeNext` | Resuelve módulos siguiendo el estándar de Node.js |
| `strict` | `false` | Relaxado (recomendado activar a `true` en producción) |
| `sourceMap` | `true` | Genera `.map` para debugging en desarrollo |
| `esModuleInterop` | `true` | Mejora interoperabilidad entre CommonJS y ES Modules |

---

## Scripts Disponibles (package.json)

```json
"scripts": {
  "dev": "nodemon src/index.ts",
  "build": "tsc",
  "start": "node dist/index.ts"
}
```

| Script | Comando | Propósito |
|--------|---------|-----------|
| `npm run dev` | `nodemon src/index.ts` | Ejecutar en desarrollo con hot-reload automático |
| `npm run build` | `tsc` | Compilar TypeScript a JavaScript en `dist/` |
| `npm run start` | `node dist/index.ts` | Ejecutar versión compilada (para producción) |

**¿Por qué cada script?**
- **dev:** Nodemon recarga automáticamente cuando cambias código (sin reiniciar manual)
- **build:** Compila TS a JS antes de desplegar a producción
- **start:** Ejecuta la versión compilada (más rápida que ts-node)

---

## Flujo de Ejecución - Cómo Funciona el Proyecto

```
1. npm run dev
   ↓
2. nodemon inicia src/index.ts
   ↓
3. src/index.ts importa server desde src/server.ts
   ↓
4. src/server.ts:
   - Carga variables de entorno (.env)
   - Conecta a MongoDB (connectDB)
   - Configura Express (middleware JSON)
   - Registra rutas desde router.ts
   ↓
5. Server escucha en puerto 3000
   ↓
6. Cliente hace POST a /auth/register
   ↓
7. router.ts → createAccount handler
   ↓
8. createAccount crea User en MongoDB
   ↓
9. Respuesta JSON al cliente
```

---

## Cambios Realizados - Resumen Cronológico

### Fase 1: Inicialización y TypeScript
- ✅ `npm init` - Inicializar proyecto
- ✅ Instalar Express, TypeScript, ts-node, nodemon
- ✅ Crear `tsconfig.json` con configuración NodeNext
- ✅ Crear `src/index.ts` con tipos Express

### Fase 2: Configuración de Base de Datos
- ✅ Instalar Mongoose
- ✅ Instalar dotenv (variables de entorno)
- ✅ Crear `src/config/db.ts` con conexión a MongoDB
- ✅ Crear `src/models/User.ts` con schema y validaciones

### Fase 3: Estructura de Rutas y Handlers
- ✅ Crear `src/server.ts` con middleware Express
- ✅ Crear `src/router.ts` con rutas definidas
- ✅ Crear `src/handlers/index.ts` con lógica de registro

### Fase 4: Mejoras de UX (User Experience)
- ✅ Instalar `colors` para logging coloreado
- ✅ Añadir logs descriptivos en consola
- ✅ Mostrar información de conexión a BD

---

## Endpoints Implementados

### POST /auth/register
**Descripción:** Registra un nuevo usuario

**Request (JSON):**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "micontraseña123"
}
```

**Response (Éxito):**
```json
{
  "message": "User registered successfully"
}
```

**Validaciones aplicadas (automáticas por Mongoose):**
- `name` - Requerido, se trimean espacios
- `email` - Requerido, único en BD, se trimean espacios
- `password` - Requerido

**¿Por qué Mongoose valida automáticamente?**
- Cuando llamamos `.save()`, Mongoose verifica que los campos obligatorios existan
- Si falta algo, lanza error automáticamente (no necesita validación manual)
- Evita datos corruptos en la BD

**Mejoras futuras necesarias:**
- ❌ **Hashear password:** Usar bcrypt antes de guardar (seguridad crítica)
- ❌ **Validación email:** Verificar formato con regex o validador
- ❌ **Password fuerte:** Requerir mayúsculas, números, símbolos
- ❌ **Error handling:** Manejo de errores específicos (email duplicado, etc)
- ❌ **No devolver password:** La respuesta nunca debe incluir la contraseña

---

## Variables de Entorno (.env)

**Archivo a crear en la raíz del proyecto:**

```env
# Puerto del servidor
PORT=3000

# Conexión a MongoDB
MONGO_URI=mongodb+srv://izzobee21:KjveMzeExDN2VUil@cluster0.7dl6y7d.mongodb.net/linktree_node_typescript
```

**¿Por qué usa variables de entorno?**
- 🔒 **Seguridad:** Credenciales no aparecen en código fuente
- 🌍 **Flexibilidad:** Mismo código en dev, staging, producción
- 📦 **Facilidad:** Fácil cambiar valores sin tocar código
- 🛡️ **Git:** `.env` en `.gitignore` no sube al repositorio

---

## Ventajas de la Arquitectura Actual

| Ventaja | Beneficio |
|---------|-----------|
| **TypeScript** | Errores detectados en compilación, autocompletado |
| **Mongoose** | Validaciones automáticas, schemas tipados |
| **Separación de capas** | server, router, handlers, models - fácil de mantener |
| **Variables de entorno** | Seguridad, flexibilidad entre ambientes |
| **nodemon + ts-node** | Desarrollo rápido sin compilación manual |
| **Logging coloreado** | Mejor diagnostico de errores |

---

## Próximos Pasos Recomendados

### Urgentes (Seguridad):
1. **Hashear passwords** - Usar `bcrypt` antes de `.save()`
   ```bash
   npm install bcrypt
   npm install -D @types/bcrypt
   ```
   ```typescript
   import bcrypt from 'bcrypt';
   user.password = await bcrypt.hash(user.password, 10);
   ```

2. **Manejo de errores en handlers** - try/catch para DB errors
   ```typescript
   try {
     await user.save();
     res.json({ message: 'User created' });
   } catch (error) {
     res.status(400).json({ error: error.message });
   }
   ```

3. **Validaciones adicionales en schema**
   ```typescript
   email: {
     type: String,
     match: /@/,  // validación simple
     lowercase: true  // normalizar emails
   },
   password: {
     type: String,
     minlength: 8  // mínimo 8 caracteres
   }
   ```

### Importantes (Funcionalidad):
1. ✅ **Endpoint de login** - Autenticar usuarios existentes
2. ✅ **Middleware de autenticación** - JWT tokens para proteger rutas
3. ✅ **Más modelos** - Link, Profile, Settings
4. ✅ **Endpoints CRUD** - GET, PUT, DELETE para recursos

### Opcionales (Calidad de código):
1. 📝 **Tipos más específicos** - `createAccount` necesita tipos Request/Response
2. 🧪 **Tests unitarios** - Jest para testing automatizado
3. 📝 **Validación de entrada** - Usar `joi` o `zod` para validar datos
4. 🛡️ **CORS y seguridad** - Helmet, CORS headers, rate limiting

---

## Comandos Útiles de Terminal

```powershell
# Instalar todas las dependencias
npm install

# Ejecutar en desarrollo (hot-reload)
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar versión compilada
npm start

# Instalar nueva dependencia
npm install nombre-paquete

# Instalar dependencia de desarrollo
npm install -D nombre-paquete

# Limpiar carpeta dist
rm -r dist

# Ver logs de npm
npm run dev -- --verbose
```

---

## Resumen de Avances Realizados

✅ **Arquitectura:** Proyecto bien estructurado con separación de responsabilidades  
✅ **Base de datos:** MongoDB conectada con Mongoose y validaciones  
✅ **TypeScript:** Tipado fuerte en todo el código  
✅ **Variables de entorno:** Seguridad implementada con dotenv  
✅ **Logging:** Mensajes coloreados para mejor debugging  
✅ **Handlers:** Lógica separada del router  
✅ **Modelos:** Schema User con validaciones automáticas  

**Estado actual:** ⚠️ **Beta funcional** - Proyecto funcional pero necesita mejoras críticas de seguridad (passwords hasheados) y manejo robusto de errores.

**Puntuación de calidad:** 6.5/10
- ✅ Estructura: 8/10
- ✅ Seguridad: 4/10 (passwords sin hashear)
- ✅ Error handling: 3/10 (sin try/catch)
- ✅ Testing: 0/10 (sin tests)
- ✅ Documentación: 7/10 (bien documentado)

---

*Última actualización: 5 de Febrero, 2026*
*Autor: Isabella Manjarres*
*Proyecto: Devtree (Linktree Clone en TypeScript)*
