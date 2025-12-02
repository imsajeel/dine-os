-- Set Organization ID
\set org_id '47d16db1-d727-4817-bd42-d646417a5e0b'

-- Insert Categories
INSERT INTO categories (organization_id, name, sort_order) VALUES
(:'org_id', 'Burgers', 1),
(:'org_id', 'Drinks', 2),
(:'org_id', 'Coffee', 3),
(:'org_id', 'Desserts', 4);

-- Insert Menu Items
INSERT INTO menu_items (organization_id, category_id, name, description, price, image_url) VALUES
(:'org_id', (SELECT id FROM categories WHERE name = 'Burgers' AND organization_id = :'org_id' LIMIT 1), 'Classic Cheeseburger', 'Juicy beef patty with cheese', 12.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60'),
(:'org_id', (SELECT id FROM categories WHERE name = 'Burgers' AND organization_id = :'org_id' LIMIT 1), 'Double Bacon Melt', 'Double beef patty with bacon', 15.50, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=60'),
(:'org_id', (SELECT id FROM categories WHERE name = 'Burgers' AND organization_id = :'org_id' LIMIT 1), 'Crispy Chicken', 'Fried chicken sandwich', 11.00, 'https://images.unsplash.com/photo-1615557960916-5f4791effe9d?auto=format&fit=crop&w=500&q=60'),
(:'org_id', (SELECT id FROM categories WHERE name = 'Burgers' AND organization_id = :'org_id' LIMIT 1), 'Mushroom Swiss', 'Beef patty with mushrooms and swiss cheese', 13.50, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60'),
(:'org_id', (SELECT id FROM categories WHERE name = 'Coffee' AND organization_id = :'org_id' LIMIT 1), 'Cappuccino', 'Rich espresso with frothed milk', 4.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=60'),
(:'org_id', (SELECT id FROM categories WHERE name = 'Drinks' AND organization_id = :'org_id' LIMIT 1), 'Craft Cola', 'Artisanal cola', 3.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=60'),
(:'org_id', (SELECT id FROM categories WHERE name = 'Drinks' AND organization_id = :'org_id' LIMIT 1), 'Lemonade', 'Freshly squeezed lemonade', 3.50, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=60'),
(:'org_id', (SELECT id FROM categories WHERE name = 'Desserts' AND organization_id = :'org_id' LIMIT 1), 'Strawberry Shake', 'Creamy strawberry milkshake', 6.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=60'),
(:'org_id', (SELECT id FROM categories WHERE name = 'Burgers' AND organization_id = :'org_id' LIMIT 1), 'Veggie Supreme', 'Plant-based burger', 10.50, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60'),
(:'org_id', (SELECT id FROM categories WHERE name = 'Coffee' AND organization_id = :'org_id' LIMIT 1), 'Espresso', 'Strong black coffee', 3.00, 'https://images.unsplash.com/photo-1610889556285-a77889132b20?auto=format&fit=crop&w=500&q=60');
