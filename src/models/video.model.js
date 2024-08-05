import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema= new Schema({

videofile:{
    type:String,
    required:true
},
thumbnail:{
    type:String,
    required:true
},
owner:{
    type:Schema.Types.ObjectId,
    ref:"user"
},
title:{
    type:String,
    required:true
},
description:{
    type:String,
    required:true
},
duration:{
    type:Number,
    
},
views:{
    type:Number,
    default:0
},
isPublished:{
    type:Boolean,
    required:true
}


})

VideoSchema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model('Video',VideoSchema);