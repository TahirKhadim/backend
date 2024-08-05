import mongoose from "mongoose";
import { ApiResponse } from "../utils/apiresponse";
import { Apierror } from "../utils/apierror";
import { asynchandler } from "../utils/asynchandler";
import { Comment } from "../models/comment.model";
import {Video} from "../models/video.model.js"


const getVideoComments=asynchandler(async(req,res)=>{

})

const addComment = asynchandler(async (req, res) => {
    const {content}=req.body
    const {videoId}=req.params

    if(!content){
        throw  new Apierror(400,"content is required")
    }

    const video=await Video.findById(videoId)

    if(!Video){
        throw  new Apierror(400,"video is required")
    }
   const comment =new Comment.create({
        content,
        video: videoId,
        owner:req.User?._id

    })
    if(!comment){
        throw  new Apierror(404,"comment not found")
    }
})

const updateComment = asynchandler(async (req, res) => {
    const {content}=req.body

    if(!content){
        throw  new Apierror(400,"comment not found")
    }

    // check for the owner
    if(Comment.owner?.toString() !== req.User?._id.toString() ){
        throw  new Apierror(400,"owner not matched")
    }

   const updatedcomnt= await Comment.findByIdAndUpdate(Comment._id,{
        $set:{
            content
        }
    },{new:true})
})
if(!updatedcomnt){
    throw  new Apierror(404,"comment not updated")
}

return res.this.status(200).json(new ApiResponse(200,updatedcomnt,"updated successfully"))

const deleteComment = asynchandler(async (req, res) => {
    
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }