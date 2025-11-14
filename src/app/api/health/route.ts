import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/server/db/mongoClient";

export async function GET() {
    try {
        await connectToDatabase();
        return NextResponse.json({ status: 'ok', db: 'connected' });
    } catch (err: any) {
        return NextResponse.json({ status: 'error', message: err?.message || String(err) }, { status: 500 });
    }
}
