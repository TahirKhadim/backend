import { user } from "../models/user.model.js";
import { Apierror } from "../utils/apierror.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt  from "jsonwebtoken";

export const verifyjwt = asynchandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new Apierror(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const User = await user.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!User) {
            
            throw new Apierror(401, "Invalid Access Token")
        }
    
        req.User = User;
        next()
    } catch (error) {
        throw new Apierror(401, error?.message || "Invalid access token")
    }
    
})
