export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface Category {
    id?: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    order: number;
    isMain?: boolean;
}

export interface Tag {
    id?: string;
    name: string;
    slug: string;
}

export interface Media {
    id?: string;
    url: string;
    path: string;
    name: string;
    type: string;
    size: number;
    extension: string;
    altText?: string;
    caption?: string;
    createdAt: any; // Firestore Timestamp
}

export interface Article {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    contentHtml?: string;
    contentJson: {
        blocks: ContentBlock[];
    };
    featuredImage?: string; // Resolved URL
    coverMediaId?: string;
    categoryId: string;
    status: ArticleStatus;
    publishedAt: any;
    scheduledAt?: any;
    seoTitle?: string;
    seoDescription?: string;
    ogMediaId?: string;
    createdAt: any;
    updatedAt: any;
}

export interface ContentBlock {
    id: string;
    type: 'text' | 'image' | 'video' | 'divider';
    data: any;
}

export interface BlockInstance {
    id: string;
    templateId: string;
    blockType: string;
    configJson: any;
    orderIndex: number;
}

export interface PageTemplate {
    id: string;
    pageType: 'home' | 'category' | 'article';
    name: string;
    isActive: boolean;
    blocks: BlockInstance[];
    createdAt: any;
    updatedAt: any;
}

export interface NewsletterSubscriber {
    id: string;
    email: string;
    firstName?: string;
    status: 'pending' | 'active' | 'unsubscribed';
    source: string;
    createdAt: any;
}

export interface SiteSettings {
    id?: string;
    general: {
        siteName: string;
        tagline: string;
        logoUrl?: string;
        faviconUrl?: string;
    };
    seo: {
        defaultTitle: string;
        defaultDescription: string;
    };
    social: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
        youtube?: string;
    };
    footer: {
        content?: string;
    };
    updatedAt?: any;
}
