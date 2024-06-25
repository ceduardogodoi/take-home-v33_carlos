import { AxiosError } from "axios";

export interface User {
  _id: string;
  email: string;
  profilePicture?: string;
  totalExperience?: number;
  experiencePoints?: { points: number; timestamp: string }[];
}

export interface Community {
  _id: string;
  name: string;
  logo?: string;
  totalCommunityPoints?: number;
  totalUsers?: number;
}

export interface MutationData {
  userId: string;
  communityId: string;
}

export interface ResponseError extends AxiosError<{ message: string }> {}
