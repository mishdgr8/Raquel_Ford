

FEATURE PROMPTS
PROMPT 1 — Advanced Quote Block Component

Build a CMS Quote Block component with the following requirements:

Quote text renders in italics

Custom text color configurable in admin

Dedicated “Author” field

Optional “Author Title / Source” field

Admin can style:

Text color

Background color

Border accent

Must support:

Markdown conversion

Rich text editor support

Fully responsive

Accessible (ARIA compliant)

Deliver:

Database schema addition

Admin UI controls

Frontend rendering logic

Styling system (CSS modules or Tailwind)

Example component code

Ensure this is reusable inside a block-based content editor.

PROMPT 2 — Secure Embeds (YouTube + Instagram)

Implement secure embed support inside the CMS.

Requirements:

Admin can paste:

YouTube URL

Instagram Post URL

System auto-detects type

Automatically transforms into secure embed

Sanitized HTML (prevent XSS)

Lazy-loaded embeds

Responsive iframe wrapper

Consent-aware loading (privacy-first optional)

Deliver:

URL parser logic

Embed component abstraction

Sanitization strategy

Backend validation

Frontend rendering

Database schema update

PROMPT 3 — Heading Capitalization Control

Implement heading control inside the content editor:

Requirements:

Headings (H1–H6) fully editable

Admin can:

Toggle auto-uppercase

Choose sentence case

Choose title case

Do NOT force capitalization automatically

Preserve editorial control

Deliver:

Editor configuration

Data storage approach

Rendering logic

UX flow explanation

PROMPT 4 — Responsive Gallery Block

Create an Image Gallery Block.

Requirements:

Admin selects multiple images

Display:

Desktop → 3 per row

Mobile → 2 per row

Masonry optional

Click to expand (lightbox)

Lazy load

Optimized images (WebP conversion)

CDN-ready

Deliver:

Database schema

Admin multi-select logic

Responsive CSS grid

Lightbox implementation

Performance strategy

PROMPT 5 — Advanced Image SEO Management

Enhance image upload system.

Admin must be able to:

Edit:

Title

Alt text

Caption

Description

File name (before upload)

Auto-generate:

Slug

Structured data (ImageObject schema)

Store EXIF metadata optionally

Enforce alt-text requirement

Deliver:

Image schema

Upload pipeline

Storage strategy (S3 compatible)

SEO structured data implementation

Admin UI flow

PROMPT 6 — Article Analytics Tracking

Implement per-article metrics.

Track:

Page views

Unique reads

Avg read time

Scroll depth

Bounce rate

Referrer source

Requirements:

Avoid inflated bot traffic

Lightweight tracking

GDPR-ready

Store aggregated daily metrics

Deliver:

Tracking architecture

Database schema

API endpoint

Analytics logic

Frontend hook

PROMPT 7 — Social Share Module

At end of each article:

Add share buttons for:

Twitter/X

Facebook

LinkedIn

WhatsApp

Requirements:

Dynamic share URL

UTM parameters

OpenGraph meta tags auto-generated

Click tracking

Mobile optimized

Deliver:

Component implementation

OG tag generation logic

Tracking logic

SEO considerations

PROMPT 8 — Bulk Article Management

In Admin Panel:

Add batch select functionality:

Checkbox per article

“Select all”

Bulk delete

Bulk draft

Bulk publish

Confirmation modal

Soft delete option

Deliver:

Database approach (soft delete)

Admin UI table design

API routes

Permission control

PROMPT 9 — Pin Articles Feature (Editors Pick)

Add pinning functionality.

Requirements:

Admin can pin 1 or more articles

Pinned articles appear:

At top of articles page

Under “Editor’s Pick” section

Sortable pinned order

Toggle pin from article table

Visually marked in admin list

Deliver:

Schema changes

Sorting logic

Admin UI toggle

Frontend query logic

Cache strategy

PROMPT 10 — WordPress-like Admin UI

Design Admin UI similar to WordPress for onboarding familiarity.

Requirements:

Left sidebar navigation

Posts

Media

Analytics

Settings

Dashboard

Clean table-based article list

Quick edit inline

Deliver:

Layout structure

Component hierarchy

UI library suggestion

UX rationale

Accessibility considerations

PROMPT 11 — Writer Analytics Dashboard

Build a comprehensive analytics dashboard.

Display:

Total visits

Unique users

Articles published

Top 5 posts

Traffic sources

Device breakdown

Engagement time

CTR from shares

Growth over time (line graph)

Requirements:

Interactive charts

Filter by date range

Compare periods

Export CSV

Deliver:

Dashboard architecture

Data aggregation logic

Chart implementation (Recharts preferred)

Performance optimization

Role-based visibility

OPTIONAL FINAL MASTER PROMPT

After implementing everything:

Audit the entire system like a senior technical architect.

Evaluate:

Security

Scalability

SEO

Performance

Maintainability

DevOps readiness

Edge case handling

Provide improvements and refactors.