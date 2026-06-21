
-- SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  old_price NUMERIC(10,2),
  image_url TEXT,
  category TEXT DEFAULT 'geral',
  available BOOLEAN DEFAULT TRUE,
  popularity_score INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL DEFAULT 'Anônimo',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  customer_location TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','ready','delivered','cancelled')),
  payment_method TEXT NOT NULL,
  payment_proof_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  party_size INTEGER NOT NULL DEFAULT 1,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','waiting')),
  deposit_amount NUMERIC(10,2),
  deposit_proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS CONFIG TABLE
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method TEXT UNIQUE NOT NULL,
  holder_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  extra_info JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NAVBAR ITEMS TABLE
CREATE TABLE IF NOT EXISTS navbar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  path TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE
);

-- ENABLE RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE navbar_items ENABLE ROW LEVEL SECURITY;

-- PUBLIC POLICIES
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_products" ON products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_products" ON products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_products" ON products FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_read_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_reviews" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_reviews" ON reviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_reviews" ON reviews FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_read_settings" ON settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_settings" ON settings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_settings" ON settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_settings" ON settings FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_read_payments" ON payments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_payments" ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_payments" ON payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_payments" ON payments FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_read_navbar" ON navbar_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_navbar" ON navbar_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_navbar" ON navbar_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_navbar" ON navbar_items FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_read_orders" ON orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_orders" ON orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_orders" ON orders FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_read_reservations" ON reservations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_reservations" ON reservations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_reservations" ON reservations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_reservations" ON reservations FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_read_admin_logs" ON admin_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_admin_logs" ON admin_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- SEED INITIAL DATA
INSERT INTO navbar_items (label, path, sort_order, visible) VALUES
  ('Home', '/', 1, true),
  ('Cardápio', '/cardapio', 2, true),
  ('Encomendas', '/encomendas', 3, true),
  ('Reservas', '/reservas', 4, true),
  ('Avaliações', '/avaliacoes', 5, true),
  ('Sobre Nós', '/sobre', 6, true),
  ('Contactos', '/contactos', 7, true)
ON CONFLICT DO NOTHING;

INSERT INTO settings (key, value) VALUES
  ('splash', '{"duration": 3000, "title": "Chapa Quente", "subtitle": "Sabor que aquece a alma", "image_url": ""}'),
  ('restaurant', '{"name": "Chapa Quente", "tagline": "Sabor que aquece a alma", "logo_url": "", "address": "Maputo, Mo\u00e7ambique", "phone": "+258 84 000 0000", "email": "geral@chapaquente.co.mz", "opening_time": "08:00", "closing_time": "22:00", "open_days": [1,2,3,4,5,6,0], "is_open": true}'),
  ('about', '{"title": "Sobre o Chapa Quente", "content": "O Chapa Quente \u00e9 um restaurante dedicado a trazer os melhores sabores de Mo\u00e7ambique para a sua mesa. Fundado com paix\u00e3o e dedica\u00e7\u00e3o, servimos pratos tradicionais preparados com ingredientes frescos e locais.", "images": [], "team": "Desenvolvido pela Nexorium Group LLC"}'),
  ('contacts', '{"whatsapp": "+258840000000", "phone": "+258840000000", "instagram": "chapaquente_mz", "facebook": "chapaquente", "tiktok": "", "email": "geral@chapaquente.co.mz"}'),
  ('theme', '{"primary_color": "oklch(0.65 0.2 35)", "mode": "light"}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO payments (method, holder_name, account_number, extra_info, active) VALUES
  ('mpesa', 'Chapa Quente', '84 000 0000', '{"description": "M-Pesa Vodacom"}', true),
  ('emola', 'Chapa Quente', '86 000 0000', '{"description": "E-Mola Movitel"}', true),
  ('banco', 'Chapa Quente Lda', 'NIB: 0001-0000-00000000000-00', '{"bank": "BCI", "account": "0000000000"}', true)
ON CONFLICT (method) DO NOTHING;

INSERT INTO products (name, description, price, old_price, image_url, category, available, popularity_score) VALUES
  ('Frango Grelhado com Matapa', 'Frango grelhado marinado com especiarias e servido com matapa cremosa. Preparado com frango criado em campo aberto, marinado por 24 horas em especiarias tradicionais mo\u00e7ambicanas. Servido com matapa feita de folhas de mandioca frescas com camar\u00e3o seco e amendoim torrado.', 450.00, 550.00, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80', 'pratos', true, 85),
  ('Camar\u00e3o \u00e0 Zambezia', 'Camar\u00e3o jumbo grelhado na brasa com manteiga de alho e lim\u00e3o. Direto das \u00e1guas do Canal de Mo\u00e7ambique, grelhados na brasa com manteiga artesanal, alho fresco e lim\u00e3o. Um cl\u00e1ssico da culin\u00e1ria do \u00cdndico.', 850.00, NULL, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', 'pratos', true, 92),
  ('Espetada Mista', 'Espetada de carne, frango e legumes grelhados na chapa. Pe\u00e7as selecionadas de carne e frango intercalados com pimentos coloridos, cebola e tomate, tudo grelhado na chapa quente.', 620.00, 700.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', 'pratos', true, 78),
  ('Matata de Berbig\u00e3o', 'Berbig\u00e3o cozido em leite de coco com especiarias da costa. Prato t\u00edpico do litoral mo\u00e7ambicano com berbig\u00f5es frescos, leite de coco cremoso, amendoim torrado e especiarias \u00fanicas. Servido com arroz branco.', 380.00, NULL, 'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=400&q=80', 'pratos', true, 65),
  ('Prego no P\u00e3o', 'Bife de vitela marinado servido em p\u00e3o artesanal com molho piri-piri. O cl\u00e1ssico prego mo\u00e7ambicano com bife de vitela tenro marinado em molho secreto da casa, grelhado e servido em p\u00e3o artesanal acabado de cozer.', 220.00, 250.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', 'snacks', true, 88),
  ('Sumo de Mafurra', 'Sumo natural de mafurra gelado. Preparado diariamente com mafurras colhidas fresquinhas, este sumo \u00e9 a ess\u00eancia do sabor tropical mo\u00e7ambicano. Servido gelado.', 80.00, NULL, 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&q=80', 'bebidas', true, 55)
ON CONFLICT DO NOTHING;
