import { connectToDatabase } from "@/src/server/db/mongoClient";
import { UserModel } from "@/src/server/db/models";
import { env } from "@/src/config/env";

interface LinkedinTokenResponse {
    access_token: string;
    expires_in: number;
}

interface LinkedinUserResponse {
    id: string;
}

interface LinkedinEmailResponse {
    elements: { [key: string]: any; "handle~"?: { emailAddress?: string } }[];
}

export async function exchangeCodeForLinkedinToken(code: string) {
    if (!env.linkedin.clientId || !env.linkedin.clientSecret || !env.linkedin.redirectUri) {
        throw new Error("LinkedIn OAuth is not configured correctly");
    }

    const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: env.linkedin.redirectUri,
        client_id: env.linkedin.clientId,
        client_secret: env.linkedin.clientSecret,
    });

    const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });

    if (!res.ok) {
        throw new Error("Failed to exchange LinkedIn code for access token");
    }

    const data = (await res.json()) as LinkedinTokenResponse;
    return data.access_token;
}

export async function fetchLinkedinProfile(accessToken: string) {
    const profileRes = await fetch("https://api.linkedin.com/v2/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!profileRes.ok) {
        throw new Error("Failed to fetch LinkedIn profile");
    }

    const profileData = (await profileRes.json()) as LinkedinUserResponse;

    const emailRes = await fetch(
        "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!emailRes.ok) {
        throw new Error("Failed to fetch LinkedIn email");
    }

    const emailData = (await emailRes.json()) as LinkedinEmailResponse;
    const primaryElement = emailData.elements?.[0];
    const email = primaryElement?.["handle~"]?.emailAddress;

    return {
        linkedinId: profileData.id,
        email,
    };
}

export async function linkLinkedinAccount(userId: string, linkedinId: string, profileUrl?: string) {
    await connectToDatabase();

    await UserModel.findByIdAndUpdate(
        userId,
        {
            $set: {
                linkedinId,
                linkedinProfileUrl: profileUrl,
                isLinkedinLinked: true,
            },
        },
        { new: true }
    );
}
