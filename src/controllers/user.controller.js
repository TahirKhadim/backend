import { asynchandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/apierror.js";
import { uploadOnCloudinary } from "../utils/clodniary.js";
import { ApiResponse } from "../utils/apiresponse.js";

import { user } from "../models/user.model.js";

const registeruser = asynchandler(async (req, res) => {
  //get user details

  const { username, fullname, email, password } = req.body;
  // console.log(username);

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
    .send("welcome")
    .json(new ApiResponse(200, createduser, "usercreated successfully !!"));
});

export { registeruser };
