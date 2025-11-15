import { UserProfileModel } from '../db/models';
import type { UserProfile } from '@/src/types/models';
import type { Types } from 'mongoose';

export const profileRepository = {
    async getProfileByUserId(userId: string | Types.ObjectId): Promise<UserProfile | null> {
        const profile = await UserProfileModel.findOne({ userId });
        return profile ? profile.toObject() : null;
    },

    async upsertProfile(
        userId: string | Types.ObjectId,
        data: Partial<Omit<UserProfile, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>
    ): Promise<UserProfile> {
        const profile = await UserProfileModel.findOneAndUpdate(
            { userId },
            { ...data, userId },
            { upsert: true, new: true }
        );
        return profile.toObject();
    },

    async deleteProfile(userId: string | Types.ObjectId): Promise<boolean> {
        const result = await UserProfileModel.deleteOne({ userId });
        return result.deletedCount > 0;
    },
};
