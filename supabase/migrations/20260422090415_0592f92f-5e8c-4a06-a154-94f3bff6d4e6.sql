-- Cache tables for translations, news, and booth searches
CREATE TABLE public.translations_cache (
  id BIGSERIAL PRIMARY KEY,
  original TEXT NOT NULL,
  translated TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (original, language)
);
CREATE INDEX idx_translations_lookup ON public.translations_cache (language, original);

ALTER TABLE public.translations_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Translations cache readable by everyone"
  ON public.translations_cache FOR SELECT USING (true);
CREATE POLICY "Translations cache insertable by everyone"
  ON public.translations_cache FOR INSERT WITH CHECK (true);

CREATE TABLE public.news_cache (
  id BIGSERIAL PRIMARY KEY,
  headline TEXT,
  description TEXT,
  source TEXT,
  url TEXT UNIQUE,
  image_url TEXT,
  category TEXT DEFAULT 'all',
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_news_published ON public.news_cache (published_at DESC);
CREATE INDEX idx_news_category ON public.news_cache (category, published_at DESC);

ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News cache readable by everyone"
  ON public.news_cache FOR SELECT USING (true);

CREATE TABLE public.booth_searches (
  id BIGSERIAL PRIMARY KEY,
  latitude DECIMAL,
  longitude DECIMAL,
  pincode TEXT,
  results JSONB,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_booth_location ON public.booth_searches (latitude, longitude);

ALTER TABLE public.booth_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Booth searches readable by everyone"
  ON public.booth_searches FOR SELECT USING (true);
CREATE POLICY "Booth searches insertable by everyone"
  ON public.booth_searches FOR INSERT WITH CHECK (true);