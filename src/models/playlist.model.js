import mongoose from "mongoose";
import { Schema } from "mongoose";

const playlistschema=new Schema({
    name:{
        type:String,
        require:true
    },
    description:{
        type:String,
        require:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    videos:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }

})

const Playlist=mongoose.model("Playlist",playlistschema)