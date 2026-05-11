import User from "../models/user.model.js"

export const getCurrentUser = async (req,res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({message:"user does not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
         return res.status(500).json({message:`failed to get currentUser ${error}`})
    }
}

export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file uploaded." });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        
        const user = await User.findByIdAndUpdate(
            req.userId, 
            { avatar: avatarUrl },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({
            success: true,
            message: "Avatar updated successfully",
            user
        });
    } catch (error) {
        console.error("Avatar Update Error:", error);
        res.status(500).json({ success: false, message: "Failed to update avatar." });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, profileBrief } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId, 
            { name, profileBrief },
            { new: true }
        );
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        res.status(200).json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update profile." });
    }
};