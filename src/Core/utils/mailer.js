import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mapman6760@gmail.com",
pass : "dzpa pjib ekfr vyfe"  }
});