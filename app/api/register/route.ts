import { NextRequest, NextResponse } from 'next/server'

import bcrypt from 'bcryptjs'

import { connectDB } from '@/app/lib/mongodb'

import User from '@/app/models/User'

export async function POST(
    req: NextRequest
) {
    try {
        await connectDB()

        const body = await req.json()

        const { email, password } = body

        const existingUser =
            await User.findOne({ email })

        if (existingUser) {
            return NextResponse.json(
                {
                    error: 'User already exists',
                },
                {
                    status: 400,
                }
            )
        }

        const hashedPassword =
            await bcrypt.hash(password, 10)

        await User.create({
            email,
            password: hashedPassword,
        })

        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        return NextResponse.json(
            {
                error: 'Server error',
            },
            {
                status: 500,
            }
        )
    }
}