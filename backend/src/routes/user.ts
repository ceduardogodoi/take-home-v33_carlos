import express, { NextFunction, Request, Response } from "express";
import { UserModel } from "../models/User";
import mongoose from "mongoose";

const userRouter = express.Router();

interface UserParams {
  userId: string;
}

const checkUserMiddleware = async (
  req: Request<UserParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      res.status(404).send({
        message: "User not found.",
      });

      return;
    }

    next();
  } catch (error) {
    res.status(400).send({
      message: "Wrong input data. Please try again.",
    });
  }
};

/**
 * @route GET /user/:id
 * @param {string} id - User ID
 * @returns {User} - User object with experiencePoints field
 */
userRouter.get("/:id", async (req, res) => {
  const user = await UserModel.findById(req.params.id).select(
    "+experiencePoints"
  );
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  res.send(user);
});

/**
 * @route GET /user
 * @returns {Array} - Array of User objects
 * @note Adds the virtual field of totalExperience to the user.
 * @hint You might want to use a similar aggregate in your leaderboard code.
 */
userRouter.get("/", async (_, res) => {
  const users = await UserModel.aggregate([
    {
      $unwind: "$experiencePoints",
    },
    {
      $group: {
        _id: "$_id",
        email: { $first: "$email" },
        profilePicture: { $first: "$profilePicture" },
        totalExperience: { $sum: "$experiencePoints.points" },
      },
    },
  ]);

  res.send(users);
});

interface UserCommunityParams extends UserParams {
  communityId: string;
}

/**
 * @route POST /user/:userId/join/:communityId
 * @param {string} userId - User ID
 * @param {string} communityId - Community ID
 * @description Joins a community
 */
userRouter.post(
  "/:userId/join/:communityId",
  checkUserMiddleware,
  async (req: Request<UserCommunityParams>, res) => {
    const { userId, communityId } = req.params;
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { communityId: new mongoose.Types.ObjectId(communityId) },
      { new: true }
    ).lean();

    res.status(200).send(updatedUser);
  }
);

/**
 * @route DELETE /user/:userId/leave/:communityId
 * @param {string} userId - User ID
 * @param {string} communityId - Community ID
 * @description leaves a community
 */
userRouter.delete(
  "/:userId/leave/:communityId",
  checkUserMiddleware,
  async (req: Request<UserCommunityParams>, res) => {
    const { userId, communityId } = req.params;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $unset: { communityId: new mongoose.Types.ObjectId(communityId) } },
      { new: true }
    ).lean();

    res.status(200).send(updatedUser);
  }
);

export { userRouter };
