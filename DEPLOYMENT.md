# Guía de Deployment y Configuración

## Información para el Equipo de Hosting

### Requisitos Técnicos

**Stack Tecnológico:**
- Next.js 15 (App Router)
- React 19
- Node.js 18+ requerido
- Base de datos PostgreSQL (Supabase)
- Almacenamiento de archivos (Vercel Blob o similar)

### Variables de Entorno Requeridas

El hosting debe configurar las siguientes variables de entorno:

\`\`\`env
# Supabase - Base de Datos y Autenticación
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# Vercel Blob - Almacenamiento de Archivos (Videos, PDFs)
BLOB_READ_WRITE_TOKEN=tu_blob_token

# Opcional - Para desarrollo local
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### Configuración de Base de Datos

1. **Crear Base de Datos PostgreSQL:**
   - Puede ser Supabase, AWS RDS, o cualquier PostgreSQL compatible
   - Versión recomendada: PostgreSQL 14+

2. **Ejecutar Scripts de Migración:**
   \`\`\`bash
   # En orden:
   1. scripts/001_create_tables.sql
   2. scripts/002_seed_data.sql
   \`\`\`

3. **Crear Usuario Administrador:**
   - **NUEVO:** Visitar `/setup-admin` después de ejecutar los scripts
   - Completar el formulario con las credenciales deseadas
   - El sistema creará automáticamente el usuario admin
   - Credenciales por defecto sugeridas:
     - Email: `admin@empresa.com`
     - Password: `bejerman`

### Configuración de Almacenamiento

**Opción 1: Vercel Blob (Recomendado)**
- Crear cuenta en Vercel
- Habilitar Vercel Blob Storage
- Copiar el token de acceso

**Opción 2: Almacenamiento Propio**
- Si la empresa tiene su propio sistema de almacenamiento
- Modificar los archivos en `app/api/upload/` para usar su API

### Comandos de Instalación

\`\`\`bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start
\`\`\`

### Configuración del Servidor

**Requisitos del Servidor:**
- Node.js 18 o superior
- 512MB RAM mínimo (1GB recomendado)
- Puerto 3000 por defecto (configurable)

**Variables de Sistema:**
\`\`\`bash
NODE_ENV=production
PORT=3000
\`\`\`

### Seguridad

1. **Row Level Security (RLS):**
   - Ya configurado en los scripts SQL
   - Protege datos por usuario y rol

2. **Autenticación:**
   - Basada en JWT tokens de Supabase
   - Middleware protege rutas automáticamente

3. **CORS:**
   - Configurar dominio permitido en Supabase Dashboard
   - Settings → API → CORS

4. **Setup Admin:**
   - La ruta `/setup-admin` solo permite crear UN administrador
   - Después del primer admin, la ruta se bloquea automáticamente
   - Considerar bloquear esta ruta en producción después del setup inicial

### Dominios y URLs

Configurar en Supabase:
- **Site URL:** `https://tu-dominio.com`
- **Redirect URLs:** `https://tu-dominio.com/**`

### Monitoreo Recomendado

- Logs de aplicación (stdout/stderr)
- Métricas de base de datos (conexiones, queries)
- Uso de almacenamiento
- Errores de autenticación

### Backup

**Base de Datos:**
- Backup diario automático recomendado
- Retención: 30 días mínimo

**Archivos:**
- Backup de Blob storage según política de la empresa

### Soporte y Mantenimiento

**Actualizaciones:**
\`\`\`bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit
\`\`\`

**Logs:**
- Los logs se escriben en stdout
- Configurar agregador de logs según infraestructura

### Troubleshooting Común

1. **Error de conexión a base de datos:**
   - Verificar variables SUPABASE_URL y ANON_KEY
   - Verificar que la base de datos esté accesible

2. **Error de autenticación:**
   - Verificar que Site URL esté configurado en Supabase
   - Verificar Redirect URLs

3. **Error al subir archivos:**
   - Verificar BLOB_READ_WRITE_TOKEN
   - Verificar límites de tamaño de archivo

### Contacto para Desarrollo

Si necesitan modificaciones o tienen dudas técnicas sobre el código, el proyecto está listo para ser editado con cualquier IDE (VS Code, Cursor.ai, etc.)

---

## Pasos Rápidos de Inicio

1. Configurar variables de entorno
2. Ejecutar `npm install`
3. Ejecutar scripts SQL en orden (001, luego 002)
4. Visitar `/setup-admin` y crear el primer administrador
5. Iniciar sesión en `/login` con las credenciales creadas
6. Desde el panel admin, crear más usuarios según sea necesario

## Credenciales Iniciales

**Usuario Administrador:**
- Se crea desde `/setup-admin` en el primer inicio
- Credenciales sugeridas:
  - Email: `admin@empresa.com`
  - Password: `bejerman`

**IMPORTANTE:** Cambiar la contraseña después del primer login desde el panel de administración.
