"use client";

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

export interface StyledQuoteOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        styledQuote: {
            setStyledQuote: (attrs?: {
                author?: string;
                authorTitle?: string;
                textColor?: string;
                bgColor?: string;
                borderColor?: string;
            }) => ReturnType;
            unsetStyledQuote: () => ReturnType;
        };
    }
}

export const StyledQuote = Node.create<StyledQuoteOptions>({
    name: 'styledQuote',
    group: 'block',
    content: 'block+',
    defining: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            author: {
                default: '',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-author') || '',
                renderHTML: (attributes: Record<string, any>) => ({
                    'data-author': attributes.author,
                }),
            },
            authorTitle: {
                default: '',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-author-title') || '',
                renderHTML: (attributes: Record<string, any>) => ({
                    'data-author-title': attributes.authorTitle,
                }),
            },
            textColor: {
                default: '#1a1a1a',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-text-color') || '#1a1a1a',
                renderHTML: (attributes: Record<string, any>) => ({
                    'data-text-color': attributes.textColor,
                }),
            },
            bgColor: {
                default: '#f8f9fa',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-bg-color') || '#f8f9fa',
                renderHTML: (attributes: Record<string, any>) => ({
                    'data-bg-color': attributes.bgColor,
                }),
            },
            borderColor: {
                default: '#1a1a1a',
                parseHTML: (element: HTMLElement) => element.getAttribute('data-border-color') || '#1a1a1a',
                renderHTML: (attributes: Record<string, any>) => ({
                    'data-border-color': attributes.borderColor,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'blockquote[data-type="styled-quote"]',
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const { author, authorTitle, textColor, bgColor, borderColor } = node.attrs;
        return [
            'blockquote',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-type': 'styled-quote',
                'data-author': author || '',
                'data-author-title': authorTitle || '',
                'data-text-color': textColor || '#1a1a1a',
                'data-bg-color': bgColor || '#f8f9fa',
                'data-border-color': borderColor || '#1a1a1a',
                style: `
                    font-style: italic;
                    color: ${textColor || '#1a1a1a'};
                    background-color: ${bgColor || '#f8f9fa'};
                    border-left: 4px solid ${borderColor || '#1a1a1a'};
                    padding: 1.5rem 2rem;
                    margin: 2rem 0;
                    border-radius: 0 0.5rem 0.5rem 0;
                    position: relative;
                `.replace(/\s+/g, ' ').trim(),
            }),
            ['div', { 'data-quote-content': '' }, 0],
            ...(author ? [
                ['footer', {
                    style: 'font-style: normal; margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;',
                    'data-quote-footer': ''
                },
                    ['strong', {}, `— ${author}`],
                    ...(authorTitle ? [[' ', {}], ['span', { style: 'color: #64748b;' }, authorTitle]] : [])
                ]
            ] : []),
        ];
    },

    addCommands() {
        return {
            setStyledQuote: (attrs = {}) => ({ commands }) => {
                return commands.wrapIn(this.name, attrs);
            },
            unsetStyledQuote: () => ({ commands }) => {
                return commands.lift(this.name);
            },
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-Shift-q': () => this.editor.commands.setStyledQuote(),
        };
    },
});
