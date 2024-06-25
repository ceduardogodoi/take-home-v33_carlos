import express from "express";
import { CommunityModel } from "../models/Community";

const communityRouter = express.Router();

/**
 * @route GET /community/:id
 * @param {string} id - Community ID
 * @returns {Community} - Community object
 */
communityRouter.get("/:id", async (req, res) => {
  const community = await CommunityModel.findById(req.params.id).lean();
  if (!community) {
    return res.status(404).send({ message: "Community not found" });
  }
  res.send(community);
});

/**
 * @route GET /community/
 * @returns {Array} - Array of Community objects
 */
// communityRouter.get("/", async (_, res) => {
//   const communities = await CommunityModel.find({}).lean();

//   res.send(communities);
// });
communityRouter.get("/", async (_, res) => {
  const communities = await CommunityModel.aggregate([
    {
      $lookup: {
        from: "users",
        let: { communityId: "$_id" },
        localField: "_id",
        foreignField: "communityId",
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$communityId", "$$communityId"] },
            },
          },
          {
            $unwind: "$experiencePoints",
          },
          {
            $group: {
              _id: "$_id",
              email: { $first: "$email" },
              profilePicture: { $first: "$profilePicture" },
              totalPoints: { $sum: "$experiencePoints.points" },
            },
          },
        ],
        as: "users",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        logo: 1,
        totalCommunityPoints: { $sum: "$users.totalPoints" },
        totalUsers: { $size: "$users" },
      },
    },
    {
      $sort: { totalCommunityPoints: -1 },
    },
  ]);

  res.send(communities);
});

export { communityRouter };
