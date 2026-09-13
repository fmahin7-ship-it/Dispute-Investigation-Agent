-- NovaCart EDI — seed data (demo + eval fixtures)

-- Customers
INSERT INTO customers (id, full_name, email, phone, address_line1, suburb, state, postcode) VALUES
('C-22',  'Aisha Rahman',   'aisha.rahman@email.com',  '+61 400 111 222', '18 River Gum Court', 'Brunswick', 'VIC', '3056'),
('C-41',  'Ben Carter',     'ben.carter@email.com',    '+61 400 333 444', '7 Harbour View Rd',  'Docklands', 'VIC', '3008'),
('C-58',  'Mei Chen',       'mei.chen@email.com',      '+61 400 555 666', '42 Station Street',  'Box Hill',  'VIC', '3128'),
('C-77',  'Oliver Smith',   'oliver.smith@email.com',  '+61 401 777 888', '9 Palm Avenue',      'St Kilda',  'VIC', '3182'),
('C-90',  'Priya Nair',     'priya.nair@email.com',    '+61 402 999 000', '55 Collins Lane',    'Melbourne', 'VIC', '3000');

-- Orders
INSERT INTO orders (id, order_number, customer_id, status, currency, total_amount, item_sku, item_name, item_category, paid_at) VALUES
('ORD-1042', 'NC-88321', 'C-22', 'shipped',  'AUD', 850.00,  'MBA-M3-256', 'MacBook Air 13\" M3 256GB', 'electronics', '2026-09-05 10:12:00+10'),
('ORD-1087', 'NC-77102', 'C-41', 'paid',     'AUD', 249.00,  'AIR-PRO-2',  'AirPods Pro (2nd gen)',   'electronics', '2026-09-08 14:01:00+10'),
('ORD-1112', 'NC-90455', 'C-58', 'shipped',  'AUD', 1299.00, 'MBA-M3-512', 'MacBook Air 13\" M3 512GB Midnight', 'electronics', '2026-09-01 09:40:00+10'),
('ORD-1201', 'NC-81200', 'C-77', 'shipped',  'AUD', 89.00,   'USB-C-HUB',  '7-in-1 USB-C Hub',        'accessories','2026-08-20 11:00:00+10'),
('ORD-1202', 'NC-81255', 'C-90', 'shipped',  'AUD', 620.00,  'IPAD-A16',   'iPad 11\" A16 128GB',     'electronics', '2026-09-03 16:22:00+10'),
('ORD-1203', 'NC-81310', 'C-22', 'shipped',  'AUD', 149.00,  'MAGIC-KEY',  'Magic Keyboard Folio',    'accessories','2026-07-12 13:10:00+10');

-- Shipments / tracking
INSERT INTO shipments (id, order_id, carrier, tracking_number, status, delivered_at, gps_lat, gps_lng, registered_lat, registered_lng, distance_meters, delivery_method) VALUES
('SHP-1042', 'ORD-1042', 'AusPost', 'AP0099182736', 'delivered', '2026-09-10 14:32:00+10', -37.7668120, 144.9614550, -37.7667800, 144.9614200, 18.00, 'authority_to_leave'),
('SHP-1087', 'ORD-1087', 'AusPost', 'AP0099201001', 'in_transit', NULL, NULL, NULL, -37.8140000, 144.9460000, NULL, 'signature_required'),
('SHP-1112', 'ORD-1112', 'StarTrack', 'ST44190220', 'delivered', '2026-09-04 11:05:00+10', -37.8192000, 145.1234000, -37.8191500, 145.1233500, 12.00, 'handover'),
('SHP-1201', 'ORD-1201', 'AusPost', 'AP0088001122', 'delivered', '2026-08-22 15:40:00+10', -37.8675000, 144.9801000, -37.8674800, 144.9800500, 9.00, 'authority_to_leave'),
('SHP-1202', 'ORD-1202', 'AusPost', 'AP0099333444', 'delivered', '2026-09-06 10:18:00+10', -37.8136000, 144.9631000, -37.8200000, 144.9700000, 920.00, 'authority_to_leave'),
('SHP-1203', 'ORD-1203', 'AusPost', 'AP0077001999', 'delivered', '2026-07-14 12:00:00+10', -37.7668000, 144.9614000, -37.7667800, 144.9614200, 5.00, 'handover');

-- Delivery evidence (photo metadata — no CV)
INSERT INTO delivery_evidence (id, order_id, exists_flag, photo_url, caption, limitations, captured_at) VALUES
('DE-1042', 'ORD-1042', TRUE,  '/demo-assets/delivery-1042.jpg',
 'Package visible on residential doorstep; cardboard box consistent with laptop shipment; doorway and mat visible.',
 ARRAY['Exact street number not clearly readable from image', 'Recipient identity cannot be verified from photo alone'],
 '2026-09-10 14:32:10+10'),
('DE-1112', 'ORD-1112', TRUE,  '/demo-assets/delivery-1112.jpg',
 'Handed to resident at door; outer carton labelled MBA-M3-512.',
 ARRAY['Photo does not show device screen or serial number'],
 '2026-09-04 11:05:30+10'),
('DE-1202', 'ORD-1202', TRUE,  '/demo-assets/delivery-1202.jpg',
 'Package left near building entrance; multiple unit numbers visible in background.',
 ARRAY['Delivery location may not match unit-level address', 'GPS is 920m from registered point'],
 '2026-09-06 10:18:40+10'),
('DE-1087', 'ORD-1087', FALSE, NULL, NULL, ARRAY[]::TEXT[], NULL),
('DE-1201', 'ORD-1201', TRUE,  '/demo-assets/delivery-1201.jpg', 'Small parcel at door.', ARRAY['Low resolution'], '2026-08-22 15:40:05+10');

-- Payments
INSERT INTO payments (id, order_id, provider, charge_id, amount, currency, status, charged_at) VALUES
('PAY-1042-A', 'ORD-1042', 'stripe', 'ch_1042_primary', 850.00, 'AUD', 'succeeded', '2026-09-05 10:12:05+10'),
('PAY-1087-A', 'ORD-1087', 'stripe', 'ch_1087_a', 249.00, 'AUD', 'succeeded', '2026-09-08 14:01:02+10'),
('PAY-1087-B', 'ORD-1087', 'stripe', 'ch_1087_b', 249.00, 'AUD', 'succeeded', '2026-09-08 14:01:05+10'),
('PAY-1112-A', 'ORD-1112', 'stripe', 'ch_1112_primary', 1299.00, 'AUD', 'succeeded', '2026-09-01 09:40:10+10'),
('PAY-1201-A', 'ORD-1201', 'stripe', 'ch_1201_primary', 89.00, 'AUD', 'succeeded', '2026-08-20 11:00:08+10'),
('PAY-1202-A', 'ORD-1202', 'stripe', 'ch_1202_primary', 620.00, 'AUD', 'succeeded', '2026-09-03 16:22:12+10'),
('PAY-1203-A', 'ORD-1203', 'stripe', 'ch_1203_primary', 149.00, 'AUD', 'succeeded', '2026-07-12 13:10:04+10');

-- Warehouse picks
INSERT INTO warehouse_picks (id, order_id, sku_ordered, sku_picked, name_ordered, name_picked, picked_at, picker_id) VALUES
('WP-1042', 'ORD-1042', 'MBA-M3-256', 'MBA-M3-256', 'MacBook Air 13\" M3 256GB', 'MacBook Air 13\" M3 256GB', '2026-09-06 08:15:00+10', 'PICK-19'),
('WP-1087', 'ORD-1087', 'AIR-PRO-2',  'AIR-PRO-2',  'AirPods Pro (2nd gen)', 'AirPods Pro (2nd gen)', '2026-09-08 15:00:00+10', 'PICK-07'),
('WP-1112', 'ORD-1112', 'MBA-M3-512', 'MBA-M3-512', 'MacBook Air 13\" M3 512GB Midnight', 'MacBook Air 13\" M3 512GB Midnight', '2026-09-02 07:50:00+10', 'PICK-03'),
('WP-1201', 'ORD-1201', 'USB-C-HUB',  'USB-C-HUB',  '7-in-1 USB-C Hub', '7-in-1 USB-C Hub', '2026-08-21 09:00:00+10', 'PICK-11'),
('WP-1202', 'ORD-1202', 'IPAD-A16',   'IPAD-A16',   'iPad 11\" A16 128GB', 'iPad 11\" A16 128GB', '2026-09-04 08:20:00+10', 'PICK-11');

-- Customer dispute history (C-22 is serial-risk for 1042)
INSERT INTO customer_dispute_history (id, customer_id, related_order, claim_type, outcome, amount_aud, opened_at, notes) VALUES
('HIST-22-1', 'C-22', 'NC-61001', 'not_received', 'refunded', 120.00, '2025-11-02 10:00:00+11', 'Low-value accessory; refunded as goodwill'),
('HIST-22-2', 'C-22', 'NC-64010', 'not_received', 'refunded', 89.00,  '2026-01-18 12:30:00+11', 'Courier exception; refund approved'),
('HIST-22-3', 'C-22', 'NC-69044', 'damaged',      'refunded', 210.00, '2026-03-05 09:15:00+11', 'Photo evidence accepted'),
('HIST-22-4', 'C-22', 'NC-72018', 'not_received', 'partial_refund', 75.00, '2026-06-21 16:40:00+10', 'ATL delivery; partial goodwill'),
('HIST-41-1', 'C-41', 'NC-70002', 'duplicate_charge', 'refunded', 49.00, '2026-02-11 11:00:00+11', 'Confirmed double capture'),
('HIST-58-1', 'C-58', 'NC-88001', 'wrong_item', 'replacement', 0.00, '2025-09-14 14:00:00+10', 'Warehouse mispick confirmed'),
('HIST-90-1', 'C-90', 'NC-80111', 'not_received', 'rejected', 620.00, '2026-04-02 10:00:00+11', 'GPS far from address; prior reject');

-- Disputes / cases (3 demo + eval)
INSERT INTO disputes (
  id, case_number, order_id, customer_id, claim_type, customer_message, status,
  amount_aud, demo, expected_recommendation, expected_action
) VALUES
('DSP-1042', '1042', 'ORD-1042', 'C-22', 'not_received',
 'My $850 laptop wasn''t delivered. I never received the MacBook and I want a full refund.',
 'open', 850.00, TRUE, 'HOLD', 'MANUAL_VERIFICATION'),

('DSP-1087', '1087', 'ORD-1087', 'C-41', 'duplicate_charge',
 'I was charged twice for the same order. Please refund the duplicate payment.',
 'open', 249.00, TRUE, 'APPROVE', 'REFUND_DUPLICATE'),

('DSP-1112', '1112', 'ORD-1112', 'C-58', 'wrong_item',
 'I ordered a MacBook Air but I believe I received a MacBook Pro. This is the wrong item.',
 'open', 1299.00, TRUE, 'REQUEST_INFO', 'REQUEST_PHOTO_OF_ITEM'),

('DSP-1201', '1201', 'ORD-1201', 'C-77', 'not_received',
 'Hub never arrived.',
 'open', 89.00, FALSE, 'REJECT', 'DENY_REFUND_DELIVERED'),

('DSP-1202', '1202', 'ORD-1202', 'C-90', 'not_received',
 'iPad was not delivered to my apartment.',
 'open', 620.00, FALSE, 'HOLD', 'MANUAL_VERIFICATION'),

('DSP-1203', '1203', 'ORD-1203', 'C-22', 'not_as_described',
 'Keyboard does not match the listing colour.',
 'open', 149.00, FALSE, 'REQUEST_INFO', 'REQUEST_PHOTO_OF_ITEM');
