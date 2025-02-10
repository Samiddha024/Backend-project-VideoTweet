import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'asc', userId } = req.query;
    
    // Convert page and limit to integers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Validate page and limit
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    // Validate sortType
    sortType = sortType === 'asc' ? 1 : -1;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    // Define valid sort fields
    const validSortFields = ['title', 'createdAt', 'updatedAt', '_id']; // Add fields as necessary
    if (!validSortFields.includes(sortBy)) {
        sortBy = 'createdAt'; // Default to 'createdAt' if sortBy is invalid
    }

    const videoList = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                // Optionally add a filter for `query` if needed
            }
        },
        {
            $sort: {
                [sortBy]: sortType
            }
        },
        { $skip: (page - 1) * limit },
        { $limit: limit }
    ]);

    // Check if videoList is an array
    if (!Array.isArray(videoList)) {
        throw new ApiError(500, "Error in getting videos");
    }

    // Return response
    return res.status(200).json(new ApiResponse(200, videoList, "All your videos"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const {title,description} = req.body;
    
    console.log(description);
    console.log(title);

    // Check if title and description are provided
    if (!title || !description) {
        throw new ApiError(400, "Title and Description are mandatory");
    }

    
    let videoLocalPath = null
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoLocalPath = req.files.videoFile[0].path;
    }
    console.log("Video Path:", videoLocalPath);
    let thumbnailLocalPath = null;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }

    console.log("Thumbnail Path:", thumbnailLocalPath);
    
    // Check if video and thumbnail paths are provided
    if (!videoLocalPath) {
        throw new ApiError(400, "Error in video path");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Error in thumbnail path");
    }

    // Upload video to Cloudinary
    const uploadVideo = await uploadOnCloudinary(videoLocalPath);
    if (!uploadVideo || !uploadVideo.url) {
        throw new ApiError(500, "Error in uploading video to Cloudinary");
    }

    // Upload thumbnail to Cloudinary
    const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!uploadThumbnail || !uploadThumbnail.url) {
        throw new ApiError(500, "Error in uploading thumbnail to Cloudinary");
    }

    // Fetch user details
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1
            }
        }
    ]);

    // Check if user exists
    if (!user || user.length === 0) {
        throw new ApiError(500, "Error in fetching user details");
    }

    const { _id: userId } = user[0];

    // Create video object
    const video = {
        videoFile: uploadVideo.url,
        thumbnail: uploadThumbnail.url,
        title,
        description,
        duration: uploadVideo.duration,
        owner: userId
    };

    // Save video to database
    const publishedVideo = await Video.create(video);

    // Check if video was successfully created
    if (!publishedVideo) {
        throw new ApiError(500, "Error in creating video");
    }

    // Return success response
    return res.status(200).json(
        new ApiResponse(200, publishedVideo, "Video uploaded successfully")
    );
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Get video by id
    const video = await Video.findById(videoId);

    // Check if video is found
    if (!video) {
        throw new ApiError(404, "Video not found in database");
    }

    // Return success response
    return res.status(200).json(
        new ApiResponse(200, video, "Video found in database")
    );
});


// Important Method Remember alwaysss
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    // Get the local path for the new thumbnail, if provided
    const thumbnailLocalPath = req.file?.path;
    console.log(thumbnailLocalPath);
    // Check if at least one field to update is provided
    if (!title && !description && !thumbnailLocalPath) {
        throw new ApiError(400, "At least one field (title, description, thumbnail) is required to update");
    }

    let updateFields = {};

    // Upload new thumbnail if provided
    if (thumbnailLocalPath) {
        const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!uploadThumbnail || !uploadThumbnail.url) {
            throw new ApiError(500, "Error in uploading thumbnail to Cloudinary");
        }
        updateFields.thumbnail = uploadThumbnail.url;
    }

    // Add title and description to update fields if provided
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;

    // Find the video by ID and update
    const updatedVideo = await Video.findOneAndUpdate(
        { _id: videoId, owner: req.user._id },
        { $set: updateFields },
        { new: true }
    );

    // Check if video was found and updated
    if (!updatedVideo) {
        throw new ApiError(404, "Video not found or you are not authorized to update this video");
    }

    // Return success response
    return res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});



const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Find and delete the video that belongs to the logged-in user
    const delVideo = await Video.findOneAndDelete({ _id: videoId, owner: req.user._id });

    // Check if the video was found and deleted
    if (!delVideo) {
        throw new ApiError(404, "Video not found or you are not authorized to delete this video");
    }

    // Return success response
    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Find the video and ensure it belongs to the logged-in user
    const video = await Video.findOne({ _id: videoId, owner: req.user._id });

    if (!video) {
        throw new ApiError(404, "Video not found or you are not authorized to update this video");
    }

    // Toggle the publish status
    video.isPublished = !video.isPublished;

    // Save the updated video
    await video.save();

    // Return the updated video
    return res.status(200).json(new ApiResponse(200, video, "Publish status updated successfully"));
});




export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}