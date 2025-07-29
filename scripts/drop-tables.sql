-- Eliminar triggers y funciones primero
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Eliminar políticas RLS
ALTER TABLE IF EXISTS arqueos_caja DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS proveedores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gastos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS negocios DISABLE ROW LEVEL SECURITY;

-- Eliminar tablas en orden de dependencia inversa
DROP TABLE IF EXISTS arqueos_caja CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS negocios CASCADE;

-- Eliminar la función de actualización de stock si existe
DROP FUNCTION IF EXISTS actualizar_stock(uuid, integer);
DROP FUNCTION IF EXISTS get_dashboard_stats(uuid);
