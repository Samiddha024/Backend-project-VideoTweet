import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { json } from "express"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    //1.Take content from User
    const {content}=req.body;

    //2.if content is not present give error
    if(!content){
        throw new ApiError(400,"Tweet can not empty");
    }

    // fetch user details 
    const user= await User.aggregate([{
        $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },{
        $project:{
            username:1,
            fullName:1

        }
    }])

    // if user does not exist throw error
    if(!user){
        throw new ApiError(400,"Error in fetching user");
    }
    // Destructure user
    const {_id:userId}=user[0];

    // create tweet object
    const tweet={
        content,
        owner:userId
    }

    // Create tweet
    const tweetCreate= await Tweet.create(tweet);

    // Find tweet in db using id
    const t= await Tweet.findById(tweetCreate._id);

    // if tweet not fount through error 
    if(!t){
        throw new ApiError(500,"Error in creation of tweet");

    }
    // provide final response
    res.status(200).json(new ApiResponse(200,t,"Tweet created successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // Fetch tweets whose owner is the user
    const tweets = await Tweet.find({ owner: req.user._id }).populate('owner', 'username fullName');

    // Check if no tweets found
    if (!tweets.length) {
        throw new ApiError(404, "No tweets found for this user");
    }

    // Return success response
    return res.status(200).json(new ApiResponse(200, tweets, "All your tweets"));
});

const updateTweet = asyncHandler(async (req, res) => {
    // Destructure tweet ID from request parameters and content from request body
    const { tweetId} = req.params
    console.log(tweetId);
    const { content } = req.body;

    // Check if content is provided
    if (!content) {
        throw new ApiError(400, "Content is required for updates");
    }

    // Find the tweet by ID and ensure it belongs to the logged-in user
    const updateTweet = await Tweet.findOneAndUpdate(
        { _id:tweetId, owner: req.user._id }, // Ensure the tweet belongs to the logged-in user
        { $set: { content } },
        { new: true, runValidators: true } // Return the updated document and run validation
    );

    // Check if the tweet was found and updated
    if (!updateTweet) {
        throw new ApiError(404, "Tweet not found or you are not authorized to edit this tweet");
    }

    // Return success response
    return res.status(200).json(new ApiResponse(200, updateTweet, "Tweet updated successfully"));
});


const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params
    console.log(tweetId)
    const deleteTweet= await Tweet.findOneAndDelete({_id:tweetId , owner:req.user._id});
    if (!deleteTweet) {
        throw new ApiError(404, "Tweet not found or you are not authorized to delete this tweet");
    }

    // Return success response
    return res.status(200).json(new ApiResponse(200, deleteTweet, "Tweet deleted successfully"));
})




export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}