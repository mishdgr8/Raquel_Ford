"use client";

import { Node, mergeAttributes } from '@tiptap/core';

export interface ImageGalleryOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        imageGallery: {
            setGallery: (options: { images: Array<{ url: string; alt?: string }> }) => ReturnType;
        };
    }
}

export const ImageGallery = Node.create<ImageGalleryOptions>({
    name: 'imageGallery',
    group: 'block',
    atom: true,
    draggable: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            images: {
                default: [],
                parseHTML: (element: HTMLElement) => {
                    try {
                        return JSON.parse(element.getAttribute('data-images') || '[]');
                    } catch {
                        return [];
                    }
                },
                renderHTML: (attributes: Record<string, any>) => ({
                    'data-images': JSON.stringify(attributes.images),
                }),
            },
            columns: {
                default: 3,
                parseHTML: (element: HTMLElement) => parseInt(element.getAttribute('data-columns') || '3', 10),
                renderHTML: (attributes: Record<string, any>) => ({
                    'data-columns': attributes.columns,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="image-gallery"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { images, columns, ...rest } = HTMLAttributes;
        const imgArray = typeof images === 'string' ? JSON.parse(images) : (images || []);

        const imageElements = imgArray.map((img: { url: string; alt?: string }) => [
            'div',
            {
                style: 'overflow: hidden; border-radius: 0.5rem; cursor: pointer; aspect-ratio: 1; position: relative;',
                'data-gallery-item': '',
            },
            ['img', {
                src: img.url,
                alt: img.alt || '',
                loading: 'lazy',
                decoding: 'async',
                style: 'width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;',
            }],
        ]);

        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, rest, {
                'data-type': 'image-gallery',
                'data-columns': columns,
                style: `
                    display: grid;
                    grid-template-columns: repeat(${columns}, 1fr);
                    gap: 0.75rem;
                    margin: 2rem 0;
                `.replace(/\s+/g, ' ').trim(),
            }),
            ...imageElements,
        ];
    },

    addCommands() {
        return {
            setGallery: (options) => ({ commands, chain }) => {
                return chain()
                    .insertContent({
                        type: this.name,
                        attrs: {
                            images: options.images,
                            columns: 3,
                        },
                    })
                    .run();
            },
        };
    },
});
