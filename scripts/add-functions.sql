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

  -- Mesas abiertas (esto lo puedes ajustar según tu lógica)
  mesas_abiertas := 0; -- Por ahora en 0, puedes implementar lógica de mesas

  RETURN json_build_object(
    'ventas_hoy', ventas_hoy,
    'ventas_semana', ventas_semana,
    'stock_bajo', stock_bajo,
    'mesas_abiertas', mesas_abiertas
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
