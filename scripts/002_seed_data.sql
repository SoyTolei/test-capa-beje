-- Insert sample course for training
INSERT INTO courses (id, title, description, is_published, thumbnail_url)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 
   'Capacitación - Nivel Básico', 
   'Curso introductorio para nuevos empleados. Aprenderás las funcionalidades básicas, navegación y mejores prácticas.',
   true,
   '/placeholder.svg?height=400&width=600');

-- Insert modules for the course
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', 
   '550e8400-e29b-41d4-a716-446655440000',
   'Introducción al Sistema',
   'Conoce la interfaz y las funcionalidades principales',
   1),
  ('660e8400-e29b-41d4-a716-446655440002',
   '550e8400-e29b-41d4-a716-446655440000',
   'Gestión de Documentos',
   'Aprende a crear, editar y gestionar documentos',
   2),
  ('660e8400-e29b-41d4-a716-446655440003',
   '550e8400-e29b-41d4-a716-446655440000',
   'Búsqueda y Reportes',
   'Domina las herramientas de búsqueda avanzada y generación de reportes',
   3);

-- Insert sample lessons
INSERT INTO lessons (module_id, title, description, type, content_url, duration_minutes, order_index, is_published)
VALUES 
  -- Module 1 lessons
  ('660e8400-e29b-41d4-a716-446655440001',
   'Bienvenida y Visión General',
   'Introducción al curso y objetivos de aprendizaje',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   10,
   1,
   true),
  ('660e8400-e29b-41d4-a716-446655440001',
   'Navegación Básica',
   'Aprende a navegar por las diferentes secciones',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   15,
   2,
   true),
  ('660e8400-e29b-41d4-a716-446655440001',
   'Manual de Usuario - Parte 1',
   'Documentación oficial del sistema',
   'pdf',
   '/placeholder.pdf',
   null,
   3,
   true),
  -- Module 2 lessons
  ('660e8400-e29b-41d4-a716-446655440002',
   'Crear Nuevo Documento',
   'Paso a paso para crear documentos',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   20,
   1,
   true),
  ('660e8400-e29b-41d4-a716-446655440002',
   'Edición y Formato',
   'Herramientas de edición y formato de documentos',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   18,
   2,
   true),
  -- Module 3 lessons
  ('660e8400-e29b-41d4-a716-446655440003',
   'Búsqueda Avanzada',
   'Utiliza filtros y operadores para búsquedas precisas',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   25,
   1,
   true),
  ('660e8400-e29b-41d4-a716-446655440003',
   'Generación de Reportes',
   'Crea reportes personalizados y exporta datos',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   22,
   2,
   true);

-- NOTA: El usuario administrador se crea desde /setup-admin
-- No es necesario insertar manualmente en esta tabla
