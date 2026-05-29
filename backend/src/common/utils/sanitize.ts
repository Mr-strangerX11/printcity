import sanitizeHtml from 'sanitize-html';

/**
 * Strips all HTML tags from user-supplied text.
 * Used before persisting any field where users can enter free-form text
 * (product descriptions, review bodies, support messages, order notes).
 *
 * Allows zero tags — pure plain text only.
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return '';
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();
}

/**
 * Allows a safe subset of formatting tags (bold, italic, paragraphs, lists).
 * Use this for rich-text fields where limited formatting is expected.
 */
export function sanitizeRichText(input: string | undefined | null): string {
  if (!input) return '';
  return sanitizeHtml(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    allowedAttributes: {},
  }).trim();
}
