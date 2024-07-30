import { asynchandler } from "../utils/asynchandler.js";
import { Apierror } from "../utils/apierror.js";
import { uploadOnCloudinary } from "../utils/clodniary.js";
import { ApiResponse } from "../utils/apiresponse.js";

import { user } from "../models/user.model.js";

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

export { registeruser, loginuser, logoutuser };
