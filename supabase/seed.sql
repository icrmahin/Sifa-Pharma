-- Sifa-Pharma deterministic local seed
-- Run via: npx supabase db reset (local only)
-- No real personal information. All emails are @sifa.local synthetic.
-- Admin: admin@sifa.local / Admin123!
-- Customer: customer@sifa.local / Customer123!
-- Customer2: james.kimani@sifa.local / Customer123!

-- Ensure extensions exist (idempotent)
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- 1. CATEGORIES (deterministic by slug)
insert into public.categories (name, slug, description, icon) values
  ('Pain Relief', 'pain-relief', 'Analgesics and anti-inflammatories', 'medication'),
  ('Antibiotics', 'antibiotics', 'Prescription antibiotics', 'vaccines'),
  ('Vitamins & Supplements', 'vitamins-supplements', 'Daily vitamins and minerals', 'nutrition'),
  ('Cardiovascular', 'cardiovascular', 'Heart and blood pressure', 'favorite'),
  ('Diabetes Care', 'diabetes-care', 'Blood sugar management', 'monitor_heart'),
  ('Respiratory', 'respiratory', 'Cough, cold and asthma', 'air'),
  ('First Aid', 'first-aid', 'Wound care and antiseptics', 'healing'),
  ('Personal Care', 'personal-care', 'Hygiene and skincare', 'spa')
on conflict (slug) do nothing;

-- 2. MANUFACTURERS
insert into public.manufacturers (name, country, website) values
  ('GlaxoSmithKline', 'United Kingdom', 'https://www.gsk.com'),
  ('Pfizer', 'United States', 'https://www.pfizer.com'),
  ('Bayer', 'Germany', 'https://www.bayer.com'),
  ('Novartis', 'Switzerland', 'https://www.novartis.com'),
  ('Dawa Limited', 'Kenya', 'https://www.dawa.co.ke'),
  ('Cosmos Limited', 'Kenya', 'https://www.cosmos-pharm.com'),
  ('Laboratory & Allied', 'Kenya', 'https://www.laballied.com'),
  ('AstraZeneca', 'United Kingdom', 'https://www.astrazeneca.com')
on conflict do nothing;

-- 3. PRODUCTS (deterministic price/stock via inventory)
-- Helper: product inserts reference category/manufacturer via subselect
-- stock is 0 initially; inventory_items will sync to correct sum.

-- Clean existing products/inventory for idempotency (seed runs after reset, empty, but safe)
-- Use fixed product data; deduplicate by name+brand

-- We use a staging approach: insert only if not exists by name
do $$
declare
  v_pain uuid := (select id from public.categories where slug='pain-relief');
  v_abx uuid := (select id from public.categories where slug='antibiotics');
  v_vit uuid := (select id from public.categories where slug='vitamins-supplements');
  v_cardio uuid := (select id from public.categories where slug='cardiovascular');
  v_diab uuid := (select id from public.categories where slug='diabetes-care');
  v_resp uuid := (select id from public.categories where slug='respiratory');
  v_aid uuid := (select id from public.categories where slug='first-aid');
  v_pers uuid := (select id from public.categories where slug='personal-care');
  v_gsk uuid := (select id from public.manufacturers where name='GlaxoSmithKline');
  v_pfizer uuid := (select id from public.manufacturers where name='Pfizer');
  v_bayer uuid := (select id from public.manufacturers where name='Bayer');
  v_novartis uuid := (select id from public.manufacturers where name='Novartis');
  v_dawa uuid := (select id from public.manufacturers where name='Dawa Limited');
  v_cosmos uuid := (select id from public.manufacturers where name='Cosmos Limited');
  v_lab uuid := (select id from public.manufacturers where name='Laboratory & Allied');
  v_az uuid := (select id from public.manufacturers where name='AstraZeneca');
begin
  -- only insert if products empty
  if (select count(*) from public.products) > 0 then
    return;
  end if;

  insert into public.products (name, brand, generic_name, manufacturer_id, category_id, description, price, original_price, discount_percent, stock, unit, image_url, secondary_image_url, is_active, is_featured) values
  ('Paracetamol 500mg Tablets 20s', 'Panadol', 'Paracetamol', v_gsk, v_pain, 'Fast-acting pain and fever relief. 20 coated tablets. Suitable for headache, toothache and cold symptoms.', 250, 300, 17, 0, 'pack', 'https://via.placeholder.com/400x400/123C35/FFFFFF?text=Panadol', null, true, true),
  ('Ibuprofen 400mg Tablets 20s', 'Brufen', 'Ibuprofen', v_bayer, v_pain, 'Non-steroidal anti-inflammatory for pain and inflammation. Take with food.', 320, null, 0, 0, 'pack', 'https://via.placeholder.com/400x400/8FB8A8/18201E?text=Brufen', null, true, true),
  ('Amoxicillin 500mg Capsules 21s', 'Amoxil', 'Amoxicillin', v_gsk, v_abx, 'Broad-spectrum penicillin antibiotic. Complete the full course as prescribed.', 850, 1000, 15, 0, 'pack', 'https://via.placeholder.com/400x400/D7B878/18201E?text=Amoxil', null, true, false),
  ('Azithromycin 500mg Tablets 3s', 'Zithromax', 'Azithromycin', v_pfizer, v_abx, 'Macrolide antibiotic for respiratory and skin infections. 3-day course.', 650, null, 0, 0, 'pack', 'https://via.placeholder.com/400x400/123C35/FFFFFF?text=Zithromax', null, true, false),
  ('Vitamin C 1000mg Tablets 30s', 'Redoxon', 'Ascorbic Acid', v_bayer, v_vit, 'High-strength vitamin C with zinc for immune support.', 780, 950, 18, 0, 'pack', 'https://via.placeholder.com/400x400/F6F7F4/123C35?text=Redoxon', null, true, true),
  ('Multivitamin Syrup 200ml', 'Seven Seas', 'Multivitamin', v_cosmos, v_vit, 'Daily multivitamin syrup for adults. Contains vitamins A, D, E and B-complex.', 520, null, 0, 0, 'bottle', 'https://via.placeholder.com/400x400/8FB8A8/18201E?text=SevenSeas', null, true, false),
  ('Metformin 500mg Tablets 60s', 'Glucophage', 'Metformin', v_novartis, v_diab, 'First-line treatment for type 2 diabetes. Take with meals.', 1200, 1350, 11, 0, 'pack', 'https://via.placeholder.com/400x400/123C35/FFFFFF?text=Glucophage', null, true, true),
  ('Lisinopril 10mg Tablets 28s', 'Zestril', 'Lisinopril', v_az, v_cardio, 'ACE inhibitor for hypertension and heart failure. Monitor blood pressure.', 980, null, 0, 0, 'pack', 'https://via.placeholder.com/400x400/D7B878/18201E?text=Zestril', null, true, false),
  ('Amlodipine 5mg Tablets 30s', 'Norvasc', 'Amlodipine', v_pfizer, v_cardio, 'Calcium channel blocker for high blood pressure and angina.', 890, 1100, 19, 0, 'pack', 'https://via.placeholder.com/400x400/123C35/FFFFFF?text=Norvasc', null, true, false),
  ('Salbutamol Inhaler 100mcg 200 doses', 'Ventolin', 'Salbutamol', v_gsk, v_resp, 'Reliever inhaler for asthma and COPD. Shake well before use.', 1450, null, 0, 0, 'inhaler', 'https://via.placeholder.com/400x400/8FB8A8/18201E?text=Ventolin', null, true, true),
  ('Cetirizine 10mg Tablets 14s', 'Zyrtec', 'Cetirizine', v_bayer, v_resp, 'Non-drowsy antihistamine for allergies and hay fever.', 380, 450, 15, 0, 'pack', 'https://via.placeholder.com/400x400/F6F7F4/123C35?text=Zyrtec', null, true, false),
  ('ORS Sachets 20s', 'Oral Rehydration Salts', 'ORS', v_dawa, v_aid, 'Oral rehydration salts for diarrhoea. Dissolve one sachet in 1L clean water.', 220, null, 0, 0, 'pack', null, null, true, false),
  ('Povidone Iodine 100ml', 'Betadine', 'Povidone-Iodine', v_lab, v_aid, 'Antiseptic solution for wound cleaning and infection prevention.', 310, null, 0, 0, 'bottle', 'https://via.placeholder.com/400x400/D7B878/18201E?text=Betadine', null, true, false),
  ('Hydrocortisone Cream 15g', 'Dermacort', 'Hydrocortisone', v_cosmos, v_pers, 'Mild topical steroid for eczema and dermatitis. Apply thin layer twice daily.', 420, null, 0, 0, 'tube', null, null, true, false),
  ('Gauze Roll 4in x 4m', 'Sifa Gauze', 'Gauze', v_lab, v_aid, 'Sterile woven gauze roll for wound dressing. Individually wrapped.', 150, null, 0, 0, 'roll', null, null, true, false),
  ('Paracetamol Syrup 100ml - Paediatric', 'Panadol Baby', 'Paracetamol', v_gsk, v_pain, 'Paediatric paracetamol syrup 120mg/5ml for fever and pain in children.', 290, null, 0, 0, 'bottle', 'https://via.placeholder.com/400x400/123C35/FFFFFF?text=PanadolBaby', null, true, false),
  ('Insulin Glargine 100IU Pen', 'Lantus SoloStar', 'Insulin Glargine', v_novartis, v_diab, 'Long-acting basal insulin. Store refrigerated 2-8°C. Do not freeze.', 3200, 3600, 11, 0, 'pen', null, null, true, false),
  ('Amox-Clav 625mg Tablets 14s', 'Augmentin', 'Amoxicillin Clavulanate', v_gsk, v_abx, 'Co-amoxiclav for resistant bacterial infections. Take at start of meal.', 1450, null, 0, 0, 'pack', 'https://via.placeholder.com/400x400/123C35/FFFFFF?text=Augmentin', null, true, false),
  ('Omeprazole 20mg Capsules 14s', 'Losec', 'Omeprazole', v_az, v_pers, 'Proton pump inhibitor for gastric reflux and ulcers. Take before breakfast.', 560, 650, 14, 0, 'pack', null, null, false, false)
  ;
end $$;

-- 4. INVENTORY (1-2 batches per product, varied stock levels to exercise low/out/expiring)
-- Stock sync trigger will populate products.stock automatically.

do $$
declare
  r record;
  v_low_threshold int := 10;
begin
  if (select count(*) from public.inventory_items) > 0 then
    return;
  end if;

  for r in select id, name from public.products order by name loop
    -- Use product name to decide stock profile deterministically
    if r.name like '%Panadol Baby%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-PB-2025-01', 45, '2026-11-15'),
        (r.id, 'BATCH-PB-2025-02', 30, '2027-06-30');
    elsif r.name like '%Paracetamol 500mg%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-PARA-2025-A', 120, '2027-12-31'),
        (r.id, 'BATCH-PARA-2026-B', 80, '2028-03-15');
    elsif r.name like '%Ibuprofen%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-IBU-2025-01', 8, '2027-02-28'); -- low stock
    elsif r.name like '%Amoxicillin 500mg%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-AMOX-2025-01', 55, '2026-09-30'),
        (r.id, 'BATCH-AMOX-2025-02', 25, '2026-10-15');
    elsif r.name like '%Azithromycin%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-AZI-2025-01', 0, '2026-08-01'); -- out of stock
    elsif r.name like '%Vitamin C%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-VITC-2025-01', 60, '2027-05-20');
    elsif r.name like '%Multivitamin Syrup%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-MULTI-2025-01', 18, '2026-12-31');
    elsif r.name like '%Metformin%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-MET-2025-01', 95, '2027-08-15');
    elsif r.name like '%Lisinopril%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-LIS-2025-01', 4, '2026-07-20'); -- low + expiring soon
    elsif r.name like '%Amlodipine%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-AMLO-2025-01', 40, '2027-11-01');
    elsif r.name like '%Salbutamol%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-SAL-2025-01', 22, '2026-08-15'); -- expiring within 60 days from seed
    elsif r.name like '%Cetirizine%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-CET-2025-01', 35, '2027-01-15');
    elsif r.name like '%ORS%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-ORS-2025-01', 200, '2027-09-30');
    elsif r.name like '%Povidone%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-BET-2025-01', 90, '2027-04-10');
    elsif r.name like '%Hydrocortisone%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-HYD-2025-01', 12, '2026-06-10'); -- low + expiring
    elsif r.name like '%Gauze Roll%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-GAU-2025-01', 500, null); -- non-perishable
    elsif r.name like '%Insulin Glargine%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-INS-2025-01', 15, '2026-09-01'),
        (r.id, 'BATCH-INS-2025-02', 6, '2026-07-01'); -- low + expiring
    elsif r.name like '%Amox-Clav%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-AUG-2025-01', 30, '2026-11-30');
    elsif r.name like '%Omeprazole%' then
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-OME-2025-01', 0, '2026-12-31'); -- inactive + out_of_stock
    else
      insert into public.inventory_items (product_id, batch_number, quantity, expiry_date) values
        (r.id, 'BATCH-GEN-' || substr(r.id::text,1,8), 50, '2027-06-30');
    end if;
  end loop;
end $$;

-- 5. AUTH USERS + PROFILES (deterministic fixed UUIDs)
-- NOTE: profiles are auto-created by handle_new_user trigger from raw_user_meta_data
-- We insert into auth.users directly; trigger creates profiles.
-- Passwords are hashed with pgcrypto crypt/bf. All synthetic.

do $$
declare
  admin_id uuid := '11111111-1111-1111-1111-111111111111';
  cust_id uuid := '22222222-2222-2222-2222-222222222222';
  cust2_id uuid := '33333333-3333-3333-3333-333333333333';
  inst_id uuid := '00000000-0000-0000-0000-000000000000';
begin
  -- skip if users already exist
  if exists (select 1 from auth.users where email='admin@sifa.local') then
    return;
  end if;

  -- Admin user (Bangladeshi format)
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  values (
    inst_id, admin_id, 'authenticated', 'authenticated', 'admin@sifa.local',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Sifa Admin","phone":"+8801712345678","role":"admin"}',
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    'admin@sifa.local', admin_id,
    jsonb_build_object('sub', admin_id::text, 'email','admin@sifa.local','phone','+8801712345678'),
    'email', now(), now(), now()
  );

  -- Customer 1 (Amina) - use your typical BD number +8801865858544
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  values (
    inst_id, cust_id, 'authenticated', 'authenticated', 'customer@sifa.local',
    crypt('Customer123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Amina Otieno","phone":"+8801865858544","role":"customer"}',
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    'customer@sifa.local', cust_id,
    jsonb_build_object('sub', cust_id::text, 'email','customer@sifa.local','phone','+8801865858544'),
    'email', now(), now(), now()
  );

  -- Customer 2
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  values (
    inst_id, cust2_id, 'authenticated', 'authenticated', 'james.kimani@sifa.local',
    crypt('Customer123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"James Kimani","phone":"+8801923456789","role":"customer"}',
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    'james.kimani@sifa.local', cust2_id,
    jsonb_build_object('sub', cust2_id::text, 'email','james.kimani@sifa.local','phone','+8801923456789'),
    'email', now(), now(), now()
  );

  -- Profiles trigger should have created them; ensure role correctness (allowlist already sets admin)
  -- But force exact values for determinism: update names/phones if trigger used defaults
  update public.profiles set name='Sifa Admin', phone='+8801712345678', role='admin', email='admin@sifa.local' where id=admin_id;
  update public.profiles set name='Amina Otieno', phone='+8801865858544', role='customer', email='customer@sifa.local' where id=cust_id;
  update public.profiles set name='James Kimani', phone='+8801923456789', role='customer', email='james.kimani@sifa.local' where id=cust2_id;
end $$;

-- 6. ADDRESSES (for customers, deterministic)
do $$
declare
  cust_id uuid := '22222222-2222-2222-2222-222222222222';
  cust2_id uuid := '33333333-3333-3333-3333-333333333333';
begin
  if (select count(*) from public.addresses) > 0 then return; end if;
  insert into public.addresses (user_id, label, street, city, county, postal_code, is_default) values
    (cust_id, 'Home', '12 Riverside Drive, Apt 4B', 'Nairobi', 'Nairobi', '00100', true),
    (cust_id, 'Work', 'Westlands Business Park, Block A', 'Nairobi', 'Nairobi', '00606', false),
    (cust2_id, 'Home', 'Moi Avenue 45', 'Mombasa', 'Mombasa', '80100', true);
end $$;

-- 7. SAMPLE ORDER (for customer@sifa.local) with 2 items, PENDING
do $$
declare
  cust_id uuid := '22222222-2222-2222-2222-222222222222';
  v_order_id uuid;
  v_prod1 uuid;
  v_prod2 uuid;
  v_addr text;
  v_name text;
begin
  if (select count(*) from public.orders) > 0 then return; end if;
  select (street || ', ' || city || ', ' || coalesce(county,'') || ' ' || coalesce(postal_code,'')) into v_addr from public.addresses where user_id=cust_id and is_default=true limit 1;
  select name into v_name from public.profiles where id=cust_id;
  -- pick two active products
  select id into v_prod1 from public.products where name='Paracetamol 500mg Tablets 20s' limit 1;
  select id into v_prod2 from public.products where name='Vitamin C 1000mg Tablets 30s' limit 1;

  insert into public.orders (order_number, customer_id, customer_name, status, subtotal, discount, delivery_fee, total, payment_method, address, timeline, created_at, updated_at)
  values (
    'ORD-0001', cust_id, v_name, 'PENDING',
    1030, 0, 150, 1180, 'CASH_ON_DELIVERY', v_addr,
    jsonb_build_array(jsonb_build_object('label','Order placed','time', now()::text, 'note','Awaiting confirmation')),
    now() - interval '2 hours', now() - interval '2 hours'
  ) returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, quantity, unit_price, discount_percent, total) values
    (v_order_id, v_prod1, 'Paracetamol 500mg Tablets 20s', 2, 250, 17, 500),
    (v_order_id, v_prod2, 'Vitamin C 1000mg Tablets 30s', 1, 780, 18, 780);

  -- second order DELIVERED for customer2, to test history/returns
  declare
    cust2_id uuid := '33333333-3333-3333-3333-333333333333';
    v_order2 uuid;
    v_prod3 uuid;
    v_addr2 text;
    v_name2 text;
  begin
    select (street || ', ' || city) into v_addr2 from public.addresses where user_id=cust2_id limit 1;
    select name into v_name2 from public.profiles where id=cust2_id;
    select id into v_prod3 from public.products where name='Amoxicillin 500mg Capsules 21s' limit 1;
    insert into public.orders (order_number, customer_id, customer_name, status, subtotal, discount, delivery_fee, total, payment_method, address, timeline, created_at, updated_at)
    values (
      'ORD-0002', cust2_id, v_name2, 'DELIVERED',
      850, 0, 150, 1000, 'CASH_ON_DELIVERY', v_addr2,
      jsonb_build_array(
        jsonb_build_object('label','Order placed','time', (now() - interval '5 days')::text),
        jsonb_build_object('label','Confirmed','time', (now() - interval '4 days')::text),
        jsonb_build_object('label','Out for delivery','time', (now() - interval '1 day')::text),
        jsonb_build_object('label','Delivered','time', now()::text)
      ),
      now() - interval '5 days', now()
    ) returning id into v_order2;
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price, discount_percent, total)
    values (v_order2, v_prod3, 'Amoxicillin 500mg Capsules 21s', 1, 850, 15, 850);
  end;
end $$;

-- 8. NOTIFICATIONS (sample for each user)
do $$
declare
  cust_id uuid := '22222222-2222-2222-2222-222222222222';
  admin_id uuid := '11111111-1111-1111-1111-111111111111';
begin
  if (select count(*) from public.notifications) > 0 then return; end if;
  insert into public.notifications (user_id, title, body, type, read) values
    (cust_id, 'Welcome to Sifa Pharma', 'Your account is ready. Browse medicines by category.', 'info', false),
    (cust_id, 'Order ORD-0001 received', 'Your order is pending confirmation. Cash on delivery.', 'success', false),
    (admin_id, 'New order ORD-0001', 'Customer Amina Otieno placed an order worth KES 1,180.', 'alert', false),
    (admin_id, 'Low stock alert', 'Ibuprofen 400mg is below threshold (8 units).', 'warning', false);
end $$;
