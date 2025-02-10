import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Find if the like already exists
    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (!existingLike) {
        // Create a new like
        const newLike = await Like.create({ video: videoId, likedBy: userId });
        if (!newLike) {
            throw new ApiError(400, "Error in creation of Like");
        }
        return res.status(200).json(new ApiResponse(200, newLike, "You liked the video"));
    } else {
        // Remove the existing like
        const removedLike = await Like.deleteOne({ _id: existingLike._id });
        if (removedLike.deletedCount === 0) {
            throw new ApiError(400, "Error in removing the Like");
        }
        return res.status(200).json(new ApiResponse(200, {}, "You unliked the video"));
    }
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const existingComment= await Like.findOne({comment:commentId,likedBy:req.user._id})

    if(!existingComment){
        const newLike= await Like.create({comment:commentId,likedBy:req.user._id});
        if(!newLike){
            throw new ApiError(400,"Error in creation of like")
        }
        return res.status(200).json(new ApiResponse(200,newLike,"You liked the comment"))
    }
    else{
        const removeLike= await Like.deleteOne({comment:commentId,likedBy:req.user._id});
        if(!removeLike){
            throw new ApiError(500,"Error in removing the like")
        }
        return res.status(200).json(new ApiResponse(200,{},"You unliked the comment"))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const existingLike= await Like.findOne({tweet:tweetId,owner:req.user._id})

    if(!existingLike){
        const newLike= await Like.create({tweet:tweetId,owner:req.user._id});
        if(!newLike){
            throw new ApiError(400,"Error in creation of like")
        }
        return res.status(200).json(new ApiResponse(200,{},"You liked the tweet"))
    }
    else{
        const removeLike= await Like.deleteOne({tweet:tweetId,owner:req.user._id});
        if(!removeLike){
            throw new ApiError(500,"Error in removing the like")
        }
        return res.status(200).json(new ApiResponse(200,{},"You unliked the Tweet"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedList = await Like.find({likedBy:req.user._id ,video:{$exists:true}}).populate('video');

    if(!likedList){
        throw new ApiError(500,"Error in fetching Liked Videos")
    }
    return res.status(200).json(new ApiResponse(200,likedList,"List of your liked videos"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}