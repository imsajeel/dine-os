-- Set Organization ID
\set org_id '47d16db1-d727-4817-bd42-d646417a5e0b'

-- Insert Tables
INSERT INTO floor_tables (organization_id, table_number, capacity, x_position, y_position, shape, current_status) VALUES
(:'org_id', 'T1', 4, 0, 0, 'round', 'free'),
(:'org_id', 'T2', 4, 1, 0, 'round', 'free'),
(:'org_id', 'T3', 4, 0, 1, 'round', 'free'),
(:'org_id', 'T4', 6, 1, 1, 'rectangle', 'free'),
(:'org_id', 'T5', 6, 2, 1, 'rectangle', 'free');
