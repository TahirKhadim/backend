import mongoose, {isValidObjectId} from "mongoose"
import { Video } from "../models/video.model.js"
import { user } from "../models/user.model.js"
import { Apierror } from "../utils/apierror.js"
import { ApiResponse } from "../utils/apiresponse.js"
import { asynchandler } from "../utils/asynchandler.js"
import { uploadOnCloudinary } from "../utils/clodniary.js"


const getAllVideos = asynchandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asynchandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!(title || description )){
        throw new Apierror(404,"user name or description required")
    }

    //add video and uploade on cloudnary
    
    const videolocalpath = req.files?.videofile[0]?.path;

    const thumbnaillocalpath = req.files?.thumbnail[0]?.path;

   
    if (!(videolocalpath || thumbnaillocalpath)) {
      throw new Apierror(400, "video or thumnail required ");
    }
  
    const videofile = await uploadOnCloudinary(videolocalpath);
    const thumbnail = await uploadOnCloudinary(thumbnaillocalpath)

    if(!(videofile|| thumbnail)){
        throw new Apierror(404,"video path and thumbnail path not esist")
    }

   const video= await Video.create({
        title,
        description,
        videofile,
        thumbnail
    })
const createdvideo=await video.findbyid(video._id)

if(!createdvideo){
    throw new Apierror(404,"something went wrong")
}
return res.status(200).json(new ApiResponse(200,createdvideo,"video added successfully"))
})

const getVideoById = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    // Check if videoId is a valid ObjectId
    if (!isValidObjectId(videoId)) {
        throw new Apierror(400, "Invalid video ID");
    }

    // Perform aggregation to get video details with user details
    const video = await Video.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "users", // Collection to join with
                localField: "owner", // Field from the current collection
                foreignField: "_id", // Field from the other collection
                as: "ownerDetails" // Field name for the joined data
            }
        },
        
        {
            $project: {
                title: 1,
                description: 1,
                videofile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                "ownerDetails.username": 1,
                "ownerDetails.email": 1
            }
        }
    ]);

    if (!video || video.length === 0) {
        throw new Apierror(404, "Video not found");
    }

    return res.status(200).json(new ApiResponse(200, video[0], "Video fetched successfully"));
});


const updateVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const{title,description,thumbnail}=req.body

    if(!(title||description||thumbnail)){
        throw new Apierror(404,"title or description or thumbnail required")
    }
    const thumbnaillocalpath=req.file?.path
    if(!thumbnaillocalpath){
        throw new Apierror(404,"path not found" )
      }
      // upload on cloudnary
    
      const thumbnailurl=await uploadOnCloudinary(thumbnaillocalpath)
    if(!thumbnail){
      throw new Apierror(400,"updated avatar not found ")
    }

    const updatedvideo=await Video.findByIdAndUpdate(videoId,{
        $set:{
            title,
            description,
            thumbnail:thumbnailurl.url
        }
    },{new:true})

    return res.status(200).json(200,updateVideo,"details updated successfully")
})



const deleteVideo = asynchandler(async (req, res) => {
    const { videoId } = req.params;

    // Check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new Apierror(404, "Video not found");
    }

    // Delete the video
    await Video.findByIdAndDelete(videoId);

    // Respond with a success message
    res.status(200).json({
        success: true,
        message: "Video deleted successfully",
    });
});


const togglePublishStatus = asynchandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}