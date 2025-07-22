import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[''"]/g, "") // Remove quotes
    .replace(/[^\w\s-]/g, "") // Remove punctuation except hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Prepares chapter content for speech by stripping out markdown syntax
 * and adding a verbal introduction.
 */
export function prepareChapterForSpeech(chapter: {
  id: string;
  title: string;
  content: string;
  order: number;
}): string {
  const { title, content } = chapter;

  let text = content;

  // Strip out HTML tags and structure, preserving text and spacing
  text = text
    // Replace horizontal rules with spacing
    .replace(/<hr\s*\/?>/gi, "\n\n")
    // Convert headings and paragraphs to breaks
    .replace(/<\/?(h[1-6]|p)[^>]*>/gi, "\n\n")
    // Line breaks
    .replace(/<br\s*\/?>/gi, "\n")
    // Lists to bullet lines
    .replace(/<\/?(ul|ol)[^>]*>/gi, "\n")
    .replace(/<\/?li[^>]*>/gi, "\n- ")
    // Bold/strong to plain text
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "$1")
    // Remove any other tags
    .replace(/<[^>]+>/g, "")
    // Decode common HTML entities
    .replace(/&quot;/g, '"');

  // Remove Markdown syntax
  text = text
    // Remove fenced code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove image syntax
    .replace(/!\[.*?\]\(.*?\)/g, "")
    // Convert Markdown links
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    // Remove heading markers
    .replace(/(^|\n)#+\s*(.*)/g, "$1$2")
    // Remove emphasis markers
    .replace(/(\*\*|__|\*|_)(.*?)\1/g, "$2")
    // Remove blockquote markers
    .replace(/^\s*>\s?/gm, "")
    // Remove list bullets
    .replace(/^\s*[-*+]\s+/gm, "")
    // Collapse multiple blank lines
    .replace(/\r?\n{2,}/g, "\n\n")
    .trim();

  // Prepend a natural introduction
  const intro = `Welcome to ${title}.\n\n`;
  return intro + text;
}
