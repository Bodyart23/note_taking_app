import { MongoClient, type Db } from "mongodb";
import * as dns from "node:dns";

/**
 * Lazily-initialized MongoDB client.
 *
 * The connection is created on first use (not at module load) so that a build
 * without database credentials does not crash. In development the promise is
 * cached on `globalThis` to survive HMR and avoid exhausting connections.
 */

const DEFAULT_DB_NAME = "note_taking_app";

type GlobalWithMongo = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

let clientPromise: Promise<MongoClient> | undefined;

/**
 * Preflight for `mongodb+srv://` URIs.
 *
 * On some Windows setups Node's c-ares resolver ends up with an unreachable
 * server list (e.g. a local stub or site-local IPv6 addresses) even though
 * system DNS works, so Atlas SRV lookups fail with ECONNREFUSED. Instead of
 * guessing from `dns.getServers()`, try the actual SRV lookup once and fall
 * back to public resolvers only if it fails.
 */
async function ensureSrvResolvable(uri: string): Promise<void> {
  const match = /^mongodb\+srv:\/\/(?:[^@/]*@)?([^/?]+)/.exec(uri);
  if (!match) return;

  const srvHost = `_mongodb._tcp.${match[1]}`;

  try {
    await dns.promises.resolveSrv(srvHost);
  } catch {
    console.warn(
      "[mongodb] SRV lookup failed with Node's DNS servers; retrying with public resolvers (1.1.1.1, 8.8.8.8).",
    );
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    // Let this throw if public resolvers also fail: the driver would fail
    // anyway, and this surfaces the real DNS error early.
    await dns.promises.resolveSrv(srvHost);
  }
}

async function createClient(uri: string): Promise<MongoClient> {
  await ensureSrvResolvable(uri);

  return new MongoClient(uri, {
    // Force IPv4 — avoids TLS handshake failures on Windows networks where
    // IPv6 routes to Atlas are broken or blocked.
    family: 4,
    serverSelectionTimeoutMS: 15_000,
    connectTimeoutMS: 15_000,
  }).connect();
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env.local file.",
    );
  }

  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = globalThis as GlobalWithMongo;

    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = createClient(uri).catch((error) => {
        // Do not cache failed connections, otherwise every request keeps
        // rethrowing the same startup error even after the cause is fixed.
        globalWithMongo._mongoClientPromise = undefined;
        throw error;
      });
    }

    return globalWithMongo._mongoClientPromise;
  }

  if (!clientPromise) {
    clientPromise = createClient(uri).catch((error) => {
      clientPromise = undefined;
      throw error;
    });
  }

  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || DEFAULT_DB_NAME);
}
