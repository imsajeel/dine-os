-- Set Org ID
\set org_id '47d16db1-d727-4817-bd42-d646417a5e0b'

-- Create Modifier Groups
INSERT INTO modifier_groups (id, organization_id, name, min_selection, max_selection) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', :'org_id', 'Burger Add-ons', 0, 3),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', :'org_id', 'Drink Size', 1, 1);

-- Create Modifiers
INSERT INTO modifiers (modifier_group_id, name, price) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Extra Cheese', 1.00),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Bacon', 1.50),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Avocado', 2.00),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Regular', 0.00),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Large', 0.50);

-- Link Modifiers to Menu Items
-- Link 'Burger Add-ons' to all Burgers
INSERT INTO item_modifiers (menu_item_id, modifier_group_id)
SELECT id, 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'::uuid
FROM menu_items
WHERE category_id = (SELECT id FROM categories WHERE name = 'Burgers' LIMIT 1);

-- Link 'Drink Size' to all Drinks
INSERT INTO item_modifiers (menu_item_id, modifier_group_id)
SELECT id, 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e'::uuid
FROM menu_items
WHERE category_id = (SELECT id FROM categories WHERE name = 'Drinks' LIMIT 1);
