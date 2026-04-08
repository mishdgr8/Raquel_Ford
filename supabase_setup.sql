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
CREATE POLICY "Public Read Access" ON public.media FOR SELECT USING (true);
CREATE POLICY "Authenticated Insert Access" ON public.media FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated Update Access" ON public.media FOR UPDATE USING (true);
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
CREATE POLICY "Public Read Access" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Authenticated Manage Access" ON public.tags FOR ALL USING (true);

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
CREATE POLICY "Public Read Access" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON public.comments FOR INSERT WITH CHECK (true);

-- 4. Newsletter Subscribers Table
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
CREATE POLICY "Public Insert" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "View for authenticated" ON public.newsletter_subscribers FOR SELECT USING (true);
