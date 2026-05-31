import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
    throw new Error('MongoDB URI missing')
}

type CachedMongoose = {
    conn: mongoose.Mongoose | null
    promise: Promise<mongoose.Mongoose> | null
}

declare global {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    var _mongoose: CachedMongoose | undefined
}

if (!global._mongoose) {
    global._mongoose = {
        conn: null,
        promise: null,
    }
}

const cached: CachedMongoose = global._mongoose

export async function connectDB() {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI)
    }

    cached.conn = await cached.promise

    return cached.conn
}
