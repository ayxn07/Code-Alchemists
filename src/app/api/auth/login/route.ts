import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "@/src/server/services/authService";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = loginSchema.parse(body);

        const { token } = await loginUser(parsed);

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
