import { sanitizeText, sanitizeRichText } from './sanitize';

describe('sanitizeText', () => {
  it('returns empty string for null/undefined', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText('')).toBe('');
  });

  it('strips all HTML tags', () => {
    expect(sanitizeText('<b>bold</b>')).toBe('bold');
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('alert("xss")');
    expect(sanitizeText('<img src=x onerror="steal()">')).toBe('');
  });

  it('preserves plain text', () => {
    expect(sanitizeText('Hello World')).toBe('Hello World');
    expect(sanitizeText('  trimmed  ')).toBe('trimmed');
  });

  it('strips dangerous XSS vectors', () => {
    const xss = '<svg onload=alert(1)>text</svg>';
    const result = sanitizeText(xss);
    expect(result).not.toContain('<svg');
    expect(result).not.toContain('onload');
  });

  it('strips HTML entities that could be re-rendered', () => {
    const input = '<a href="javascript:void(0)">click</a>';
    const result = sanitizeText(input);
    expect(result).not.toContain('<a');
    expect(result).not.toContain('javascript:');
  });

  it('handles nested tags', () => {
    expect(sanitizeText('<div><p><b>nested</b></p></div>')).toBe('nested');
  });
});

describe('sanitizeRichText', () => {
  it('allows safe formatting tags', () => {
    expect(sanitizeRichText('<b>bold</b>')).toContain('bold');
    expect(sanitizeRichText('<em>italic</em>')).toContain('italic');
    expect(sanitizeRichText('<ul><li>item</li></ul>')).toContain('item');
  });

  it('strips dangerous tags', () => {
    const input = '<script>alert(1)</script><b>text</b>';
    const result = sanitizeRichText(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('text');
  });

  it('strips event handler attributes', () => {
    const input = '<b onclick="steal()">text</b>';
    const result = sanitizeRichText(input);
    expect(result).not.toContain('onclick');
    expect(result).toContain('text');
  });

  it('strips href/src attributes that could execute code', () => {
    const input = '<p><a href="javascript:alert(1)">link</a></p>';
    const result = sanitizeRichText(input);
    expect(result).not.toContain('javascript:');
  });
});
