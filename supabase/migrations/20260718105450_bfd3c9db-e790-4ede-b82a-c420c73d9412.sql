
-- Roles system
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Cars
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  year INT NOT NULL,
  price_inr BIGINT NOT NULL,
  price_negotiable BOOLEAN NOT NULL DEFAULT false,
  km INT NOT NULL DEFAULT 0,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  body_type TEXT NOT NULL,
  color TEXT NOT NULL,
  owners INT NOT NULL DEFAULT 1,
  reg_state TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  featured BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cars TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cars TO authenticated;
GRANT ALL ON public.cars TO service_role;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads visible cars" ON public.cars FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);
CREATE POLICY "Admins insert cars" ON public.cars FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update cars" ON public.cars FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete cars" ON public.cars FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER cars_updated_at BEFORE UPDATE ON public.cars FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX cars_status_idx ON public.cars(status) WHERE deleted_at IS NULL;
CREATE INDEX cars_featured_idx ON public.cars(featured) WHERE deleted_at IS NULL AND featured = true;
CREATE INDEX cars_body_type_idx ON public.cars(body_type);

-- Car images
CREATE TABLE public.car_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.car_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.car_images TO authenticated;
GRANT ALL ON public.car_images TO service_role;
ALTER TABLE public.car_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads car images" ON public.car_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage car images" ON public.car_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX car_images_car_idx ON public.car_images(car_id, sort_order);

-- Enquiries
CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
  car_details JSONB,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.enquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submits enquiries" ON public.enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read enquiries" ON public.enquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update enquiries" ON public.enquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete enquiries" ON public.enquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Site content (key/value)
CREATE TABLE public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads site content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage site content" ON public.site_content FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
