import genToken from "../config/token.js"
import User from "../models/user.model.js"
import { OAuth2Client } from "google-auth-library"
import axios from "axios"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const googleAuth = async (req,res) => {
    try {
        const { token } = req.body
        console.log(`Backend: Received Google Auth request with token`);

        if (!token) {
            return res.status(400).json({ message: "No token provided" })
        }

        // Verify the Access Token and get user info
        // We use axios to fetch user info from Google's endpoint using the access token
        const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const { email, name, picture } = googleResponse.data;
        
        console.log(`Backend: Verified access token for ${email}`);
        
        let user = await User.findOne({email})
        if(!user){
            console.log(`Backend: Creating new user for ${email}`);
            user = await User.create({
                name, 
                email,
                avatar: picture // Optional: Store profile picture
            })
        } else {
            console.log(`Backend: Found existing user for ${email}`);
        }
        
        let authToken = await genToken(user._id)
        if (!authToken) {
            console.error("Backend: Token generation failed");
            throw new Error("Token generation failed");
        }
        
        console.log("Backend: Setting auth cookie and returning user");
        res.cookie("token" , authToken , {
            httpOnly:true,
            secure:false, // Set to true in production
            sameSite:"strict",
            maxAge:7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json(user)

    } catch (error) {
        console.error("Backend Google Auth Error:", error);
        return res.status(500).json({message:`Google auth error ${error.message}`})
    }
    
}

export const logOut = async (req,res) => {
    try {
        await res.clearCookie("token")
        return res.status(200).json({message:"LogOut Successfully"})
    } catch (error) {
         return res.status(500).json({message:`Logout error ${error}`})
    }
    
}