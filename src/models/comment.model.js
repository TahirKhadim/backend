import { Schema } from "mongoose";
import mongoose from "mongoose";



const Commentschema=new Schema({
content:{
    Type:String,
    require:true
},
video:{
    type:Schema.Types.ObjectId,
    ref:"Videos"
},

    owner:{
        type:Schema.Types.ObjectId,
        ref:"user"
    }

},{timestamps:true})

export const Comment=mongoose.model("Comment",Commentschema);

