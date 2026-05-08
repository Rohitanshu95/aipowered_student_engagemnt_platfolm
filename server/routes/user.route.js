import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { getCurrentUser, updateAvatar } from "../controllers/user.controller.js"
import uploadAvatar from "../middlewares/avatar.middleware.js"


const userRouter = express.Router()

userRouter.get("/current-user",isAuth,getCurrentUser)
userRouter.get("/me",isAuth,getCurrentUser)
userRouter.post("/update-avatar", isAuth, uploadAvatar.single("avatar"), updateAvatar)

export default userRouter