import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Check if the channelId is a valid ObjectId
    // if (!isValidObjectId(channelId)) {
    //     throw new ApiError(400, "Invalid channel ID");
    // }

    // Total liked videos by this channel
    const totalLikes = await Like.countDocuments({ likedBy: channelId });

    // Total videos published by this channel
    const totalVideos = await Video.countDocuments({ owner: channelId });

    // Total subscribers to this channel
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    // Total views for all videos published by this channel
    const totalViewsAggregation = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ]);
    const totalViews = totalViewsAggregation.length > 0 ? totalViewsAggregation[0].totalViews : 0;

    // Construct the response
    const stats = {
        totalLikes,
        totalVideos,
        totalSubscribers,
        totalViews
    };

    return res.status(200).json(new ApiResponse(200, stats, "Channel statistics retrieved successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Check if the channelId is a valid ObjectId
    // if (!isValidObjectId(channelId)) {
    //     throw new ApiError(400, "Invalid channel ID");
    // }

    // Retrieve all videos uploaded by the channel
    const videos = await Video.find({ owner: channelId })
        .sort({ createdAt: -1 }); // Optional: Sort by creation date

    if (!videos.length) {
        throw new ApiError(404, "No videos found for this channel");
    }

    // Construct the response
    return res.status(200).json(new ApiResponse(200, { videos }, "Videos retrieved successfully"));
});

export {
    getChannelStats, 
    getChannelVideos
    } 