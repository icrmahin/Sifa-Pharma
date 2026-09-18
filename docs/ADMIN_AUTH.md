# Admin Authorization — Local Development

This document explains how the `admin` role works locally without weakening RLS.

## 1. Database-level truth

- `public.profiles.role` is the source of truth (`customer` | `admin`).
- All RLS policies for admin operations use `public.is_admin()`:

```sql
create or replace function public.is_admin() returns boolean
language sql security definer set search_path=public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role='admin');
$$;
```

Example policies (see `supabase/migrations/20260918020000_fix_admin_rls.sql`):

- `profiles`: `using (auth.uid()=id or is_admin())`
- `products`: `using (is_active=true or is_admin())` for select, `using(is_admin()) with check(is_admin())` for all
- `inventory_items`, `stock_adjustments`, `orders`, `order_items`, `return_requests`, `delivery_cycles`, `audit_entries` – admin-only select/all via `is_admin()`

No policy uses `auth.jwt()->>'role'`. This avoids the broken assumption that the JWT contains `role='admin'`.

## 2. JWT custom claim (defense in depth)

A custom access token hook injects `role` into the JWT claims for clients that still read `role` from the token:

```sql
create or replace function public.custom_access_token_hook(event jsonb) returns jsonb ...
```

Enabled in `supabase/config.toml`:

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/custom_access_token_hook"
```

## 3. Profile creation

`public.handle_new_user()` trigger on `auth.users` inserts into `public.profiles`:

```sql
v_role := coalesce(new.raw_user_meta_data->>'role','customer');
if new.email = 'admin@sifa.local' then v_role := 'admin'; end if;
insert into profiles (id, name, email, phone, role) values (... v_role ...)
on conflict (id) do update set role=excluded.role;
```

- Normal sign-ups via `supabase.auth.signUp({ email, password, options:{data:{name,phone,role:'customer'}}})` become `customer`.
- The allowlist email `admin@sifa.local` is always promoted to `admin` even if metadata says otherwise.

## 4. Deterministic local seed

`supabase/seed.sql` creates three fixed users (run via `npx supabase db reset`):

| email | password | id | role | name |
|-------|----------|----|------|------|
| `admin@sifa.local` | `Admin123!` | `11111111-1111-1111-1111-111111111111` | admin | Sifa Admin |
| `customer@sifa.local` | `Customer123!` | `22222222-2222-2222-2222-222222222222` | customer | Amina Otieno |
| `james.kimani@sifa.local` | `Customer123!` | `33333333-3333-3333-3333-333333333333` | customer | James Kimani |

Passwords hashed with `crypt(..., gen_salt('bf'))`. Identities inserted into `auth.identities`. Profiles are auto-created by the trigger and then forced to exact values for determinism.

## 5. How to test locally

```bash
npx supabase db reset            # recreates DB, runs migrations + seed.sql
# Admin login (local Supabase on 54321)
curl -X POST http://127.0.0.1:54321/auth/v1/token?grant_type=password \
  -H "apikey: $ANON_KEY" -H "Content-Type: application/json" \
  -d '{"email":"admin@sifa.local","password":"Admin123!"}'

# Customer login
curl ... -d '{"email":"customer@sifa.local","password":"Customer123!"}'
```

In-app: use Expo app, sign in with those credentials. `AuthProvider` reads `user_metadata.role`; `useAdmin` guards dashboard. RLS ensures customers get 0 rows for `inventory_items`/`audit_entries` and only own `orders`/`profiles`, while admin sees all.

## 6. Creating an additional admin locally

Option A – sign up with allowlist email:

```ts
await supabase.auth.signUp({
  email: 'admin@sifa.local',
  password: '...',
  options: { data: { name: 'New Admin', phone: '+2547...', role: 'admin' } }
});
```

Option B – promote existing user via SQL (local only):

```sql
update public.profiles set role='admin' where email='someone@sifa.local';
-- or
update auth.users set raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb where email='someone@sifa.local';
-- then user must re-login to refresh JWT
```

Never weaken RLS to `true` or `auth.role() = 'admin'` on remote.

## 7. Why not `auth.jwt()->>'role'` alone

Default Supabase JWT has `role='authenticated'` (the Postgres role), not the app role. Without the custom hook, `auth.jwt()->>'role'='admin'` never matches. `is_admin()` querying `profiles` is correct and works both with and without the hook.

## 8. Files to audit

- `supabase/migrations/20260918010000_initial_schema.sql` – base schema
- `supabase/migrations/20260918020000_fix_admin_rls.sql` – replaces JWT checks with `is_admin()`
- `supabase/seed.sql` – deterministic categories/manufacturers/products/inventory/users
- `supabase/config.toml` – hook activation
- `src/lib/mappers.ts` – snake→camel mapping for products/orders
