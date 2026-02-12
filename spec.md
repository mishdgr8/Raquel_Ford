# Raquel Ford — Blog Website Spec (v1.0)

A content-driven blog/magazine-style website for **Raquel Ford**, with a **newsletter**, category-based browsing, and an **admin dashboard** that provides full layout control via a **block-based CMS** (reusable sections and page templates). The admin can create/edit/publish content, manage media uploads, and configure site layout without code.

---

## 1) Goals

### Primary goals
- Publish articles with strong reading UX (fast, clean, SEO-friendly).
- Support category browsing + “magazine” layout sections (Latest, Editor’s Pick, IG Reels, Magazine download).
- Grow audience via newsletter signup (site-wide + per-article CTA).
- Provide a **block-based admin** to control page layouts and content sections.
- Enable secure, scalable content + media storage with robust backend infrastructure.

### Non-goals (v1)
- Multi-author editorial workflow with approvals (optional v1.1).
- Paid subscriptions / paywalls.
- Full community forum (comments only, basic).

---

## 2) Information Architecture

### Public pages (from the wireframe)
1. **Landing Page (Home)**  
   - Nav bar + logo
   - Categories (Food, Fashion, Entertainment, Awards, Lifestyle, Travel)
   - Hero carousel (featured content)
   - Latest Articles (top 5)
   - Editor’s Pick (curated grid)
   - IG Reels embed strip
   - Magazine section (download link + promo tiles)
   - Footer

2. **Articles Page (Category / Feed)**  
   - Article cards list (paged)
   - Sidebar: Blog details module + Newsletter signup + promo tiles/ads (optional)
   - Pagination

3. **Content Page (Article Detail)**  
   - Article header (title, author, timestamp)
   - Main content
   - Related content cards
   - Newsletter CTA
   - Comment section

### Admin pages
- **Admin Login**
- **Dashboard Overview**
- **Content Manager**
  - Articles (list, create, edit, schedule, publish)
  - Categories/tags
- **Layout Builder (Block CMS)**
  - Home page layout
  - Category page layout
  - Article page layout modules (e.g., related, newsletter CTA)
- **Media Library**
  - Upload images/video thumbnails/files
  - Organize folders/tags
- **Newsletter**
  - Subscribers list
  - Export CSV
  - Integrations (Mailchimp/Brevo/etc) or built-in sending (optional)
- **Site Settings**
  - Branding (logo, favicon)
  - SEO defaults
  - Social links
  - Footer content
- **Users & Roles** (optional v1.1 if needed beyond single admin)

---

## 3) UX + Layout Requirements (matching wireframe)

### 3.1 Global Header / Nav
**Components**
- Logo (left)
- Primary categories menu (horizontal)
- Search icon/input (recommended)
- Newsletter CTA button (optional)
- Mobile: hamburger menu with category list

**Behavior**
- Sticky header on scroll (optional)
- Current category highlighted on category pages

---

### 3.2 Landing Page (Home)
**Sections (block-configurable)**
1. **Hero Carousel**
   - 3–6 featured posts
   - Each slide: category label, title, short subheading/excerpt, CTA “Read”
   - Auto-advance (optional), manual nav dots/arrows
   - Admin selects:
     - posts (manual) OR rule-based (e.g., “featured=true” latest 5)

2. **Latest Articles**
   - Shows 5 latest published posts (default)
   - Card includes: cover image, title, category, preview excerpt, “Read more”
   - Admin controls count (3–12) and layout (list/grid)

3. **Editor’s Pick**
   - Curated selection of 4–8 posts
   - Mixed card sizes (magazine feel)
   - Admin-managed list order

4. **IG Reels**
   - Horizontal strip of embedded Instagram reels or short videos
   - Admin can paste reel URLs or select from saved embeds
   - Fallback image cards if embed fails

5. **Magazine**
   - Promo area for downloadable content (PDF, ePub, or external link)
   - Includes:
     - Title, short description, cover image
     - “Download” button (tracked)
     - Optional secondary promo tiles

6. **Footer**
   - About snippet
   - Social links
   - Newsletter mini form (optional)
   - Legal links (Privacy, Terms)

---

### 3.3 Articles Page (Category Feed)
**Main column**
- Repeating “Article block” cards:
  - Category label
  - Headline
  - Author + timestamp
  - Cover image
  - Excerpt
  - Read more link
- Pagination (classic) or “Load more”

**Sidebar modules (block-configurable)**
- Blog details (short bio + headshot)
- Newsletter signup
- Promo tiles / sponsored slots (optional)
- “Most read” list (optional)

**Filtering**
- Category filter (already implied)
- Optional tag filter
- Search

---

### 3.4 Content Page (Article Detail)
**Header**
- Title (H1)
- Author name + avatar (optional)
- Publish date + reading time
- Category label(s)

**Body**
- Block-based article content rendering (paragraphs, headings, images, embeds, quotes)
- Optional table of contents (if long-form)

**Below content**
- Related articles (2–6)
- Newsletter signup module
- Comments section

**Comments (v1 simple)**
- Option A: embed third-party (Disqus or similar)
- Option B: native comments (requires moderation tools)
  - If native: require name + email, optional login, spam protection, admin moderation queue

---

## 4) Admin: Block-Based CMS Requirements

### 4.1 Concept
The admin can build pages using **blocks** (sections) that can be arranged, configured, saved as templates, and reused.

**Entities**
- `BlockType`: e.g., HeroCarousel, PostGrid, PostList, NewsletterSignup, SidebarBio, EmbedStrip, DownloadPromo, FooterLinks
- `BlockInstance`: an instance of a block on a page with configuration
- `PageTemplate`: ordered list of block instances for a given route/page (Home, Category, Article)

### 4.2 Layout Builder Capabilities
- Drag-and-drop reorder blocks
- Add/remove blocks
- Configure block settings in a right-side panel
- Save draft layout / publish layout
- Preview mode (desktop/tablet/mobile breakpoints)
- Versioning (at least keep last 10 revisions)
- “Revert to previous version”

### 4.3 Block Configuration Examples
**HeroCarousel block**
- Mode: manual posts OR rule-based
- Filters: category, tag, featured flag
- Count
- Slide style: overlay text / split layout
- Autoplay on/off

**PostGrid/PostList block**
- Source: latest / category / tag / manual selection
- Sort: newest / most read (if tracked)
- Count, columns
- Show/hide excerpt/author/date

**NewsletterSignup block**
- Title, description copy
- List/integration target
- Success message
- Privacy note

**EmbedStrip block**
- Embed URLs list
- Display mode: embed vs thumbnail-only

**MagazinePromo block**
- Cover image
- Description
- Download link or uploaded file reference
- Track downloads

---

## 5) Content Authoring Requirements

### 5.1 Article Editor
The admin article editor must support:
- Title, slug (auto-generated, editable)
- Category (single primary) + tags (multiple)
- Cover image + alt text
- Excerpt/summary
- Featured toggle (for hero/editor’s pick)
- Status: Draft, Scheduled, Published, Archived
- Publish date/time scheduling
- SEO fields:
  - Meta title, meta description
  - OG image override (optional)
- Content body: block-based rich editor
  - Paragraph, headings (H2/H3), image, gallery, quote, list, divider, embed (YouTube/IG/Twitter), callout, CTA button

### 5.2 Media Uploads
Admin can upload:
- Images (jpg/png/webp), video thumbnails, PDFs
- Automatic:
  - Virus scan (recommended)
  - Image optimization (resize + webp)
  - Stored in object storage (S3-compatible)
- Media metadata:
  - filename, alt text, caption, tags, created date, size, dimensions

---

## 6) Newsletter Requirements

### 6.1 Signup
Signup placements:
- Home page (optional block)
- Sidebar on articles page
- On article page (inline + below article)

Form fields:
- Email (required)
- First name (optional)
- Consent checkbox (optional, depending on compliance needs)

Behavior:
- Double opt-in (recommended)
- Success state + error states
- Rate limiting + bot protection (reCAPTCHA/hCaptcha)

### 6.2 Storage + Integration
Two supported models:
- **Integration-first**: send subscribers directly to Mailchimp/Brevo/ConvertKit, store minimal local record.
- **Hybrid**: store locally + sync to provider.

Admin tools:
- Export CSV
- View signup source (page/placement)
- Basic analytics: total subscribers, growth over time (optional)

---

## 7) Backend + Database Infrastructure

### 7.1 Core Requirements
- Stable schema for articles, blocks, templates, media, newsletter, analytics.
- Support drafts + scheduled publishing.
- Support content versioning (articles + layouts).
- Fast read performance with caching.
- Secure admin access.

### 7.2 Recommended Architecture (practical + scalable)
- **Frontend**: Next.js (or similar) with SSR/ISR for SEO + speed
- **API**: REST or GraphQL (REST is fine)
- **Database**: PostgreSQL
- **Cache**: Redis (for page fragments, popular queries)
- **Search**: Postgres full-text initially; upgrade to Meilisearch/Algolia later
- **File storage**: S3-compatible object storage (AWS S3, Cloudflare R2, etc)
- **CDN**: Cloudflare or equivalent

### 7.3 Data Model (high-level)
**Articles**
- id (uuid)
- title
- slug (unique)
- excerpt
- content_json (block content)
- cover_media_id
- category_id
- status (draft/scheduled/published/archived)
- published_at, scheduled_at
- seo_title, seo_description, og_media_id
- created_at, updated_at

**Categories**
- id
- name
- slug
- order_index

**Tags**
- id, name, slug

**ArticleTags (join)**
- article_id, tag_id

**Media**
- id
- url
- type (image/pdf/video_thumb)
- width, height, size_bytes
- alt_text, caption
- created_at

**PageTemplates**
- id
- page_type (home/category/article)
- name
- is_active
- created_at, updated_at

**BlockInstances**
- id
- template_id
- block_type
- config_json
- order_index

**NewsletterSubscribers**
- id
- email (unique)
- first_name (nullable)
- status (pending/active/unsubscribed)
- source (home/sidebar/article)
- created_at

**LayoutRevisions** (optional but recommended)
- id
- template_id
- snapshot_json
- created_at
- created_by

**ArticleRevisions**
- id
- article_id
- snapshot_json
- created_at
- created_by

**AnalyticsEvents (optional)**
- id
- type (view, click, download)
- entity_type (article, magazine)
- entity_id
- metadata_json
- created_at

### 7.4 Publishing Pipeline
- Draft saved as revisions
- On publish:
  - Validate required fields
  - Generate canonical URL
  - Trigger cache revalidation (home/category pages)
- Scheduled posts:
  - Background worker checks schedule
  - Publishes and triggers revalidation

---

## 8) Performance + SEO Requirements

### SEO
- Clean URLs: `/category/<slug>`, `/articles/<slug>`
- Meta tags per page (title/description)
- OpenGraph + Twitter card
- Sitemap.xml (auto-generated)
- robots.txt
- Structured data (Article schema recommended)

### Performance
- Image lazy loading + responsive srcsets
- CDN for media
- Cache page data / ISR where possible
- Target Core Web Vitals: LCP < 2.5s on mobile (goal)

---

## 9) Security Requirements

- Admin authentication:
  - Email/password with strong policy, or OAuth (Google)
  - MFA recommended
- Role-based access (even if single admin now)
- CSRF protection (if cookies used)
- Rate limit login + newsletter endpoints
- Secure file uploads (mime validation, size limits)
- Audit log of admin actions (optional but recommended)

---

## 10) Accessibility Requirements

- Semantic HTML headings
- Keyboard navigable menus and carousels
- Alt text required for images in articles
- Color contrast and focus states

---

## 11) MVP Scope (what to build first)

### MVP (v1)
- Public:
  - Home (with hero, latest, editor’s pick, newsletter, magazine)
  - Category feed page with pagination + sidebar newsletter
  - Article detail page with related + newsletter + comments (3rd party ok)
- Admin:
  - Login
  - Article CRUD + scheduling
  - Media library upload
  - Layout builder for home + category + article modules
  - Newsletter subscriber capture + export

### v1.1 Enhancements
- Native comments moderation
- “Most read” + analytics dashboard
- Multi-admin roles (editor vs admin)
- Advanced search and filters
- A/B testing for newsletter CTA placements

---

## 12) Acceptance Criteria (examples)

- Admin can create and publish an article that appears:
  - in Latest Articles on Home (if newest),
  - on its category feed,
  - on the article detail page with correct metadata.
- Admin can rearrange Home blocks and publish layout changes without code.
- Newsletter signup works from:
  - home,
  - articles page sidebar,
  - content page,
  and stores subscribers (active/pending) reliably.
- Media uploads are accessible, optimized, and reusable across posts.
- Category feed pagination loads correctly and remains SEO-friendly.

---

## 13) Deliverables

- Working responsive website (desktop + mobile)
- Admin dashboard with block-based layout builder
- Database + migrations
- API endpoints documentation (or OpenAPI spec)
- Deployment instructions + environment variables list
- Basic monitoring/logging setup

---

## 14) Suggested API Endpoints (minimal)

**Public**
- `GET /api/home` (returns assembled home layout + resolved article lists)
- `GET /api/categories`
- `GET /api/category/:slug?page=`
- `GET /api/article/:slug`
- `POST /api/newsletter/subscribe`

**Admin (protected)**
- `POST /api/admin/login`
- `GET/POST/PUT/DELETE /api/admin/articles`
- `POST /api/admin/media/upload`
- `GET/PUT /api/admin/templates/:pageType`
- `GET /api/admin/newsletter/subscribers?export=csv`

---

## 15) Notes on Wireframe Mapping

- The wireframe’s “Blog Details” sidebar is a configurable block (bio + links).
- The “Newsletter Sign Up” appears as a reusable block across pages.
- “Magazine download” is a promo block that can reference an uploaded PDF or external link.
- The article page’s “Related content” is a block that can be rule-based (same category/tag) or curated.

---
