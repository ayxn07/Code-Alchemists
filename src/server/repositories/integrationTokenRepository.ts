import { IntegrationTokenModel } from '../db/models';
import type { IntegrationToken } from '@/src/types/models';
import type { Types } from 'mongoose';

export const integrationTokenRepository = {
    async getToken(
        userId: string | Types.ObjectId,
        provider: string
    ): Promise<IntegrationToken | null> {
        const token = await IntegrationTokenModel.findOne({ userId, provider });
        return token ? token.toObject() : null;
    },

    async saveToken(
        userId: string | Types.ObjectId,
        provider: string,
        tokenData: {
            accessToken: string;
            refreshToken?: string;
            expiresAt?: Date;
        }
    ): Promise<IntegrationToken> {
        const token = await IntegrationTokenModel.findOneAndUpdate(
            { userId, provider },
            { ...tokenData, userId, provider },
            { upsert: true, new: true }
        );
        return token.toObject();
    },

    async deleteToken(userId: string | Types.ObjectId, provider: string): Promise<boolean> {
        const result = await IntegrationTokenModel.deleteOne({ userId, provider });
        return result.deletedCount > 0;
    },

    async getAllTokensForUser(userId: string | Types.ObjectId): Promise<IntegrationToken[]> {
        const tokens = await IntegrationTokenModel.find({ userId });
        return tokens.map((t) => t.toObject());
    },

    async isTokenExpired(token: IntegrationToken): Promise<boolean> {
        if (!token.expiresAt) return false;
        return new Date() > new Date(token.expiresAt);
    },
};
