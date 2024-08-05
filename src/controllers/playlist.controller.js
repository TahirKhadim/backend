import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import { Apierror } from "../utils/apierror.js"

import { asynchandler } from "../utils/asynchandler.js"
import { ApiResponse } from "../utils/apiresponse.js"


const createPlaylist = asynchandler(async (req, res) => {
    const {name, description} = req.body

    // is it empty
    if(!(name || description)){
        throw new Apierror(400,"should not empty")
    }
    const pData=await Playlist.create({
        name,
        description
    })
    if(!pData){
        throw new Apierror(400,"not inserted")
    }
    res.status(200).json(200,pData,"playlist created successfully")
})

const getUserPlaylists = asynchandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const playlist=await Playlist.agregation[
      {
        $match:{
            _id:mongoose.Types.ObjectId(userId)
        }

      },
      {
        
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerdetails"
              }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videodetails"
                  }
            },
            {
              $addFields: {
                ownerdetails:{
                $first:"$ownerdetails"  
                },
            
                ownerdetails:{
                    $first:"$videodetails"  
                    }}
              
            
          
          
      }
    ]
    if(!playlist){
        throw new Apierror(400,"no playlist found")
    }
    res.status(200).json(200,playlist,"playlist fetched successfully")
})

const getPlaylistById = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)){

    }
   const userplaylist=await Playlist.aagregate([
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "playlist_data"
      }
    },
    {
      $addFields: {
        playlist_data:{
        $first:"$playlist_data"  
        }}
      
    }
  ])
    
  if(!userplaylist){
    throw new Apierror(400, "not found")
  }
      return res.status(200)

})

const addVideoToPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asynchandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}