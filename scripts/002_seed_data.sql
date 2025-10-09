-- Insert sample courses for each technical area
INSERT INTO courses (id, title, description, category, is_published, thumbnail_url)
VALUES 
  -- Técnico
  ('550e8400-e29b-41d4-a716-446655440001', 
   'Bejerman Técnico - Nivel Básico', 
   'Introducción a las funcionalidades técnicas del sistema Bejerman. Aprende consultas, reportes y gestión de datos.',
   'tecnico',
   true,
   '/placeholder.svg?height=400&width=600'),
  
  ('550e8400-e29b-41d4-a716-446655440002',
   'Bejerman Técnico - Nivel Avanzado',
   'Domina las herramientas avanzadas, automatizaciones y configuraciones técnicas del sistema.',
   'tecnico',
   true,
   '/placeholder.svg?height=400&width=600'),
  
  -- FLEX
  ('550e8400-e29b-41d4-a716-446655440003',
   'FLEX - Gestión Flexible',
   'Aprende a utilizar el módulo FLEX para gestión flexible de recursos y procesos.',
   'flex',
   true,
   '/placeholder.svg?height=400&width=600'),
  
  -- SAAS
  ('550e8400-e29b-41d4-a716-446655440004',
   'SAAS - Sistema de Administración',
   'Capacitación completa en el módulo SAAS para administración y servicios.',
   'saas',
   true,
   '/placeholder.svg?height=400&width=600'),
  
  -- Sueldos y Jornales
  ('550e8400-e29b-41d4-a716-446655440005',
   'Sueldos y Jornales - Completo',
   'Gestión integral de sueldos, jornales, liquidaciones y reportes laborales.',
   'sueldos_jornales',
   true,
   '/placeholder.svg?height=400&width=600');

-- Insert modules for Técnico Básico
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', 
   '550e8400-e29b-41d4-a716-446655440001',
   'Introducción al Sistema',
   'Conoce la interfaz y las funcionalidades principales',
   1),
  ('660e8400-e29b-41d4-a716-446655440002',
   '550e8400-e29b-41d4-a716-446655440001',
   'Consultas y Búsquedas',
   'Aprende a realizar consultas efectivas en el sistema',
   2),
  ('660e8400-e29b-41d4-a716-446655440003',
   '550e8400-e29b-41d4-a716-446655440001',
   'Reportes Básicos',
   'Genera reportes estándar y personalizados',
   3);

-- Insert modules for Técnico Avanzado
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440011',
   '550e8400-e29b-41d4-a716-446655440002',
   'Automatizaciones',
   'Configura procesos automáticos y tareas programadas',
   1),
  ('660e8400-e29b-41d4-a716-446655440012',
   '550e8400-e29b-41d4-a716-446655440002',
   'Integraciones',
   'Conecta Bejerman con otros sistemas',
   2);

-- Insert modules for FLEX
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440021',
   '550e8400-e29b-41d4-a716-446655440003',
   'Fundamentos FLEX',
   'Conceptos básicos del módulo FLEX',
   1),
  ('660e8400-e29b-41d4-a716-446655440022',
   '550e8400-e29b-41d4-a716-446655440003',
   'Gestión de Recursos',
   'Administra recursos de forma flexible',
   2);

-- Insert modules for SAAS
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440031',
   '550e8400-e29b-41d4-a716-446655440004',
   'Introducción SAAS',
   'Primeros pasos en el módulo SAAS',
   1),
  ('660e8400-e29b-41d4-a716-446655440032',
   '550e8400-e29b-41d4-a716-446655440004',
   'Administración Avanzada',
   'Funciones avanzadas de administración',
   2);

-- Insert modules for Sueldos y Jornales
INSERT INTO modules (id, course_id, title, description, order_index)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440041',
   '550e8400-e29b-41d4-a716-446655440005',
   'Liquidación de Sueldos',
   'Proceso completo de liquidación',
   1),
  ('660e8400-e29b-41d4-a716-446655440042',
   '550e8400-e29b-41d4-a716-446655440005',
   'Jornales y Horas Extra',
   'Gestión de jornales y cálculo de horas',
   2),
  ('660e8400-e29b-41d4-a716-446655440043',
   '550e8400-e29b-41d4-a716-446655440005',
   'Reportes Laborales',
   'Genera reportes para AFIP y auditorías',
   3);

-- Insert sample lessons for Técnico Básico
INSERT INTO lessons (module_id, title, description, type, content_url, duration_minutes, order_index, is_published)
VALUES 
  -- Módulo 1: Introducción
  ('660e8400-e29b-41d4-a716-446655440001',
   'Bienvenida al Sistema Bejerman',
   'Introducción al curso y objetivos de aprendizaje',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   10,
   1,
   true),
  ('660e8400-e29b-41d4-a716-446655440001',
   'Navegación y Menús',
   'Aprende a navegar por las diferentes secciones',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   15,
   2,
   true),
  ('660e8400-e29b-41d4-a716-446655440001',
   'Manual Técnico - Parte 1',
   'Documentación oficial del sistema',
   'pdf',
   '/placeholder.pdf',
   null,
   3,
   true),
  
  -- Módulo 2: Consultas
  ('660e8400-e29b-41d4-a716-446655440002',
   'Consultas Básicas',
   'Realiza consultas simples en el sistema',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   20,
   1,
   true),
  ('660e8400-e29b-41d4-a716-446655440002',
   'Filtros y Búsqueda Avanzada',
   'Utiliza filtros para búsquedas precisas',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   25,
   2,
   true),
  
  -- Módulo 3: Reportes
  ('660e8400-e29b-41d4-a716-446655440003',
   'Reportes Estándar',
   'Genera reportes predefinidos del sistema',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   18,
   1,
   true),
  ('660e8400-e29b-41d4-a716-446655440003',
   'Personalización de Reportes',
   'Crea reportes personalizados según tus necesidades',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   22,
   2,
   true);

-- Insert lessons for other courses (abbreviated for brevity)
INSERT INTO lessons (module_id, title, description, type, content_url, duration_minutes, order_index, is_published)
VALUES 
  -- Técnico Avanzado
  ('660e8400-e29b-41d4-a716-446655440011',
   'Configuración de Automatizaciones',
   'Aprende a configurar procesos automáticos',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   30,
   1,
   true),
  
  -- FLEX
  ('660e8400-e29b-41d4-a716-446655440021',
   'Introducción a FLEX',
   'Conceptos fundamentales del módulo',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   15,
   1,
   true),
  
  -- SAAS
  ('660e8400-e29b-41d4-a716-446655440031',
   'Primeros Pasos en SAAS',
   'Configuración inicial del módulo',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   20,
   1,
   true),
  
  -- Sueldos y Jornales
  ('660e8400-e29b-41d4-a716-446655440041',
   'Proceso de Liquidación',
   'Paso a paso para liquidar sueldos',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   35,
   1,
   true),
  ('660e8400-e29b-41d4-a716-446655440042',
   'Cálculo de Jornales',
   'Gestión de jornales y horas trabajadas',
   'youtube',
   'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
   28,
   1,
   true);
