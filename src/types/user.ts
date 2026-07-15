export type UserRole = "user" | "admin";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}
