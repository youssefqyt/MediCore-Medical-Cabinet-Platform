CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL UNIQUE,
  category VARCHAR(60) NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sizes JSONB NOT NULL DEFAULT '["One size"]'::jsonb,
  color VARCHAR(16),
  accent VARCHAR(16),
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(32) NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'Preparing',
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  name VARCHAR(160) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  size VARCHAR(80),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(40) NOT NULL DEFAULT 'SYSTEM',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL UNIQUE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('android', 'ios')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS user_devices_user_id_idx ON user_devices(user_id);

INSERT INTO products (name, category, price, stock, description, sizes, color, accent, featured) VALUES
('Solenne lamp', 'Living', 148, 8, 'A small-batch table lamp with a warm, soft glow.', '["One size"]', '#D98955', '#FFE0D3', true),
('Moss knit', 'Wear', 96, 14, 'Relaxed merino knit for slow, well-dressed days.', '["XS","S","M","L"]', '#688263', '#DBE7D6', false),
('No. 04 vase', 'Objects', 72, 3, 'Hand-finished ceramic with an imperfect silhouette.', '["One size"]', '#B9A3D5', '#EEE6FA', false),
('Field tote', 'Wear', 54, 21, 'A durable everyday carry in washed canvas.', '["One size"]', '#D5A738', '#FFF0C3', false),
('Cedar candle', 'Living', 38, 0, 'Smoked cedar and cardamom, poured by hand.', '["180 g","300 g"]', '#A96A4C', '#F4D8C8', false),
('Pebble tray', 'Objects', 44, 9, 'A quiet landing place for the things you reach for.', '["Small","Large"]', '#8A9490', '#E1E8E4', false)
,
('Linen overshirt', 'Wear', 118, 12, 'A softly structured layer in breathable washed linen.', '[]', '#B98968', '#F4DED1', true),
('Clay incense holder', 'Objects', 28, 9, 'A hand-shaped holder for slow-burning incense.', '[]', '#B98968', '#F4DED1', false),
('Sora floor lamp', 'Living', 210, 15, 'A sculptural floor lamp with a linen shade.', '[]', '#B98968', '#F4DED1', true),
('Canvas weekend bag', 'Wear', 128, 10, 'A roomy canvas carryall for short escapes.', '[]', '#B98968', '#F4DED1', false),
('Ripple glass set', 'Objects', 46, 14, 'Handblown tumblers with a gentle ripple texture.', '[]', '#B98968', '#F4DED1', false),
('Olive throw blanket', 'Living', 88, 11, 'A generous cotton throw for cool evenings.', '[]', '#B98968', '#F4DED1', false),
('Ribbed cotton tee', 'Wear', 42, 13, 'An everyday tee with a refined ribbed finish.', '[]', '#B98968', '#F4DED1', false),
('Arc ceramic bowl', 'Objects', 36, 16, 'A low ceramic bowl for keys, fruit, or flowers.', '[]', '#B98968', '#F4DED1', false),
('Dune bedside table', 'Living', 260, 8, 'A compact oak table with softened edges.', '[]', '#B98968', '#F4DED1', false),
('Satin slip skirt', 'Wear', 104, 12, 'A fluid midi skirt made for day-to-night dressing.', '[]', '#B98968', '#F4DED1', false),
('Stoneware carafe', 'Objects', 64, 15, 'A tactile carafe for the dinner table.', '[]', '#B98968', '#F4DED1', false),
('Amber room spray', 'Living', 32, 9, 'Warm amber and fig for a calm room.', '[]', '#B98968', '#F4DED1', false),
('Merino cardigan', 'Wear', 132, 13, 'A fine merino cardigan with a relaxed drape.', '[]', '#B98968', '#F4DED1', false),
('Brass taper holder', 'Objects', 24, 10, 'A simple brass holder with a steady footprint.', '[]', '#B98968', '#F4DED1', false),
('Cloud cushion', 'Living', 58, 17, 'A plump linen cushion in a quiet neutral.', '[]', '#B98968', '#F4DED1', false),
('Utility chore jacket', 'Wear', 156, 14, 'A durable cotton jacket with useful pockets.', '[]', '#B98968', '#F4DED1', true),
('Woven wall basket', 'Objects', 52, 8, 'A woven basket for light storage and texture.', '[]', '#B98968', '#F4DED1', false),
('Lumen table clock', 'Living', 74, 16, 'A clean-faced clock for a considered desk.', '[]', '#B98968', '#F4DED1', false),
('Soft wool scarf', 'Wear', 68, 11, 'A lightweight wool scarf with a generous length.', '[]', '#B98968', '#F4DED1', false),
('Ink ceramic mug', 'Objects', 22, 12, 'A comfortable mug with a hand-dipped glaze.', '[]', '#B98968', '#F4DED1', false),
('Linen duvet cover', 'Living', 145, 15, 'Washed linen bedding that gets better with time.', '[]', '#B98968', '#F4DED1', false),
('Pleated wide trousers', 'Wear', 112, 9, 'High-waisted trousers with an easy wide leg.', '[]', '#B98968', '#F4DED1', false),
('Grove serving board', 'Objects', 48, 10, 'Solid wood serving board with a natural grain.', '[]', '#B98968', '#F4DED1', false),
('Opal pendant light', 'Living', 188, 13, 'A soft opal pendant for an inviting glow.', '[]', '#B98968', '#F4DED1', true),
('Cotton poplin shirt', 'Wear', 86, 14, 'A crisp shirt with an easy, generous cut.', '[]', '#B98968', '#F4DED1', false),
('Folded steel bookend', 'Objects', 34, 12, 'Minimal steel bookends for a tidy shelf.', '[]', '#B98968', '#F4DED1', false),
('Sandalwood candle', 'Living', 42, 16, 'Sandalwood, smoke, and a hint of iris.', '[]', '#B98968', '#F4DED1', false),
('Textured knit polo', 'Wear', 108, 8, 'A softly textured knit polo for transitional days.', '[]', '#B98968', '#F4DED1', false),
('Pebble soap dish', 'Objects', 18, 17, 'A small stoneware dish for daily rituals.', '[]', '#B98968', '#F4DED1', false),
('Rattan lounge chair', 'Living', 320, 10, 'A relaxed woven chair for a sunny corner.', '[]', '#B98968', '#F4DED1', false),
('Leather belt bag', 'Wear', 92, 15, 'A compact leather bag for hands-free days.', '[]', '#B98968', '#F4DED1', false),
('Tall bud vase', 'Objects', 39, 11, 'A slender vase for a single stem or branch.', '[]', '#B98968', '#F4DED1', false),
('Linen table runner', 'Living', 36, 14, 'A softly rumpled runner for everyday meals.', '[]', '#B98968', '#F4DED1', false),
('Relaxed denim jean', 'Wear', 124, 13, 'A straight-leg jean with a comfortable rise.', '[]', '#B98968', '#F4DED1', false),
('Ash catchall', 'Objects', 26, 9, 'A small ash wood tray for pocket essentials.', '[]', '#B98968', '#F4DED1', false),
('Faded terracotta pot', 'Living', 44, 12, 'A warm terracotta pot for trailing greenery.', '[]', '#B98968', '#F4DED1', false),
('Fine rib tank', 'Wear', 36, 16, 'A close-fitting rib tank for layering.', '[]', '#B98968', '#F4DED1', false),
('Linen photo frame', 'Objects', 31, 8, 'A tactile frame for a favorite photograph.', '[]', '#B98968', '#F4DED1', false),
('Cove reading light', 'Living', 126, 15, 'A directional reading light with a quiet profile.', '[]', '#B98968', '#F4DED1', false),
('Brushed cotton hoodie', 'Wear', 98, 10, 'A soft brushed hoodie with a neat silhouette.', '[]', '#B98968', '#F4DED1', false),
('Hand-thrown pitcher', 'Objects', 57, 13, 'A generous pitcher with an organic handle.', '[]', '#B98968', '#F4DED1', false),
('Wool blend rug', 'Living', 240, 7, 'A low-pile rug with a calm geometric weave.', '[]', '#B98968', '#F4DED1', false),
('Silk neck scarf', 'Wear', 62, 14, 'A small silk scarf with an understated print.', '[]', '#B98968', '#F4DED1', false),
('Carved oak hook', 'Objects', 16, 18, 'A useful wall hook with a warm oak grain.', '[]', '#B98968', '#F4DED1', false)
ON CONFLICT (name) DO NOTHING;

UPDATE products
SET image_url = CASE category
  WHEN 'Living' THEN 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80'
  WHEN 'Wear' THEN 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'
  ELSE 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80'
END
WHERE image_url IS NULL;

UPDATE products
SET sizes = '["One size"]'::jsonb
WHERE sizes = '[]'::jsonb;
