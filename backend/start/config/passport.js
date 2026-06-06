import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

import dotenv from "dotenv";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  "https://api.quillforge.unitedtechlab.com/api/v1/users/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
          try {

        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if(!user){

            user = await User.create({
                email,
                username: profile.displayName
                    .replace(/\s+/g, "")
                    .toLowerCase()
            });

        }

        return done(null, user);

    } catch(error){

        return done(error, null);

    }

}
    
  )
);
// what above code does is it sets up the Google OAuth strategy for Passport, which allows users to authenticate using their Google account.
//  When a user tries to log in with Google, they will be redirected to Google's authentication page. 
// After they grant permission, Google will redirect them back to our application with their profile information.
//  The callback function will then check if a user with the given email already exists in our database. If they do, it will return that user.
//  If not, it will create a new user with the email and display name from the Google profile and return that new user.

export default passport;


// npm run dev
// ↓
// server.js starts
// ↓
// app.js loads
// ↓ 
// passport.initialize() registers Passport  -------just like express, it got functionality of passport !
// ↓
// passport.js registers Google Strategy ------- tells if someone asks for google, run this code 
// ↓
// Server listens on port 8102
// ═══════════════════════════════
// User visits:
// GET /api/v1/users/google
// ↓
// passport.authenticate("google")
// ↓
// Redirect user to Google Login
// ↓
// User selects Google Account
// ↓
// Google verifies user
// ↓
// Google redirects to:
// GET /api/v1/users/google/callback
// ↓
// passport.authenticate("google")
// ↓
// Google Strategy executes
// ↓
// Google sends profile
// (id, email, name)
// ↓
// Find user in MongoDB by email
// ↓
// User exists?
// ├─ Yes → Use existing user
// └─ No  → Create new user
// ↓
// done(null, user)
// ↓
// Passport creates req.user
// ↓
// Callback route executes
// ↓
// req.user.generateAccessToken()
// ↓
// JWT created
// ↓
// res.cookie("accessToken", token)
// ↓
// Response sent
// ↓
// User logged in
// ═══════════════════════════════
