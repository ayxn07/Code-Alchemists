import { UserModel } from '../db/models';
import type { User } from '@/src/types/models';
import type { Types } from 'mongoose';

export const userRepository = {
    async createUser(data: {
        email: string;
        passwordHash: string;
        name: string;
        linkedinId?: string;
        linkedinProfileUrl?: string;
    }): Promise<User> {
        const user = await UserModel.create(data);
        return user.toObject();
    },

    async findByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        return user ? user.toObject() : null;
    },

    async findById(id: string | Types.ObjectId): Promise<User | null> {
        const user = await UserModel.findById(id);
        return user ? user.toObject() : null;
    },

    async updateUser(
        id: string | Types.ObjectId,
        data: Partial<Omit<User, '_id' | 'createdAt' | 'updatedAt'>>
    ): Promise<User | null> {
        const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
        return user ? user.toObject() : null;
    },

    async findByLinkedinId(linkedinId: string): Promise<User | null> {
        const user = await UserModel.findOne({ linkedinId });
        return user ? user.toObject() : null;
    },
};
