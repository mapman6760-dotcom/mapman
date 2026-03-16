import { Router } from "express";
import { emailLogin, logout,sendOTP,verifyOTP,appAuthenticate,sendEmailOTP,verifyEmailOTP} from "../controller/authController.js";
import require from "requirejs";
import { appController } from "../controller/appController.js";
const rateLimit = require("express-rate-limit");
const msg = {
  message: "Oops...! Limit Exceeded, Kindly Try Again after 60mins."
}
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 5,
  message: msg,
  skipFailedRequests: true,
});

const authRouter = Router();


//login
authRouter.post("/login", emailLogin)
// authRouter.get("/", verifyStudentEmail);
authRouter.post("/addFcmToken", appAuthenticate, appController.App.addDeviceId);
// authRouter.post("/changePassword", appAuthenticate, appController.App.changePassword);

//Mobile number OTP
authRouter.post("/sendOtp", sendOTP);
authRouter.post("/verifyOtp",verifyOTP);

//logout
authRouter.get("/logout", logout)

// authRouter.post("/sendEmailCode", apiLimiter, Forgot);
// authRouter.post("/verifyEmailCode", apiLimiter, verifyCode);


//Send OTP to the email

authRouter.post("/sendEmailOtp",  sendEmailOTP);
authRouter.post("/verifyEmailOtp",  verifyEmailOTP);


export { authRouter };