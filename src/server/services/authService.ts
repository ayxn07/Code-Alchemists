import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/src/server/db/mongoClient";
import { UserModel } from "@/src/server/db/models";
import { env, ensureRequiredEnv } from "@/src/config/env";

ensureRequiredEnv();

export interface RegisterInput {
    email: string;
    password: string;
    name: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthTokens {
    token: string;
}

export interface DecodedToken {
    userId: string;
    email: string;
    isLinkedinLinked?: boolean;
}

export async function registerUser(input: RegisterInput): Promise<AuthTokens> {
    await connectToDatabase();

    const existing = await UserModel.findOne({ email: input.email });
    if (existing) {
        throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await UserModel.create({
        email: input.email,
        passwordHash,
        name: input.name,
    });

    const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, isLinkedinLinked: user.isLinkedinLinked },
        env.jwtSecret as string,
        { expiresIn: "7d" }
    );

    return { token };
}

export async function loginUser(input: LoginInput): Promise<AuthTokens> {
    await connectToDatabase();

    const user = await UserModel.findOne({ email: input.email });
    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
        { userId: user._id.toString(), email: user.email, isLinkedinLinked: user.isLinkedinLinked },
        env.jwtSecret as string,
        { expiresIn: "7d" }
    );

    return { token };
}

export async function getUserFromToken(tokenOrRequest?: string | any) {
    let token: string | undefined;

    // Handle NextRequest-like object: try Authorization header, then httpOnly cookie
    if (tokenOrRequest && typeof tokenOrRequest === 'object') {
        if (tokenOrRequest.headers?.get) {
            const authHeader = tokenOrRequest.headers.get('authorization');
            token = authHeader?.replace('Bearer ', '');
        }
        // Fallback: read from cookie named 'auth_token' if available
        if (!token) {
            try {
                const cookieVal = tokenOrRequest.cookies?.get?.('auth_token')?.value;
                if (cookieVal) token = cookieVal as string;
            } catch {
                // ignore cookie access errors
            }
        }
    } else {
        token = tokenOrRequest;
    }

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, env.jwtSecret as string) as DecodedToken;

        await connectToDatabase();

        const user = await UserModel.findById(decoded.userId).lean();
        if (!user) return null;

        const { _id, email, name, role } = user as any;

        return {
            userId: _id.toString(),
            id: _id.toString(),
            email,
            name,
            role,
        };
    } catch {
        return null;
    }
}
