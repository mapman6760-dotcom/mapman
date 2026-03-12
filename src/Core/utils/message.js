// import jwt from "jsonwebtoken";
import * as Error from "../errors/ErrorConstant.js";
import axios from "axios";
import capitalize from 'lodash/capitalize.js'
import dotenv from "dotenv";
import require from "requirejs";
var CryptoJS = require("crypto-js");
const path = require("path");
import fs from "fs";

    import { transporter } from "./mailer.js";
dotenv.config();

export const messagingFunction = {
    // sendOTP: async (data) => {
    //     try {
    //         var userName = capitalize(data.userName);
    //         var phone = 91 + data.phone;
    //         const endPoint = `https://api.msg91.com/api/v5/otp?template_id=${configs.messagingId}&mobile=${phone}&authkey=${configs.messagingKey}`;
    //         return await axios.post(endPoint, { NAME: userName });
    //     } catch (error) {
    //         throw Error.SomethingWentWrong();
    //     }
    // },

    sendOTP: async (data) => {
        try {
        const payload = [
        {
          apiToken: process.env.MESSAGEBOT_API_TOKEN,
          messageType: "2", // Transactional
          messageEncoding: "1",
          destinationAddress: data.phone,
          sourceAddress: process.env.MESSAGEBOT_SENDER_ID, // Approved Sender ID
          messageText: `Your OTP is ${data.code}. Do not share this OTP.`,
          dltEntityId: process.env.DLT_ENTITY_ID,
          dltEntityTemplateId: process.env.DLT_TEMPLATE_ID
        }  ]  

          // console.log("data ", data)
          // console.log()
          // console.log()
          // console.log()
          // console.log("payload ",payload)
      const response = await axios.post(
        "http://papi.messagebot.in/SendSmsV2",
        payload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      return response.data

    } catch (error) {
      console.error(error.response?.data || error.message);
      throw Error.SomethingWentWrong();
    }
  },
    
    verifyOTP: async (data) => {
        try {
            var phone = "91" + data.phone;
            var endPoint = `https://api.msg91.com/api/v5/otp/verify?authkey=${configs.messagingKey}&mobile=${phone}&otp=${data.otp}`;
            return await axios.get(endPoint);
        } catch (error) {
            throw Error.SomethingWentWrong();
        }
  },
    
sendOTPEmail: async (data) => {
  try {
    const mailOptions = {
      from: "mapman6760@gmail.com",
      to: data.email,
      subject: "Your OTP Code",
      html: `    
<div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
    <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:8px; padding:30px; text-align:center;">

        <!-- <img src="https://www.freepik.com/free-vector/pensive-businessman-making-decision_7732656.htm#fromView=search&page=1&position=12&uuid=2992de8d-4c1e-4f31-8123-add0b65498a0&query=finding+way"
            alt="Company Logo" style="width:120px; margin-bottom:20px;" /> -->

        <h1 style="color:#333;">Mapman</h1>

        <h2 style="color:#333;">OTP Verification</h2>

        <p style="color:#555;">
            Use the following One Time Password (OTP) to verify your account.
        </p>

        <div style="font-size:32px; letter-spacing:6px; font-weight:bold;
                background:#f1f3f5; padding:15px; margin:20px 0;
                border-radius:6px; color:#2c7be5;">
            ${data.code}
        </div>

        <p>This OTP is valid for <b>5 minutes</b>.</p>

        <p>If you didn't request this code, please ignore this email.</p>

        <p>Thanks,<br><b>Mapman Team</b></p>

    </div>
</div>
`
    };
    const response=await transporter.sendMail(mailOptions);
      return response

  } catch (error) {
    console.log(error);
    return null;
  }
}
};