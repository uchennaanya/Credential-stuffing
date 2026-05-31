import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import LoginAttempt from '@/app/models/LoginAttempt';
import { sendSOCAlert } from '@/app/lib/mail';

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { username, password, ip, country } = await req.json();

    let riskScore = 25;
    const reasons: string[] = [];

    // Velocity Check (from same IP in last 5 minutes)
    const recentAttempts = await LoginAttempt.countDocuments({
      ip,
      timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (recentAttempts > 4) {
      riskScore += 35;
      reasons.push("High login velocity from same IP");
    }

    // Geolocation Anomaly
    if (!['Nigeria', 'United States'].includes(country)) {
      riskScore += 30;
      reasons.push(`Unusual login from ${country}`);
    }

    // Suspicious IP Ranges
    if (ip.startsWith('185.') || ip.startsWith('45.') || ip.startsWith('193.')) {
      riskScore += 25;
      reasons.push("High-risk IP range detected");
    }

    riskScore = Math.min(100, riskScore);

    const riskLevel = riskScore > 75 ? 'CRITICAL' :
                     riskScore > 50 ? 'HIGH' :
                     riskScore > 30 ? 'MEDIUM' : 'LOW';

    const status = riskScore > 70 ? 'blocked' : riskScore > 45 ? 'flagged' : 'success';

    // Save to MongoDB
    const newAttempt = await LoginAttempt.create({
      username,
      ip,
      country,
      userAgent: req.headers.get('user-agent') || 'Unknown',
      riskScore,
      riskLevel,
      reasons,
      status,
    });

    // Send SOC Alert if risk is high
    let emailSent = false;
    if (riskScore > 50) {
      emailSent = await sendSOCAlert(username, ip, country, riskScore, riskLevel, reasons);
    }

    return NextResponse.json({
      success: true,
      riskScore,
      riskLevel,
      status,
      reasons,
      emailSent,
      message: status === 'blocked'
        ? "Login blocked due to suspicious activity"
        : "Login processed successfully"
    });

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}