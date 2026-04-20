import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    credits:{
        type:Number,
        default:100
    },
    skills: {
        type: [String],
        default: []
    },
    experience: [{
        title: String,
        company: String,
        duration: String,
        description: String
    }],
    education: [{
        degree: String,
        school: String,
        year: String
    }],
    profileBrief: String,
    resumeUrl: String,
    resumeText: String,
    resumeName: String

}, {timestamps:true})

const User = mongoose.model("User" , userSchema)

export default User