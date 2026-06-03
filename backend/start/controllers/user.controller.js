import { asyncHandler } from "../../utilities/asynchandler.js";
import {ApiError} from "../../utilities/errors.js";
import { ApiResponse } from "../../utilities/response.js";
import User from "../../start/models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    // Logic to create a new user in the database
   if (
    [username, email, password].some(
        (field) => field?.trim() === ""
    )
) {
    throw new ApiError(400, "All fields are required");
}
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if(existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    // Create user (minimal creation; adjust as needed in real app)
    const user = await User.create({ username, email, password });
    if (!user) {
    throw new ApiError(
        500,
        "Failed to create user"
    );
}
    const createdUser = await User.findById(
    user._id
).select("-password");
  

    return res.status(201).json(new ApiResponse(201, { createdUser }, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // Logic to authenticate user and generate token
    if(!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user=await User.findOne({ email });
    if(!user) {
        throw new ApiError(401, "email dont exist");
    }

    const isPasswordValid = await user.isPassworrdCorrect(password);
    if(!isPasswordValid) {
        throw new ApiError(401, "invalid password");
    }

    const accessToken = user.generateAccessToken();

    const options = {
    httpOnly: true,
    secure: false
    // remember to change it later to true when deploying to production, as it will ensure that the cookie is only sent over HTTPS and not accessible via JavaScript, which adds an extra layer of security against XSS attacks.
};

return res
.status(200)
.cookie("accessToken", accessToken, options)
.json(
    new ApiResponse(
        200,
        {
            user:{
                _id: user._id,
                email: user.email,
                username: user.username
            }
        },
        "Login successful"
    )
);
});
const getCurrentUser = asyncHandler(
    async(req,res)=>{

        return res.status(200).json(
            new ApiResponse(
                200,
                req.user,
                "Current user fetched"
            )
        );

    }
);

const logoutUser = asyncHandler(async(req,res)=>{

    const options = {
        httpOnly: true,
        secure: false
    };

    return res
        .clearCookie("accessToken", options)
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Logged out successfully"
            )
        );
});



export { registerUser, loginUser, getCurrentUser, logoutUser };