import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/connectDb.js"
import cookieParser from "cookie-parser"
dotenv.config()
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"
import careerRouter from "./routes/career.route.js"
import taskRouter from "./routes/task.route.js"

const app = express()
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}))

app.use(express.json())
app.use(cookieParser())
app.use("/uploads", express.static("uploads"))

app.use("/api/auth" , authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview" , interviewRouter)
app.use("/api/payment" , paymentRouter)
app.use("/api/career", careerRouter)
app.use("/api/task", taskRouter)

const PORT = process.env.PORT || 6000
app.listen(PORT , ()=>{
    console.log(`Server running on port ${PORT}`)
    connectDb()
})
