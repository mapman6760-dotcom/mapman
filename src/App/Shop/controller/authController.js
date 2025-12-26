import { ApplicationResponse } from "../../../Core/inc/response/ApplicationResponse.js";
import { ApplicationResult } from "../../../Core/result.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import dotenv from "dotenv";
dotenv.config();



export const emailLogin = async (req, res) => {
  const ipv4 = req.socket.remoteAddress?.split("f:")[1];
  const ipv = req.socket.remoteAddress;
  const browser = req.get("User-Agent");
  const deviceInfo = { ip: ipv4, ipv: ipv, userAgent: browser };
  authMiddleware.Student.emailLogin(req, deviceInfo)
    .then((data) => {
      const response = ApplicationResult.forCreated();
      var statuscode = 0;
      ApplicationResponse.success(
        response,
        null,
        (response) => (statuscode = response.status)
      );
      res.json({ status: statuscode, data: data });
    })
    .catch((error) => {
      ApplicationResponse.error(error, null, (response) => {
        res.status(response.status).json(response);
      });
    });
};

export const logout = async (req, res) => {
  authMiddleware.User.signOut(req)
    .then((data) => {
      const response = ApplicationResult.forCreated();
      var statuscode = 0;
      ApplicationResponse.success(response, null, (response) => (statuscode = response.status));
      res.json({ status: statuscode, data: data });
    })
    .catch((error) => {
      ApplicationResponse.error(error, null, (response) => {
        res.status(response.status).json(response);
      });
    });
};

export const Forgot = async (req, res) => {
  authMiddleware.User.forgotPassword(req)
    .then((data) => {
      const response = ApplicationResult.forCreated();
      var statuscode = 0;
      ApplicationResponse.success(response, null, (response) => (statuscode = response.status));
      res.json({ status: statuscode, data: data });
    })
    .catch((error) => {
      ApplicationResponse.error(error, null, (response) => {
        res.status(response.status).json(response);
      });
    });
};

export const verifyCode = async (req, res) => {
  authMiddleware.User.verifyEmailCode(req)
    .then((data) => {
      const response = ApplicationResult.forCreated();
      var statuscode = 0;
      ApplicationResponse.success(response, null, (response) => (statuscode = response.status));
      res.json({ status: statuscode, data: data });
    })
    .catch((error) => {
      ApplicationResponse.error(error, null, (response) => {
        res.status(response.status).json(response);
      });
    });
};

export const verifyStudentEmail = async (req, res) => {
  authMiddleware.Student.verifyStudentEmail(req)
    .then((data) => {
      const response = ApplicationResult.forCreated();
      var statuscode = 0;
      ApplicationResponse.success(response, null, (response) => (statuscode = response.status));
      const statusmessage = data;
      if (statusmessage == "Account Verified" || statusmessage == "Account already Verified") {
        res.render("accountverified", { message: data, name: process.env.APP_NAME });
      } else if (statusmessage == "Token Expired ! Try Again") {
        res.render("401", { message: "Link Expired ! Signup Again", name: process.env.APP_NAME });
      } else {
        res.render("contactadmin", { message: data, name: process.env.APP_NAME });
      }
      // res.json({ status: statuscode, data: data });
    })
    .catch((error) => {
      ApplicationResponse.error(error, null, (response) => {
        res.status(response.status).json(response);
      });
    });
};

export const verifyStaffEmail = async (req, res) => {
  authMiddleware.Student.verifyStaffEmail(req)
    .then((data) => {
      const response = ApplicationResult.forCreated();
      var statuscode = 0;
      ApplicationResponse.success(response, null, (response) => (statuscode = response.status));
      const statusmessage = data;
      if (statusmessage == "Account Verified" || statusmessage == "Account already Verified") {
        res.render("accountverified", { message: data, name: process.env.APP_NAME });
      } else if (statusmessage == "Token Expired ! Try Again") {
        res.render("401", { message: "Link Expired ! Signup Again", name: process.env.APP_NAME });
      } else {
        res.render("contactadmin", { message: data, name: process.env.APP_NAME });
      }
      // res.json({ status: statuscode, data: data });
    })
    .catch((error) => {
      ApplicationResponse.error(error, null, (response) => {
        res.status(response.status).json(response);
      });
    });
};

export const appAuthenticate = async (req, res, next) => {
  authMiddleware.User.verifyToken(req)
    .then((data) => {
      req.token = data;
      next();
    })
    .catch((error) => {
      ApplicationResponse.error(error, null, (response) => {
        res.status(response.status).json(response);
      });
    });
};

export const sendOTP = async (req, res) => {
  authMiddleware.User.sendOTP(req)
    .then((data) => {
      const response = ApplicationResult.forCreated();
      var statuscode = 0;
      ApplicationResponse.success(response, null, (response) => (statuscode = response.status));
      res.json({ status: statuscode, data: data });
    })
    .catch((error) => {   
      ApplicationResponse.error(error, null, (response) => {
        res.status(response.status).json(response);
      });
    });
};

export const verifyOTP = async (req, res) => {
  const ipv4 = req.socket.remoteAddress?.split("f:")[1];
  const ipv = req.socket.remoteAddress;
  const browser = req.get("User-Agent");
  const deviceInfo = { ip: ipv4, ipv: ipv, userAgent: browser };
  authMiddleware.User.verifyOTP(req, deviceInfo)
    .then((data) => {
      const response = ApplicationResult.forCreated();
      var statuscode = 0;
      ApplicationResponse.success(response, null, (response) => (statuscode = response.status));
      res.json({ status: statuscode, data: data });
    })
    .catch((error) => {
      ApplicationResponse.error(error, null, (response) => {
        res.status(response.status).json(response);
      });
    });
};
