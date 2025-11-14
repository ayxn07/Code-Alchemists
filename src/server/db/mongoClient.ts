import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "code-alchemists";

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in environment variables");
}

let cached = (global as any).mongoose as
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (cached?.conn) {
        return cached.conn;
    }

    if (!cached?.promise) {
        if (cached && MONGODB_URI) {
            cached.promise = mongoose
                .connect(MONGODB_URI, { dbName: MONGODB_DB })
                .then((mongooseInstance) => {
                    return mongooseInstance;
                })
                .catch((err) => {
                    console.error("Failed to connect to MongoDB:", err?.message || err);
                    throw err;
                });
        }
    }

    if (cached?.promise) {
        cached.conn = await cached.promise;
        return cached.conn;
    }

    throw new Error('Failed to establish database connection');
}
