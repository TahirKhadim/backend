import { asynchandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/apierror.js";
import { uploadOnCloudinary } from "../utils/clodniary.js";
import { ApiResponse } from "../utils/apiresponse.js";

import { user } from "../models/user.model.js";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async(UserId) =>{
  try {
      const User = await user.findById(UserId)
      const accesstoken = User.generateaccesstoken()
      const refreshtoken = User.generaterefreshtoken()

      User.refreshtoken = refreshtoken
      await User.save({ validateBeforeSave: false })

      return {accesstoken, refreshtoken}


  } catch (error) {
      throw new Apierror(500, "Something went wrong while generating referesh and access token")
  }
}



const registeruser = asynchandler(async (req, res) => {
  //get user details

  const { username, fullname, email, password } = req.body;
  console.log(req.body);

  //validation not empty
  if (
    [username, email, fullname, password].some((field) => field?.trim() === "")
  ) {
    throw new Apierror(400, "all fields required");
  }

  //username or email already exist
  const existeduser = await user.findOne({
    $or: [{ username }, { email }],
  });
  if (existeduser) {
    throw new Apierror(409, "email or username already exists ");
  }
  //handling images and files

  const avatarlocalpath = req.files?.avatar[0]?.path;

  const coverimagelocalpath = req.files?.coverimage[0]?.path;
  console.log(req.files);

  if (!avatarlocalpath) {
    throw new Apierror(400, "avatar image required ");
  }

  const avatar = await uploadOnCloudinary(avatarlocalpath);
  // console.log("avatar upload result", avatar);
  const coverimage = await uploadOnCloudinary(coverimagelocalpath);

  if (!avatar) {
    throw new Apierror(400, "avatar required");
  }
  //entry in database

  const saveuser = await user.create({
    fullname,
    username: username.toLowerCase(),
    password,
    email,
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
  });
  const createduser = await user
    .findById(saveuser._id)
    .select("-password -refreshtoken");

  if (!createduser) {
    throw new Apierror(500, "something went wrong");
  }
  console.log(createduser);
  return res
    .status(201)
    .json(new ApiResponse(200, createduser, "usercreated successfully !!"));
});

const loginuser = asynchandler(async (req, res) => {
  try {
    // Get form data
    const { username, email, password } = req.body;
    console.log(email);

    // Check for null values
    if (!(username || email)) {
      throw new Apierror(404, "Email or username required");
    }

    // Find the user
    const User = await user.findOne({
      $or: [{ email }, { username }],
    });

    // Check if the user is found
    if (!User) {
      throw new Apierror(404, "User not found");
    }

    // If user is found, check the password
    const isPasswordValid = await User.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new Apierror(404, "Invalid credentials");
    }

    console.log(isPasswordValid);
    // Generate access and refresh tokens
    const tokens = await generateAccessAndRefereshTokens(User._id);
    const { accesstoken, refreshtoken } = tokens;

    const option = {
      httpOnly: true,
      secure: true,
    };

    // Send response with access token in cookie
    return res
      .status(200)
      .cookie("accesstoken", accesstoken, option)
      .json({ success: true, message: "Login successful", accesstoken, refreshtoken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

const logoutuser = asynchandler(async (req, res) => {
  await user.findByIdAndUpdate(
    req.User_id,
    {
      $unset: {
        refreshtoken: undefined,
      },
    },
    { new: true }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshtoken", option)
    .json(new ApiResponse(200, {}, "logout"));
});

const changePassword=asynchandler(async(req,res)=>{
  const {oldpassword,newpassword}=req.body
  const User=await user.findById(req.User._id)
  const isPasswordCorrect=await User.isPasswordCorrect(oldpassword)
  if(!isPasswordCorrect){
    throw new Apierror(400,"password not correct")
  }
  user.password=newpassword
  await user.save({validateBeforeSave:false})
  return res.status(200).json(new ApiResponse(200,{},"password update successfully"))
})
const getCurrentUser=asynchandler(async(req,res)=>{
  return res.status(200).json(200,req.User,"user fetched successfuly")
})

const updateUserinfo=asynchandler(async(req,res)=>{
const {fullname,email}=req.body

if(!(email || fullname)){
  throw new Apierror(400,"required all fields")
}
const User=await user.findByIdAndUpdate(req.User?._id,{
  $set:{
fullname,email
  }
},{
  new:true
}.select("-password"))

return res.status(200).json(new ApiResponse(200, User,"user details updated successfully"))
})

// file updation 

const updatecavatar=asynchandler(async(req,res)=>{
  const avatarlocalpath=req.file?.path
  if(!avatarlocalpath){
    throw new Apierror(404,"path not found" )
  }
  // upload on cloudnary

  const avatar=await uploadOnCloudinary(avatarlocalpath)
if(!avatar){
  throw new Apierror(400,"updated avatar not found ")
}
const User=await user.findByIdAndUpdate(req.User._id,{
  $set:{
    avatar:avatar.url
  }
},{new:true}.select("-password"))

return res.status(200).json(new ApiResponse(200,User,"avatarupdated successfully"))
})

const updatecoverimage=asynchandler(async(req,res)=>{
  const cimagelocalpath=req.file?.path
  if(!cimagelocalpath){
    throw new Apierror(404,"path not found" )
  }
  // upload on cloudnary

  const coverimage=await uploadOnCloudinary(cimagelocalpath)
if(!coverimage){
  throw new Apierror(400,"updated avatar not found ")
}
const User=await user.findByIdAndUpdate(req.User._id,{
  $set:{
    coverimage:coverimage.url
  }
},{new:true}.select("-password"))

return res.status(200).json(new ApiResponse(200,User,"avatarupdated successfully"))
})

const getUserchannelProfile=asynchandler(async(req,res)=>{

  const {username}=req.params

  if(!username?.trim()){
    throw new Apierror(404, "user not found")
  }
  const channel=await user.aggregate[
    {
      $match:{
        username:username.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribeto"
      }
    },
    {
      $addFields: {
        subscribers:{
        $size:"$subscribers"  
        },
        subscribeto:{
          $size:"$subscribeto"  
          },
        issubscribe:{
            $cond:{
              if:{$in: [req.user?._id,"subscribers.subscriber"]},
              then:true,
              else:false
            }
        }
      }
      
    },
    {
      $project:{
        fullname:1,
        email:1,
        avatar:1,
        coverimage:1,
        issubscribe:1,
        subscribeto:1,
        subscribers:1



      }
    }
  ]
  
  if(!channel){
throw new Apierror(404,"channel details not found")
  }
  return res.status(200).json(new ApiResponse(200,channel,"channel details detched successgully"))
})

const getuserhistory=asynchandler(async(req,res)=>{
  const history=await user.aggregate[

    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.User._id)
      }
    },
    {
      $lookup:{
         from:"videos",
         localField:"watchhistory",
         foreignField:"_id",
         as: "users"
    },
    
      $lookup:{
         from:"users",
         localField:"owner",
         foreignField:"watchhistory",
         as: "history"
    }
  }
  ]
})
export { registeruser, loginuser, logoutuser, updatecoverimage,updatecavatar,updateUserinfo,getCurrentUser,changePassword};
