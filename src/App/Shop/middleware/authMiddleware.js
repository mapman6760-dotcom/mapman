import require from "requirejs";
var CryptoJS = require("crypto-js");
import * as Error from "../../../Core/errors/ErrorConstant.js";
import { authentications } from "../../../Core/utils/jwt.js";
import { appDbController } from "../../../Core/database/Controller/appDbController.js";
import { NodeMailerfunction } from "../../../Core/utils/nodemailer.js";
import dotenv from "dotenv";
dotenv.config();


export class authMiddleware { }

authMiddleware.User = {

  verifyToken: async ({ headers }) => {
    // if (headers.usertoken == undefined && headers.usertoken == null) {
    //     throw Error.AuthenticationFailed("UnAuthorized");
    //   }
    // else {
      var isMalicious = true;
    if (headers.hasOwnProperty("usertoken")) {
      const findSession = await appDbController.Auth.session.findSession(headers.usertoken);
      if (findSession != null && findSession != undefined && Object.keys(findSession).length != 0&& findSession.status == "active") {
        //decrypt token
        const passwordSecret = process.env.passwordSecret;
        var plain = CryptoJS.AES.decrypt(findSession.token, passwordSecret);
        
        findSession.token = plain.toString(CryptoJS.enc.Utf8);
        const decoded = await authentications.verifyShopJWT(findSession.token);
        
        if (decoded != null && decoded != undefined && decoded.status == "active") {
          const foundUser = await appDbController.Auth.checkIdExists(decoded);
          if (foundUser != null && foundUser != undefined && Object.keys(foundUser).length != 0) {
            var token = { userId: foundUser.id, userName: foundUser.fname };
              return token.userId;
          } else {
            throw Error.AuthenticationFailed("UnAuthorized");
          }
        } else {
          throw Error.AuthenticationFailed("UnAuthorized");
        }
      } else {
        throw Error.AuthenticationFailed("UnAuthorized");
      }
    }
    if (isMalicious) {
      throw Error.AuthenticationFailed("UnAuthorized");
      }
    // }
   
  },

  emailLogin: async ({ body }, device) => {
    const userFound = await appDbController.Auth.checkemailExists(body);
    const passwordSecret = await process.env.passwordSecret;
    if (!userFound || Object.keys(userFound).length === 0) {
      //no user available shouldnt be displayed to user
      throw Error.SomethingWentWrong("Wrong Email/Password. Try Again!");
    } else if (userFound.status === "terminated") {
      throw Error.SomethingWentWrong("Account Terminated");
    } else if (userFound.status === "inactive") {
      //send mail to activate account
      await NodeMailerfunction.Email.verifyStudent(userFound);
      return "Verification Link Sent to Email";
    } else if (userFound.status === "active") {
      try {
        const plain = CryptoJS.AES.decrypt(userFound.password, passwordSecret);
        const decrypted = plain.toString(CryptoJS.enc.Utf8);
        if (decrypted === body.password) {
          const token = await authentications.generateStudentJWT({ studentId: userFound.id, status: "active", });
          if (token) {
            device.studentId = userFound.id
            const addSession = await appDbController.Auth.session.createSession(token, device);
            if (addSession != null && addSession != undefined) {
              return { token: token, name: userFound.fname };
            } else {
              throw Error.SomethingWentWrong();
            }
          } else {
            throw Error.SomethingWentWrong();
          }
        } else {
          throw Error.SomethingWentWrong("Wrong Email/Password. Try Again!");
        }
      } catch (error) {
        throw Error.SomethingWentWrong("Wrong Email/Password. Try Again!");
      }
    } else {
      throw Error.SomethingWentWrong();
    }
  },

  forgotPassword: async ({ body }) => {
    const userFound = await appDbController.Auth.checkemailExists(body);
    if (userFound == null || userFound == undefined || Object.keys(userFound).length == 0) {
      throw Error.SomethingWentWrong("User not Found");
    } else if (userFound.status === "terminated") {
      throw Error.SomethingWentWrong("You have been Terminated");
    } else {
      try {
        userFound.code = Math.floor(100000 + Math.random() * 900000);
        //+5mins = 60000*5
        var currentDate = Date.now();
        userFound.expiry = Number(currentDate) + Number(300000);

        const generateUid = await appDbController.Auth.createUid(userFound);
        if (generateUid == null || generateUid == undefined || Object.keys(generateUid).length == 0) {
          throw Error.SomethingWentWrong();
        } else {
          // function to send email code
          await NodeMailerfunction.Email.codeForForgotpassword(generateUid);
          // return generateUid;
          return "Check your Email";
        }
      } catch (error) {
        throw Error.SomethingWentWrong();
      }
    }
  },

  verifyEmailCode: async ({ body }) => {
    const fetched = await appDbController.Auth.checkemailExists(body);
    if (fetched.length != 0 && fetched != null && fetched != undefined) {
      var currentTime = Number(Date.now());
      var expiryMinutes = Number(300000);//5 mins
      var expiryTime = Number(fetched.expiry);
      var initiatedTime = expiryTime - expiryMinutes;
      var expired = currentTime - initiatedTime;
      if (expired <= expiryMinutes) {
        //expired should be lessthan or equal to 30,000
        const verifiedData = await appDbController.Auth.verifyOtp(body);
        if (verifiedData == null || verifiedData == undefined || Object.keys(verifiedData).length == 0) {
          throw Error.SomethingWentWrong("Code Not Valid");
        } else {
          // return "Code Verified";
          body.password = CryptoJS.AES.encrypt(body.password, process.env.passwordSecret).toString();
          const updatedData = await appDbController.Auth.updatePassword(body);
          if (updatedData[0] != 0) {
            return "Password Updated";
          } else {
            throw Error.SomethingWentWrong("Unable to Update Password");
          }
        }
      } else {
        throw Error.SomethingWentWrong("Code Expired");
      }

    } else {
      throw Error.SomethingWentWrong("User Not Found");
    }
  },

  signOut: async ({ headers }) => {
    if (headers.hasOwnProperty("usertoken")) {
      const signOutUser = await appDbController.Auth.session.destroySession(headers.usertoken);
      if (Boolean(signOutUser) == true) {
        return "Logout Successful";
      } else {
        throw Error.SomethingWentWrong();
      }
    } else {
      throw Error.SomethingWentWrong();
    }
  },
  
  // verifyToken: async ({ headers }) => {
  //   var isMalicious = true;
  //   if (headers.hasOwnProperty("usertoken")) {
  //     const findSession = await appDbController.Auth.session.findSession(headers.usertoken);
  //     if (findSession != null && findSession != undefined && Object.keys(findSession).length != 0) {
  //       console.log("findSession ",findSession)
  //       const decoded = await authentications.verifyShopJWT(findSession.token);
  //       if (decoded != null && decoded != undefined && decoded.status == "active") {
  //         const foundUser = await appDbController.Student.getStudent(decoded);
  //         if (foundUser != null && foundUser != undefined && Object.keys(foundUser).length != 0) {
  //           var token = { studentId: foundUser.id, studentName: foundUser.fname };
  //           return token;
  //         } else {
  //           throw Error.AuthenticationFailed("UnAuthorized");
  //         }
  //       } else {
  //         throw Error.AuthenticationFailed("UnAuthorized");
  //       }
  //     } else {
  //       throw Error.AuthenticationFailed("UnAuthorized");
  //     }
  //   }
  //   if (isMalicious) {
  //     return false;
  //   }
  // },

  sendOTP: async ({ body }) => {
    var phoneNumber = body.phoneNumber;
    body.code = phoneNumber.split("-")[0];
    body.phone = phoneNumber.split("-")[1];
    let userFound = await appDbController.Auth.forgotPasswordPhone(body); 
    console.log("userFund in sendOTP ",userFound)
    if (userFound == null || Object.keys(userFound).length === 0) {
      //Create a user with that phone number
      let userFound1 = await appDbController.Auth.addMobile(body);
           //send OTP to activate account
           body.customerId = userFound1.id;
           userFound1.phone.phoneNumber;
           userFound1.code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
          //  const msgSent = await messagingFunction.sendOTP(userFound1);
          //  console.log("msg sent ",msgSent);
      
          let msgSent = {
               message: ["SMS sent successfully.", "dfjiksfjsk"],
               request_id:"2345667789"
          }
           if (msgSent != undefined && msgSent != null && msgSent.message[0] == "SMS sent successfully.") {
             //otp log
             userFound1.type = 'success';
             userFound1.requestId = msgSent.request_id;
             userFound1.msgType = "otp";
             await appDbController.Auth.createOTPLog(userFound1);
             userFound1.otpCount = Number(userFound1.otpCount);
             userFound1.otpCount = Number(userFound1.otpCount) + 1;
             var currentDate = Date.now();
             userFound1.expiry = Number(currentDate) + Number(300000);//5 mins
             var updateUserMeta = await appDbController.Auth.createOTPExpiry(userFound1);
             if (updateUserMeta != null && updateUserMeta != undefined && updateUserMeta[0] == 1) {
              return "OTP Sent To Your Registered Mobile Number";
            }
             else {
              let otp = translation.otpFailed
               throw Error.SomethingWentWrong("Unable to Send OTP");
             }
           } else {
             throw Error.SomethingWentWrong("Too many Attempts! Try again Later");
           }
    } else if (userFound.status === "terminated") {
 let userFound1 = await appDbController.Auth.addMobile(body);
           //send OTP to activate account
           body.customerId = userFound1.id;
           userFound1.phone.phoneNumber;
           userFound1.code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
          //  const msgSent = await messagingFunction.sendOTP(userFound1);
          //  console.log("msg sent ",msgSent);
      
          let msgSent = {
               message: ["SMS sent successfully.", "dfjiksfjsk"],
               request_id:"2345667789"
          }
           if (msgSent != undefined && msgSent != null && msgSent.message[0] == "SMS sent successfully.") {
             //otp log
             userFound1.type = 'success';
             userFound1.requestId = msgSent.request_id;
             userFound1.msgType = "otp";
             await appDbController.Auth.createOTPLog(userFound1);
             userFound1.otpCount = Number(userFound1.otpCount);
             userFound1.otpCount = Number(userFound1.otpCount) + 1;
             var currentDate = Date.now();
             userFound1.expiry = Number(currentDate) + Number(300000);//5 mins
             var updateUserMeta = await appDbController.Auth.createOTPExpiry(userFound1);
             if (updateUserMeta != null && updateUserMeta != undefined && updateUserMeta[0] == 1) {
              return "OTP Sent To Your Registered Mobile Number";
            }
             else {
              let otp = translation.otpFailed
               throw Error.SomethingWentWrong("Unable to Send OTP");
             }
           } else {
             throw Error.SomethingWentWrong("Too many Attempts! Try again Later");
           }
    } else {
      //send OTP to activate account
      body.customerId = userFound.id;
      userFound.phone.phoneNumber;
      userFound.code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
      // const msgSent = await messagingFunction.sendOTP(userFound);
      // console.log()
      // console.log("msgSent ",msgSent)
      let msgSent = {
        message: ["SMS sent successfully.", "dfjiksfjsk"],
        request_id:"2345667789"
      }
      userFound.userName="User"      
      if (msgSent != undefined && msgSent != null && msgSent.message[0] == "SMS sent successfully.") {
        //otp log
        userFound.type = 'success';
        userFound.requestId = msgSent.request_id;
        userFound.msgType = "otp";
        await appDbController.Auth.createOTPLog(userFound);
        userFound.otpCount = Number(userFound.otpCount);
        userFound.otpCount = Number(userFound.otpCount) + 1;
        var currentDate = Date.now();
        userFound.expiry = Number(currentDate) + Number(300000);//5 mins
        var updateUserMeta = await appDbController.Auth.createOTPExpiry(userFound);
        if (updateUserMeta != null && updateUserMeta != undefined && updateUserMeta[0] == 1) {
          return "OTP Sent To Your Registered Mobile Number";
        }
        else {
          throw Error.SomethingWentWrong("Unable to Send OTP");
        }
      } else {
        throw Error.SomethingWentWrong("Too many Attempts! Try again Later");
      }
    }
  },

  verifyOTP: async ({ body }, device) => {
    var phoneNumber = body.phoneNumber;
    body.code = phoneNumber.split("-")[0];
    body.phone = phoneNumber.split("-")[1];
    const userFound = await appDbController.Auth.checkPhoneExists(body);
    console.log("userfound ",userFound)
    if (userFound != null && userFound != undefined && Object.keys(userFound).length != 0) {
      var currentTime = Number(Date.now());
      var expiryMinutes = Number(300000);//5 mins
      var expiryTime = Number(userFound.otpExpiry);
      var initiatedTime = expiryTime - expiryMinutes;
      var expired = currentTime - initiatedTime;
      if (expired <= expiryMinutes) {
     //expired should be lessthan or equal to 30,000
      
        //TODO:Dev Mode
        // let verifyMsg = { data: { type: "success" } }
     
        //TODO:Production Mode
        // const verifyMsg = await messagingFunction.verifyOTP(body);  
        var passwordSecret = process.env.passwordSecret;
        if (body.otp === 2345) {
        // if (body.otp === userFound.otpCode) {
          // if (verifyMsg.data.type == "success") {
          var updateUserMeta = await appDbController.Auth.updateOTPExpiry(userFound);
          if (updateUserMeta != null && updateUserMeta != undefined && updateUserMeta[0] == 1) {
            const token = await authentications.generateShopJWT({ userId: userFound.id, status: "active", });
            if (token) {
              var encryptedToken = CryptoJS.AES.encrypt(token, passwordSecret).toString();
              body.token = encryptedToken;
              body.profileId = userFound.id;
              const addSession = await appDbController.Auth.session.createSession(body, device);
              if (addSession != null && addSession != undefined) {
                let date = new Date();
                date = JSON.stringify(date);
                await appDbController.Auth.session.createLogs(userFound.id, date);
                return { token: encryptedToken,userId:userFound.id };

              } else {
                throw Error.SomethingWentWrong("Unable to Login");
              }
            } else {
              throw Error.SomethingWentWrong("Unable to Login");
            }
          }
        // }
        //   else if (verifyMsg.data.type == "error") {
        //     console.log("error")
        //     throw Error.SomethingWentWrong(verifyMsg.data.message);
        // } 
        else {
            throw Error.SomethingWentWrong("Failed to verify OTP");
        }
        } else {
          throw Error.SomethingWentWrong("Incorrect OTP");
        }      
      } else {
        throw Error.SomethingWentWrong("Code Expired");
      }
    }
    else {
      throw Error.SomethingWentWrong("Unable to Login");
    }
  },

};
