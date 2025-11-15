import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "@/src/server/services/authService";
import { activityLogRepository } from "@/src/server/repositories/activityLogRepository";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = loginSchema.parse(body);

        const { token, userId } = await loginUser(parsed);

        // Log login activity
        try {
            await activityLogRepository.logActivity(userId, 'login', {
                email: parsed.email,
            });
        } catch (err) {
            console.error('Failed to log login activity:', err);
        }

        const res = NextResponse.json({ token }, { status: 200 });
        res.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });
        return res;
    } catch (error: any) {
        const message = error?.message ?? "Failed to login";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
