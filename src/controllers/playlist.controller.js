import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        throw new ApiError(400, "Name and description must be provided");
    }
    const playlist = {
        name,
        description,
        owner: req.user._id
    };
    const createdPlaylist = await Playlist.create(playlist);
    if (!createdPlaylist) {
        throw new ApiError(500, "Error in creation of playlist");
    }
    return res.status(200).json(new ApiResponse(200, createdPlaylist, "Success"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const playlists = await Playlist.find({ owner: userId });
    if (!playlists.length) {
        throw new ApiError(404, "No playlists found for the user");
    }
    return res.status(200).json(new ApiResponse(200, playlists, "Success"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.findOne({ owner: req.user._id, _id: playlistId });
    if (!playlist) {
        throw new ApiError(404, "Error in fetching the playlist");
    }
    return res.status(200).json(new ApiResponse(200, playlist, "Success"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Playlist ID or Video ID is invalid");
    }
    const updatePlaylist = await Playlist.findOneAndUpdate(
        { owner: req.user._id, _id: playlistId },
        { $push: { videos: videoId } },
        { new: true }
    );
    if (!updatePlaylist) {
        throw new ApiError(404, "Error while updating playlist with video");
    }
    return res.status(200).json(new ApiResponse(200, updatePlaylist, "Success"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Playlist ID or Video ID is invalid");
    }
    const updatePlaylist = await Playlist.findOneAndUpdate(
        { owner: req.user._id, _id: playlistId },
        { $pull: { videos: videoId } },
        { new: true }
    );
    if (!updatePlaylist) {
        throw new ApiError(404, "Error while updating playlist with video");
    }
    return res.status(200).json(new ApiResponse(200, updatePlaylist, "Success"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    const deletedItem = await Playlist.findOneAndDelete({ owner: req.user._id, _id: playlistId });
    if (!deletedItem) {
        throw new ApiError(404, "Error in delete operation");
    }
    return res.status(200).json(new ApiResponse(200, deletedItem, "Successfully deleted"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    if (!name && !description) {
        throw new ApiError(400, "Either name or description is required");
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist ID is invalid");
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    const updatePlaylist = await Playlist.findOneAndUpdate(
        { owner: req.user._id, _id: playlistId },
        { $set: updateData },
        { new: true }
    );
    if (!updatePlaylist) {
        throw new ApiError(404, "Error while updating playlist");
    }
    return res.status(200).json(new ApiResponse(200, updatePlaylist, "Success"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};
