import { prop, getModelForClass } from '@typegoose/typegoose';
import mongoose from 'mongoose';

class User {
	@prop({ required: true })
	public email?: string;

	@prop({ required: true, select: false })
	public passwordHash?: string;

	@prop()
	public profilePicture?: string;

	@prop({ required: true, select: false, default: [] })
	public experiencePoints?: {points: number, timestamp: Date}[];

  @prop()
  public communityId?: mongoose.Types.ObjectId;
}

export const UserModel = getModelForClass(User);