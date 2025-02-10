import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

// Pagination Parameters: The 'page' and 'limit' parameters are extracted from req.query.
// Skip Calculation: The 'skip' value is calculated to determine how many documents to skip based on the current page and limit.
// MongoDB Query: The find method is used to get comments for the specified video, with skip and limit applied to handle pagination. 
// The comments are also sorted by createdAt in descending order.
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    const commentList = await Comment.find({ video: videoId })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }); // Sorting by creation date in descending order

    if (!commentList) {
        throw new ApiError(500, "Error in fetching comments");
    }

    return res.status(200).json(new ApiResponse(200, commentList, "List of all comments"));
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Comment cannot be empty");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Fetch video details
    const video = await Video.findById(videoId)

    // If video does not exist, throw error
    if (!video) {
        throw new ApiError(400, "Video not found");
    }

    // Fetch user details
    const user = await User.findById(req.user._id);

    // If user does not exist, throw error
    if (!user) {
        throw new ApiError(400, "Error in fetching user");
    }

    // Destructure user
    const { _id: userId } = user;

    const comment = {
        content,
        video: video._id,
        owner: userId
    };

    const createdComment = await Comment.create(comment);
    if (!createdComment) {
        throw new ApiError(500, "Something went wrong while creating the comment");
    }

    // Respond with success message
    return res.status(201).json(new ApiResponse(201, createdComment, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id },
        {
            $set: {
                content
            }
        },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(500, "Error updating comment");
    }

    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const deleteStatus = await Comment.findOneAndDelete({ _id: commentId, owner: req.user._id });

    if (!deleteStatus) {
        throw new ApiError(404, "Comment not found or you are not authorized to delete this comment");
    }

    // Return success response
    return res.status(200).json(new ApiResponse(200, deleteStatus, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
