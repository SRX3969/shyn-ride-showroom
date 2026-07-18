
# SHYN RIDE — Build Plan

Your spec targets Next.js + Prisma + NextAuth, but this project is on **TanStack Start + Lovable Cloud (Supabase)**. I'll build the same product on this stack — same pages, same data model, same admin panel — just using the platform-native primitives. This avoids fighting the template and gets you a working site fast.

## Stack mapping

| Spec | What I'll actually use |
|---|---|
| Next.js App Router | TanStack Start file-based routes (`src/routes/`) |
| Prisma + Postgres | Lovable Cloud (Supabase Postgres) via migrations |
| NextAuth Credentials | Supabase Auth (email+password) + `user_roles` table with `admin` role. Admin access = row in `user_roles`. No public signup UI; you seed the first admin. |
| Cloudinary/S3 | Supabase Storage bucket `car-images` |
| Server actions | `createServerFn` with `requireSupabaseAuth` + role check |

Rationale: Supabase Auth is battle-tested, integrates with RLS, and lets us gate admin routes cleanly. "Username + password" becomes "email + password" — functionally identical for a 2-user dealer back office. If you truly need username-only login, say so and I'll add a username column that resolves to a synthetic email.

## Design system

Building the "Quiet Showroom" palette as semantic tokens in `src/styles.css`:
- `--background` = obsidian `#0B0C0E`
- `--card` = charcoal `#17181B`
- `--foreground` = ivory `#F3EFE8`
- `--primary` (accent) = champagne `#C9A86A`
- `--muted-foreground` = slate `#8A8D93`
- `--accent` = deep emerald `#10201B`
- Fonts: **Fraunces** (display) + **Inter** (body), loaded via `<link>` in `__root.tsx`
- Chrome-sweep hover as a reusable utility class
- Scroll-reveal via a small IntersectionObserver hook, respecting `prefers-reduced-motion`

## Data model (Supabase)

```
cars(id uuid pk, slug unique, make, model, variant, year int, price_inr bigint,
     price_negotiable bool, km int, fuel_type, transmission, body_type, color,
     owners int, reg_state, status ['available','booked','sold'], featured bool,
     description text, features text[], created_at, updated_at)
car_images(id, car_id fk, url, alt, sort_order)
enquiries(id, type ['car_enquiry','sell_request'], name, phone, email, message,
          car_id nullable, status ['new','contacted','closed'], created_at)
site_content(key pk, value jsonb)  -- hero copy, trust strip, about, testimonials, faqs
user_roles(user_id fk auth.users, role app_role)  -- standard Lovable pattern
```

RLS:
- `cars`, `car_images`: public SELECT where status ≠ soft-deleted; admin writes
- `enquiries`: public INSERT only; admin SELECT/UPDATE
- `site_content`: public SELECT; admin writes
- `user_roles`: authenticated SELECT own, no client writes

Storage bucket `car-images`: public read, admin write.

## Routes

**Public**
- `/` — Home (hero, trust strip, browse by body type, why us, browse by budget, featured inventory, sell CTA, testimonials, footer)
- `/inventory` — filter sidebar + grid, sort, pagination
- `/inventory/$slug` — gallery, specs, description, features, enquire form, WhatsApp CTA, similar cars
- `/about`, `/sell-your-car`, `/contact`, `/faqs`

**Admin** (under `_authenticated` layout + admin role gate)
- `/admin/login`
- `/admin` — dashboard stats + recent enquiries
- `/admin/cars` — table with search/filter
- `/admin/cars/new` and `/admin/cars/$id/edit` — full form + multi-image upload with drag reorder
- `/admin/enquiries` — tabs for car enquiries vs sell requests, inline status
- `/admin/content` — edit hero/trust/about/testimonials/FAQs

**SEO**: per-route `head()` with title/description/og; per-car og:image from cover photo; `sitemap.xml` route + `robots.txt`.

## Build order

1. Enable Lovable Cloud + migrations (schema, RLS, storage bucket, seed 8 sample cars, seed site_content, create `has_role`)
2. Design system tokens + fonts + chrome-sweep utility
3. Public shell: root layout, header, footer, home page against seed data
4. Inventory list + filters + detail page
5. Static pages (about, contact, sell, faqs) + enquiry server functions
6. Admin auth gate + login + dashboard
7. Admin cars CRUD with Supabase Storage upload
8. Admin enquiries + content editor
9. SEO polish, sitemap, scroll reveals, responsive pass

## Scope notes

- Sample car photos will be AI-generated (luxury sedan/SUV/coupe stills) so no copyright risk — you can swap them in the admin panel.
- Placeholder copy throughout, editable from `/admin/content`.
- First admin user: I'll add a seeded admin — you'll set the password on first login via a one-time reset flow, or you can tell me the email now and I'll wire it up.
- No CSV export in v1 (you flagged it as nice-to-have).
- Soft delete via a `deleted_at` timestamp column on `cars`.

This is a large build — expect it to span multiple turns. I'll enable Cloud and start with schema + design system first, then iterate.

**One question before I start:** what email should the initial admin account use? (I need it to seed the admin role. You'll set the password on first sign-in.)
