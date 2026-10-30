/**
 * OWASP Sanitization helper phòng chống XSS
 */
export const sanitizeInput = (str: string): string => {
  return str
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/\//g, "/");
};

export class RateLimiter {
  private static attempts: number = 0;
  private static lockUntil: number = 0;

  static checkAllowed(): boolean {
    const now = Date.now();
    if (this.lockUntil > now) return false;
    return true;
  }

  static recordFailedAttempt(): void {
    this.attempts += 1;
    if (this.attempts >= 5) {
      this.lockUntil = Date.now() + 60 * 1000; // Khóa 1 phút nếu nhập sai 5 lần liên tiếp
      this.attempts = 0;
    }
  }

  static reset(): void {
    this.attempts = 0;
    this.lockUntil = 0;
  }
}