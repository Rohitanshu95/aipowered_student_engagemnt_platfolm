import dotenv from "dotenv"
dotenv.config()
import Razorpay from "razorpay"

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
    console.warn("WARNING: Razorpay Keys are missing from environment variables!");
} else {
    console.log(`Razorpay Service: Initialized with Key ID: ${key_id.substring(0, 8)}...`);
}

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

export default razorpay