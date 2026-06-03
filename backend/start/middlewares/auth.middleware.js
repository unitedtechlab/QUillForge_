import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ApiError } from '../../utilities/errors.js';
import {asyncHandler} from '../../utilities/asynchandler.js';

// file for authentication middleware to protect routes and verify JWT tokens


const verifyjwt= asyncHandler(async (req,res,next)=>{
//     console.log("Cookies:", req.cookies);
// console.log("Auth Header:", req.headers.authorization);
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];  //reading cookies here and also from headers for flexibility and get accesstoken from both places
    if(!token) {
        throw new ApiError(401, "unauthenticated");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //jwt.verify will throw an error if token is invalid or expired, so we can catch that in our global error handler
    // this decoded field will return the payload we set in the token, which is user id, email and username in our case, so we can use that to find the user in the database and attach it to the request object for further use in the route handlers
    const user = await User.findById(decoded._id)
.select("-password");  
    if(!user) {
        throw new ApiError(401, "unauthenticated");
    }
    req.user = user;
    next();
 

    // updating req object with user details from the token, so that we can access it in the route handlers and also to check if the user is authenticated or not
});

export { verifyjwt };