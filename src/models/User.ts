export interface IUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'MANAGER';
  avatarUrl?: string;
  department?: string;
  branch?: string;
}

export class UserBuilder {
  private user: Partial<IUser> = {};

  setId(id: string): this {
    this.user.id = id;
    return this;
  }

  setUsername(username: string): this {
    this.user.username = username;
    return this;
  }

  setFullName(fullName: string): this {
    this.user.fullName = fullName;
    return this;
  }

  setEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  setRole(role: 'ADMIN' | 'USER' | 'MANAGER'): this {
    this.user.role = role;
    return this;
  }

  setAvatarUrl(avatarUrl: string): this {
    this.user.avatarUrl = avatarUrl;
    return this;
  }

  setDepartment(department: string): this {
    this.user.department = department;
    return this;
  }

  setBranch(branch: string): this {
    this.user.branch = branch;
    return this;
  }

  build(): IUser {
    if (!this.user.id || !this.user.username) {
      throw new Error("Missing required user properties (id, username)");
    }
    return this.user as IUser;
  }
}