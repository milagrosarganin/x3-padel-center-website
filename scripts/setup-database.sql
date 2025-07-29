-- Eliminar triggers y funciones existentes (para empezar limpio)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS actualizar_stock(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS get_dashboard_stats(uuid) CASCADE;

-- Eliminar políticas RLS existentes
ALTER TABLE IF EXISTS arqueos_caja DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS proveedores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gastos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS negocios DISABLE ROW LEVEL SECURITY;

-- Eliminar tablas existentes en orden de dependencia inversa (CASCADE para dependencias)
DROP TABLE IF EXISTS arqueos_caja CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS negocios CASCADE;

-- Crear tabla de negocios
CREATE TABLE IF NOT EXISTS negocios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de usuarios (extendiendo auth.users)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'empleado' CHECK (rol IN ('admin', 'empleado')),
  negocio_id UUID REFERENCES negocios(id), -- Referencia a la tabla negocios
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  stock INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  precio DECIMAL(10,2) NOT NULL,
  proveedor VARCHAR(255),
  ultima_compra DATE,
  usuario_id UUID REFERENCES auth.users(id),
  negocio_id UUID REFERENCES negocios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  mesa VARCHAR(100) NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(20) CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
  estado VARCHAR(20) DEFAULT 'completada' CHECK (estado IN ('completada', 'cancelada')),
  usuario_id UUID REFERENCES auth.users(id),
  negocio_id UUID REFERENCES negocios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  metodo_pago VARCHAR(20) CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
  proveedor VARCHAR(255),
  comprobante VARCHAR(255),
  usuario_id UUID REFERENCES auth.users(id),
  negocio_id UUID REFERENCES negocios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  contacto VARCHAR(255),
  telefono VARCHAR(50),
  email VARCHAR(255),
  direccion TEXT,
  productos TEXT[],
  ultima_compra DATE,
  total_compras DECIMAL(10,2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  usuario_id UUID REFERENCES auth.users(id),
  negocio_id UUID REFERENCES negocios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de arqueos de caja
CREATE TABLE IF NOT EXISTS arqueos_caja (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL,
  hora_apertura TIME NOT NULL,
  hora_cierre TIME,
  monto_inicial DECIMAL(10,2) NOT NULL,
  ventas_efectivo DECIMAL(10,2) DEFAULT 0,
  ventas_tarjeta DECIMAL(10,2) DEFAULT 0,
  ventas_transferencia DECIMAL(10,2) DEFAULT 0,
  gastos DECIMAL(10,2) DEFAULT 0,
  monto_final DECIMAL(10,2),
  diferencia DECIMAL(10,2),
  estado VARCHAR(20) DEFAULT 'abierta' CHECK (estado IN ('abierta', 'cerrada')),
  usuario_id UUID REFERENCES auth.users(id),
  negocio_id UUID REFERENCES negocios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE arqueos_caja ENABLE ROW LEVEL SECURITY;

-- Políticas para negocios (solo admin puede ver/insertar/actualizar)
CREATE POLICY "Admins pueden ver negocios" ON negocios
  FOR SELECT USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin'));
CREATE POLICY "Admins pueden insertar negocios" ON negocios
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin'));
CREATE POLICY "Admins pueden actualizar negocios" ON negocios
  FOR UPDATE USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin'));

-- Políticas para usuarios
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON usuarios
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Los usuarios pueden insertar su propio perfil" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para productos (solo del mismo negocio)
CREATE POLICY "Los usuarios pueden ver productos de su negocio" ON productos
  FOR SELECT USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden insertar productos en su negocio" ON productos
  FOR INSERT WITH CHECK (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden actualizar productos de su negocio" ON productos
  FOR UPDATE USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden eliminar productos de su negocio" ON productos
  FOR DELETE USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Políticas similares para ventas, gastos, proveedores y arqueos
CREATE POLICY "Los usuarios pueden ver ventas de su negocio" ON ventas
  FOR SELECT USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden insertar ventas en su negocio" ON ventas
  FOR INSERT WITH CHECK (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden ver gastos de su negocio" ON gastos
  FOR SELECT USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden insertar gastos en su negocio" ON gastos
  FOR INSERT WITH CHECK (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden actualizar gastos de su negocio" ON gastos
  FOR UPDATE USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden eliminar gastos de su negocio" ON gastos
  FOR DELETE USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden ver proveedores de su negocio" ON proveedores
  FOR SELECT USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden insertar proveedores en su negocio" ON proveedores
  FOR INSERT WITH CHECK (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden actualizar proveedores de su negocio" ON proveedores
  FOR UPDATE USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden eliminar proveedores de su negocio" ON proveedores
  FOR DELETE USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden ver arqueos de su negocio" ON arqueos_caja
  FOR SELECT USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden insertar arqueos en su negocio" ON arqueos_caja
  FOR INSERT WITH CHECK (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );
CREATE POLICY "Los usuarios pueden actualizar arqueos de su negocio" ON arqueos_caja
  FOR UPDATE USING (
    negocio_id IN (
      SELECT negocio_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Función para crear usuario automáticamente después del registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_negocio_id UUID;
BEGIN
  -- Crear un nuevo negocio para el primer usuario que se registra
  INSERT INTO public.negocios (nombre, email)
  VALUES (NEW.raw_user_meta_data->>'nombre_negocio', NEW.email)
  RETURNING id INTO new_negocio_id;

  -- Insertar el nuevo usuario y asociarlo al negocio recién creado
  INSERT INTO public.usuarios (id, nombre, rol, negocio_id)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nombre', 'admin', new_negocio_id); -- El primer usuario es admin

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Función para actualizar stock cuando se hace una venta
CREATE OR REPLACE FUNCTION actualizar_stock(producto_id UUID, cantidad_vendida INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE productos
  SET stock = stock - cantidad_vendida,
      updated_at = NOW()
  WHERE id = producto_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats(negocio_uuid UUID)
RETURNS JSON AS $$
DECLARE
  ventas_hoy DECIMAL;
  ventas_semana DECIMAL;
  stock_bajo INTEGER;
  mesas_abiertas INTEGER;
BEGIN
  -- Ventas de hoy
  SELECT COALESCE(SUM(total), 0) INTO ventas_hoy
  FROM ventas
  WHERE negocio_id = negocio_uuid
    AND fecha = CURRENT_DATE
    AND estado = 'completada';

  -- Ventas de la semana
  SELECT COALESCE(SUM(total), 0) INTO ventas_semana
  FROM ventas
  WHERE negocio_id = negocio_uuid
    AND fecha >= CURRENT_DATE - INTERVAL '7 days'
    AND estado = 'completada';

  -- Productos con stock bajo
  SELECT COUNT(*) INTO stock_bajo
  FROM productos
  WHERE negocio_id = negocio_uuid
    AND stock <= stock_minimo;

  -- Mesas abiertas (esto lo puedes ajustar según tu lógica de mesas en `mostrador.tsx`)
  -- Por ahora, lo dejaremos en 0 o puedes contar las mesas con estado 'abierta' si las persistes en DB
  mesas_abiertas := 0; -- Placeholder, ajustar si las mesas se guardan en DB

  RETURN json_build_object(
    'ventas_hoy', ventas_hoy,
    'ventas_semana', ventas_semana,
    'stock_bajo', stock_bajo,
    'mesas_abiertas', mesas_abiertas
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
