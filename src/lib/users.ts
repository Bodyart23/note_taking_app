import { ObjectId, type Collection } from "mongodb";

import { getDb } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";
import type { AppUser, UserRole } from "@/types/user";

interface UserDocument {
  _id?: ObjectId;
  email: string;
  name: string | null;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

let indexEnsured = false;

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const db = await getDb();
  const collection = db.collection<UserDocument>("users");

  if (!indexEnsured) {
    // Case-insensitive unique index prevents duplicate accounts differing only
    // by letter casing (e.g. User@x.com vs user@x.com).
    await collection.createIndex(
      { email: 1 },
      { unique: true, collation: { locale: "en", strength: 2 } },
    );
    indexEnsured = true;
  }

  return collection;
}

function toAppUser(doc: UserDocument): AppUser & { passwordHash: string } {
  return {
    id: doc._id!.toString(),
    email: doc.email,
    name: doc.name,
    role: doc.role,
    passwordHash: doc.passwordHash,
  };
}

export async function getUserByEmail(
  email: string,
): Promise<(AppUser & { passwordHash: string }) | null> {
  const collection = await getUsersCollection();
  const doc = await collection.findOne(
    { email },
    { collation: { locale: "en", strength: 2 } },
  );
  return doc ? toAppUser(doc) : null;
}

export async function getUserById(id: string): Promise<AppUser | null> {
  if (!ObjectId.isValid(id)) return null;

  const collection = await getUsersCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  const { passwordHash: _passwordHash, ...user } = toAppUser(doc);
  return user;
}

type CreateUserInput = {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
};

export async function createUser({
  email,
  password,
  name,
  role = "user",
}: CreateUserInput): Promise<AppUser> {
  const collection = await getUsersCollection();
  const now = new Date();
  const normalizedEmail = email.trim().toLowerCase();

  const doc: UserDocument = {
    email: normalizedEmail,
    name: name?.trim() || null,
    passwordHash: await hashPassword(password),
    role,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc);

  return {
    id: result.insertedId.toString(),
    email: doc.email,
    name: doc.name,
    role: doc.role,
  };
}
