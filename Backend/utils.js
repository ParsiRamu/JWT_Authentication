import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { resolve } from "nodemailer/lib/shared/url.js";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSKEY,
  },
});

export const generateOTP = () => {
  return Math.floor(10000 + Math.random() * 900000).toString();
};

export const currentOTPs = {};

export const sendEmail = (email, otp) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Email to  be sent: ", email);
      const info = await transporter.sendMail({
        from: process.env.EMAIL, // sender address
        to: email, // list of recipients
        subject: "OTP FROM Authentication Learning Nodejs", // subject line
        text: "Hello world?", // plain text body
        html: `<h3>Your OTP :${otp}</h3>
        <h5>Dear user,Please Secure Your Crediantials be Safe. And Never Share this One Time Password to Anyone,ThankYou</h5>
        `, // HTML body
      });

      resolve("Otp sent Sucessfully");
    } catch (err) {
      reject("Could not Send OTP ");
    }
  });
};

const acessSecret = process.env.JWT_SECRET;
export function generateJWT(user) {
  return jwt.sign(user, acessSecret, {
    expiresIn: "15min",
  });
}

export const JWTmiddleware = (req, res, next) => {
  let reqHeaders = req.headers["authorization"];
  if (!reqHeaders) {
    return res.status(404).json({ message: "invalid Token" });
  }
  let token = reqHeaders.split(" ")[1];
  jwt.verify(token, acessSecret, (err, user) => {
    if (err) {
      return res.status(404).json({ message: "invalid Token" });
    }
    req.user = user;
    next();
  });
};
