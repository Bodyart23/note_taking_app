import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.email({ message: "Enter a valid email address." }).max(320),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(200, { message: "Password is too long." }),
});

export const signUpSchema = credentialsSchema.extend({
  name: z.string().trim().min(1).max(80).optional(),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
