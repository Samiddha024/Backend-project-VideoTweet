import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id; // Assuming req.user contains the authenticated user's info

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Check if the subscription exists
    const subscription = await Subscription.findOne({ channel: channelId, subscriber: subscriberId });

    if (subscription) {
        // If subscription exists, remove it (unsubscribe)
        await Subscription.deleteOne({ _id: subscription._id });
        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
    } else {
        // If subscription does not exist, create it (subscribe)
        const newSubscription = new Subscription({ channel: channelId, subscriber: subscriberId });
        await newSubscription.save();
        return res.status(200).json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
    }
});



// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res, next) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        return next(new ApiError(400, "Invalid channel ID"));
    }

   // console.log(`Channel ID: ${channelId}`);

    try {
        const subscriberCountResult = await Subscription.aggregate([
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $count: "subscriberCount"
            }
        ]);

        //console.log(`Aggregation result: ${JSON.stringify(subscriberCountResult)}`);

        if (!subscriberCountResult || subscriberCountResult.length === 0) {
            return next(new ApiError(404, "Subscribers not found"));
        }

        const subscriberCount = subscriberCountResult[0].subscriberCount;

        return res.status(200).json(new ApiResponse(200, { subscriberCount }, "Subscribers fetched successfully"));
    } catch (error) {
        console.error(`Error fetching subscribers: ${error.message}`);
        return next(new ApiError(500, "An error occurred while fetching subscribers"));
    }
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscriptions = await Subscription.find({ subscriber: channelId }).populate('channel');

    if (!subscriptions || subscriptions.length === 0) {
        throw new ApiError(404, "Subscribed channels not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"));
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}