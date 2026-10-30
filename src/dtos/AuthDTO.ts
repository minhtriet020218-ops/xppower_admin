// --- Auth DTO & Builder ---
export interface LoginRequestDTO {
  username: string;
  passwordHash: string; // OWASP: Đã qua client-side pre-hash hoặc sanitize
  rememberMe: boolean;
}

export class LoginRequestDTOBuilder {
  private dto: Partial<LoginRequestDTO> = {};

  setUsername(username: string): this {
    this.dto.username = username.trim();
    return this;
  }

  setPassword(password: string): this {
    this.dto.passwordHash = password; // Sẽ sanitize thêm ở service
    return this;
  }

  setRememberMe(rememberMe: boolean): this {
    this.dto.rememberMe = rememberMe;
    return this;
  }

  build(): LoginRequestDTO {
    if (!this.dto.username || !this.dto.passwordHash) {
      throw new Error("Username and Password are required!");
    }
    return this.dto as LoginRequestDTO;
  }
}

