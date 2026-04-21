-- SQL to create missing tables for the Raquel Ford Blog CMS
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Media Table
CREATE TABLE IF NOT EXISTS public.media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  name TEXT,
  file_name TEXT,
  type TEXT,
  size BIGINT,
  extension TEXT,
  alt_text TEXT DEFAULT '',
  title TEXT,
  caption TEXT DEFAULT '',
  description TEXT DEFAULT '',
  slug TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Media
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.media;
CREATE POLICY "Public Read Access" ON public.media FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Insert Access" ON public.media;
CREATE POLICY "Authenticated Insert Access" ON public.media FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated Update Access" ON public.media;
CREATE POLICY "Authenticated Update Access" ON public.media FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Authenticated Delete Access" ON public.media;
CREATE POLICY "Authenticated Delete Access" ON public.media FOR DELETE USING (true);

-- 2. Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.tags;
CREATE POLICY "Public Read Access" ON public.tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Manage Access" ON public.tags;
CREATE POLICY "Authenticated Manage Access" ON public.tags FOR ALL USING (true) WITH CHECK (true);

-- 3. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.comments;
CREATE POLICY "Public Read Access" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Access" ON public.comments;
CREATE POLICY "Public Insert Access" ON public.comments FOR INSERT WITH CHECK (true);

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  order_index INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.categories;
CREATE POLICY "Public Read Access" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Manage Access" ON public.categories;
CREATE POLICY "Authenticated Manage Access" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- 5. Articles Table
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content_html TEXT,
  content_json JSONB DEFAULT '{"blocks": []}',
  featured_image TEXT,
  cover_media_id TEXT,
  category_id UUID REFERENCES public.categories(id),
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  og_media_id TEXT,
  is_editors_pick BOOLEAN DEFAULT false,
  is_explore_the_mix BOOLEAN DEFAULT false,
  editor_pick_order INTEGER,
  heading_style TEXT DEFAULT 'none',
  tags TEXT[] DEFAULT '{}',
  tag_slugs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.articles;
CREATE POLICY "Public Read Access" ON public.articles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Manage Access" ON public.articles;
CREATE POLICY "Authenticated Manage Access" ON public.articles FOR ALL USING (true) WITH CHECK (true);

-- 6. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  source TEXT DEFAULT 'unknown',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Newsletter
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Insert" ON public.newsletter_subscribers;
CREATE POLICY "Public Insert" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "View for authenticated" ON public.newsletter_subscribers;
CREATE POLICY "View for authenticated" ON public.newsletter_subscribers FOR SELECT USING (true);

-- 7. Page Templates Table
CREATE TABLE IF NOT EXISTS public.page_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  page_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Page Templates
ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.page_templates;
CREATE POLICY "Public Read Access" ON public.page_templates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Manage Access" ON public.page_templates;
CREATE POLICY "Authenticated Manage Access" ON public.page_templates FOR ALL USING (true) WITH CHECK (true);

-- 8. Block Instances Table
CREATE TABLE IF NOT EXISTS public.block_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.page_templates(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  config_json JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Block Instances
ALTER TABLE public.block_instances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.block_instances;
CREATE POLICY "Public Read Access" ON public.block_instances FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Manage Access" ON public.block_instances;
CREATE POLICY "Authenticated Manage Access" ON public.block_instances FOR ALL USING (true) WITH CHECK (true);

-- 9. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY,
  config JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Site Settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON public.site_settings;
CREATE POLICY "Public Read Access" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated Manage Access" ON public.site_settings;
CREATE POLICY "Authenticated Manage Access" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
