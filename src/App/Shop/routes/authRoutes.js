import { Router } from "express";
import { emailLogin,checkEmailExists, logout,sendOTP,verifyOTP,appAuthenticate,sendEmailOTP,verifyEmailOTP,updatePhoneSendOTP,updatePhoneVerifyOTP} from "../controller/authController.js";
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
authRouter.post("/checkEmailExists", checkEmailExists)
authRouter.post("/login", emailLogin)
// authRouter.get("/", verifyStudentEmail);
authRouter.post("/addFcmToken", appAuthenticate, appController.App.addDeviceId);
// authRouter.post("/changePassword", appAuthenticate, appController.App.changePassword);

//Mobile number OTP
authRouter.post("/sendOtp", sendOTP);
authRouter.post("/verifyOtp",verifyOTP);

//Update Mobile number
authRouter.post("/updateSendOtp", updatePhoneSendOTP);
authRouter.post("/updateVerifyOtp",updatePhoneVerifyOTP);

//logout
authRouter.get("/logout", logout)

// authRouter.post("/sendEmailCode", apiLimiter, Forgot);
// authRouter.post("/verifyEmailCode", apiLimiter, verifyCode);


//Send OTP to the email

authRouter.post("/sendEmailOtp",  sendEmailOTP);
authRouter.post("/verifyEmailOtp",  verifyEmailOTP);




export { authRouter };