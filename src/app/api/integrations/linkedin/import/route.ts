import { NextResponse } from "next/server";
import { z } from "zod";
import { exchangeCodeForLinkedinToken, fetchLinkedinProfile, linkLinkedinAccount } from "@/src/server/services/linkedinService";
import { getUserFromToken } from "@/src/server/services/authService";

const bodySchema = z.object({
    code: z.string().min(1),
});

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

        const currentUser = await getUserFromToken(token);
        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { code } = bodySchema.parse(body);

        const accessToken = await exchangeCodeForLinkedinToken(code);
        const { linkedinId } = await fetchLinkedinProfile(accessToken);

        if (!linkedinId) {
            return NextResponse.json({ error: "LinkedIn profile missing id" }, { status: 400 });
        }

        await linkLinkedinAccount(currentUser.id, linkedinId);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message ?? "Failed to link LinkedIn account" },
            { status: 400 }
        );
    }
}
