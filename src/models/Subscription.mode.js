import mongoose,{Schema} from "mongoose";
import { user } from "./user.model";

const subscrptioSchema=new Schema({
    subscriber:{
        type:Schema.types.ObjectId,  //one who is subscribing
        ref:user
    },
    
    channel:{
        type:Schema.types.ObjectId,
        ref:user
        }
    
},
{
    timestamps:true
})

export const Subscription=mongoose.model("Subscription",subscrptioSchema)