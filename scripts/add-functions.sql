-- Function to get user's business name
CREATE OR REPLACE FUNCTION get_business_name(user_id uuid)
RETURNS text AS $$
  SELECT business_name FROM public.users WHERE id = user_id;
$$ LANGUAGE sql STABLE;

-- Function to get user's full name
CREATE OR REPLACE FUNCTION get_full_name(user_id uuid)
RETURNS text AS $$
  SELECT full_name FROM public.users WHERE id = user_id;
$$ LANGUAGE sql STABLE;

-- Function to calculate total sales for a user
CREATE OR REPLACE FUNCTION get_total_sales(p_user_id uuid)
RETURNS numeric AS $$
DECLARE
  total numeric;
BEGIN
  SELECT SUM(total_amount) INTO total
  FROM public.sales
  WHERE user_id = p_user_id;
  RETURN COALESCE(total, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to calculate total expenses for a user
CREATE OR REPLACE FUNCTION get_total_expenses(p_user_id uuid)
RETURNS numeric AS $$
DECLARE
  total numeric;
BEGIN
  SELECT SUM(amount) INTO total
  FROM public.expenses
  WHERE user_id = p_user_id;
  RETURN COALESCE(total, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get current stock of a product
CREATE OR REPLACE FUNCTION get_product_stock(p_product_id uuid)
RETURNS integer AS $$
  SELECT stock FROM public.products WHERE id = p_product_id;
$$ LANGUAGE sql STABLE;

-- Function to update product stock after a sale
CREATE OR REPLACE FUNCTION update_product_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_sale_item_insert ON public.sale_items;
CREATE TRIGGER on_sale_item_insert
AFTER INSERT ON public.sale_items
FOR EACH ROW EXECUTE FUNCTION update_product_stock_on_sale();

-- Function to update product stock after a sale item deletion (return stock)
CREATE OR REPLACE FUNCTION update_product_stock_on_sale_item_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET stock = stock + OLD.quantity
  WHERE id = OLD.product_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_sale_item_delete ON public.sale_items;
CREATE TRIGGER on_sale_item_delete
AFTER DELETE ON public.sale_items
FOR EACH ROW EXECUTE FUNCTION update_product_stock_on_sale_item_delete();

-- Function to update product stock after a sale item update (adjust stock)
CREATE OR REPLACE FUNCTION update_product_stock_on_sale_item_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - (NEW.quantity - OLD.quantity)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_sale_item_update ON public.sale_items;
CREATE TRIGGER on_sale_item_update
AFTER UPDATE OF quantity ON public.sale_items
FOR EACH ROW EXECUTE FUNCTION update_product_stock_on_sale_item_update();
