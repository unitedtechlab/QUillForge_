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
      callbackURL:  "http://localhost:8000/api/v1/users/google/callback",
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

export default passport;