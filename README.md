# Plataforma de Capacitación Corporativa

Sistema de gestión de aprendizaje (LMS) para capacitación interna de empleados.

## Características

- Sistema de autenticación con roles (Admin, Instructor, Estudiante)
- Gestión de cursos, módulos y lecciones
- Soporte para videos (YouTube y cargados) y PDFs
- Seguimiento de progreso por estudiante
- Panel administrativo completo
- Diseño responsive y moderno

## Tecnologías

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase (Auth + Database)
- Vercel Blob (Storage)

## Instalación Local

1. Clonar el repositorio
2. Instalar dependencias:
   \`\`\`bash
   npm install
   \`\`\`

3. Configurar variables de entorno (ver `.env.example`)

4. Ejecutar scripts de base de datos en Supabase

5. Iniciar servidor de desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`

## Deployment

Ver `DEPLOYMENT.md` para instrucciones completas de deployment y configuración para el equipo de hosting.

## Credenciales Iniciales

- Email: `admin@empresa.com`
- Password: `bejerman`

## Estructura del Proyecto

\`\`\`
├── app/                    # Páginas y rutas de Next.js
│   ├── admin/             # Panel administrativo
│   ├── course/            # Visualización de cursos
│   ├── dashboard/         # Dashboard de estudiantes
│   └── login/             # Autenticación
├── components/            # Componentes React reutilizables
├── lib/                   # Utilidades y configuración
│   ├── supabase/         # Clientes de Supabase
│   └── types.ts          # Tipos TypeScript
└── scripts/              # Scripts SQL de base de datos
\`\`\`

## Soporte

Para dudas técnicas o modificaciones, el código está completamente documentado y listo para ser editado con cualquier IDE.
