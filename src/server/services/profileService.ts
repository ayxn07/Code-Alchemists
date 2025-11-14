import { connectToDatabase } from "@/src/server/db/mongoClient";
import { UserProfileModel } from "@/src/server/db/models";

export async function getUserProfile(userId: string) {
    await connectToDatabase();
    const profile = await UserProfileModel.findOne({ userId }).lean();
    return profile;
}

export interface UpdateProfileInput {
    headline?: string;
    about?: string;
    skills?: string[];
    targetRoles?: string[];
    locations?: string[];
    salaryExpectation?: {
        currency: string;
        min?: number;
        max?: number;
    };
    preferences?: {
        remote?: boolean;
        hybrid?: boolean;
        onsite?: boolean;
        industries?: string[];
    };
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
    await connectToDatabase();

    const profile = await UserProfileModel.findOneAndUpdate(
        { userId },
        { $set: { ...input } },
        { new: true, upsert: true }
    ).lean();

    return profile;
}
