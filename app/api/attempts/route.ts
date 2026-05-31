import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import LoginAttempt from '@/app/models/LoginAttempt';

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
}

export async function GET() {
  try {
    await connectDB();

    const attempts = await LoginAttempt.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const total = await LoginAttempt.countDocuments();
    const blocked = await LoginAttempt.countDocuments({ status: 'blocked' });

    return NextResponse.json({
      attempts,
      total,
      blocked
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}