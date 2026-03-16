import jwt from "jsonwebtoken";
import * as Error from "../errors/ErrorConstant.js";
import dotenv from "dotenv";
dotenv.config();


export const authentications = {
    generateShopJWT: async (token) => {
        try {
            return jwt.sign(token, process.env.jwtProfileSecret, {
                algorithm: "HS256",
            });
        } catch (error) {
            throw Error.SomethingWentWrong();
        }
    },
    verifyShopJWT: async (header) => {
        try {
            return jwt.verify(header, process.env.jwtProfileSecret);
        } catch (error) {
            throw Error.SomethingWentWrong();
        }
    },
    generateEmailToken: async (token) => {
        try {
            return jwt.sign(token, process.env.jwtEmailSecret, {
                algorithm: "HS256",
                expiresIn: "10m"
            });
        } catch (error) {
            throw Error.SomethingWentWrong();
        }
    },
    verifyEmailToken: async (token) => {
        try {
            return jwt.verify(token, process.env.jwtEmailSecret);
        } catch (error) {
            return null;
        }
    },

    generateAdminJWT: async (token) => {
        try {
            return jwt.sign(token, process.env.jwtAdminSecret, {
                algorithm: "HS256",
                expiresIn: "160m" //Eg: 60, "2 days", "10h", "7d","10m"
            });
        } catch (error) {
            throw Error.SomethingWentWrong("Unable to Generate Token");
        }
    },
    verifyAdminJWT: async (header) => {
        try {
            return jwt.verify(header, process.env.jwtAdminSecret);
        } catch (error) {
            return null;
        }
    },



    generateStaffJWT: async (token) => {
        try {
            return jwt.sign(token, process.env.jwtStaffSecret, {
                algorithm: "HS256",
                expiresIn: "30 days" //Eg: 60, "2 days", "10h", "7d","10m"
            });
        } catch (error) {
            throw Error.SomethingWentWrong("Unable to Generate Token");
        }
    },
    verifyStaffJWT: async (header) => {
        try {
            return jwt.verify(header, process.env.jwtStaffSecret);
        } catch (error) {
            throw Error.SomethingWentWrong("Unable to Generate Token");
        }
    },


};