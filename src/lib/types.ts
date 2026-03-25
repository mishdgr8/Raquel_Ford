export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type HeadingStyle = 'none' | 'uppercase' | 'sentence' | 'title';

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

export interface FirestoreTimestamp {
    seconds: number;
    nanoseconds: number;
    toMillis: () => number;
    toDate: () => Date;
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
    title?: string;
    description?: string;
    fileName?: string;
    slug?: string;
    createdAt: FirestoreTimestamp | Date | string;
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
    publishedAt?: FirestoreTimestamp | Date;
    scheduledAt?: FirestoreTimestamp | Date;
    seoTitle?: string;
    seoDescription?: string;
    ogMediaId?: string;
    isEditorsPick?: boolean;
    isExploreTheMix?: boolean;
    editorPickOrder?: number;
    headingStyle?: HeadingStyle;
    tags?: string[];
    tagSlugs?: string[];
    createdAt: FirestoreTimestamp | Date;
    updatedAt: FirestoreTimestamp | Date;
}

export interface ContentBlock {
    id: string;
    type: 'text' | 'image' | 'video' | 'divider' | 'embed' | 'gallery';
    data: Record<string, any>;
}

export interface BlockInstance {
    id: string;
    templateId: string;
    blockType: string;
    configJson: Record<string, any>;
    orderIndex: number;

}

export interface PageTemplate {
    id: string;
    pageType: 'home' | 'category' | 'article';
    name: string;
    isActive: boolean;
    blocks: BlockInstance[];
    createdAt: FirestoreTimestamp | Date;
    updatedAt: FirestoreTimestamp | Date;
}

export interface NewsletterSubscriber {
    id: string;
    email: string;
    firstName?: string;
    status: 'pending' | 'active' | 'unsubscribed';
    source: string;
    createdAt: FirestoreTimestamp;
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
    updatedAt?: FirestoreTimestamp;
}
