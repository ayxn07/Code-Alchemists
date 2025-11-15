import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/src/server/services/authService";
import { activityLogRepository } from "@/src/server/repositories/activityLogRepository";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = registerSchema.parse(body);

        const { token, userId } = await registerUser(parsed);

        // Log signup activity
        try {
            await activityLogRepository.logActivity(userId, 'signup', {
                email: parsed.email,
                name: parsed.name,
            });
        } catch (err) {
            console.error('Failed to log signup activity:', err);
        }

        const res = NextResponse.json({ token }, { status: 201 });
        res.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });
        return res;
    } catch (error: any) {
        const message = error?.message ?? "Failed to register";
        const status = message === "User already exists" ? 400 : 500;

        return NextResponse.json({ error: message }, { status });
    }
}
