/**
 * Email validation utility
 * Validates email format before attempting to send
 */

export class MailValidator {
  /**
   * Simple email validation regex (RFC 5322 simplified)
   */
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Validate email address format
   * @param email Email address to validate
   * @returns true if valid, false otherwise
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const trimmed = email.trim();
    
    // Check basic format
    if (!this.EMAIL_REGEX.test(trimmed)) {
      return false;
    }

    // Check length (RFC 5321)
    if (trimmed.length > 254) {
      return false;
    }

    const [localPart, domain] = trimmed.split('@');

    // Check local part length
    if (localPart.length > 64) {
      return false;
    }

    // Check domain has at least one dot
    if (!domain.includes('.')) {
      return false;
    }

    // Check for consecutive dots
    if (trimmed.includes('..')) {
      return false;
    }

    return true;
  }

  /**
   * Validate list of email addresses
   * @param emails Array of email addresses
   * @returns Array of validation results
   */
  static validateEmails(emails: string[]): { email: string; valid: boolean; reason?: string }[] {
    return emails.map((email) => {
      const valid = this.isValidEmail(email);
      const reason = !valid ? this.getValidationError(email) : undefined;
      return { email, valid, reason };
    });
  }

  /**
   * Get specific validation error message
   */
  private static getValidationError(email: string): string {
    if (!email) return 'Email is required';
    if (typeof email !== 'string') return 'Email must be a string';
    if (email.includes(' ')) return 'Email contains spaces';
    if (!email.includes('@')) return 'Email must contain @';
    if ((email.match(/@/g) || []).length > 1) return 'Email contains multiple @';
    if (!email.includes('.')) return 'Email domain must contain a dot';
    return 'Invalid email format';
  }
}
