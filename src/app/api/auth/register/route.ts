import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/src/server/services/authService";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = registerSchema.parse(body);

        const { token } = await registerUser(parsed);

        return NextResponse.json({ token }, { status: 201 });
    } catch (error: any) {
        const message = error?.message ?? "Failed to register";
        const status = message === "User already exists" ? 400 : 500;

        return NextResponse.json({ error: message }, { status });
    }
}
