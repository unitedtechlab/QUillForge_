import { asyncHandler } from "../../utilities/asynchandler";
import {ApiError} from "../../utilities/apierror";
import { ApiResponse } from "../../utilities/response";
import User from "../../models/user.model";

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

export { registerUser };