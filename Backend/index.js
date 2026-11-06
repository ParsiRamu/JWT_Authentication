import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import pool from "./db.js";
import { generateOTP, currentOTPs, sendEmail, generateJWT,JWTmiddleware } from "./utils.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("This was the message from the server");
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log(email);
  const user = await pool.query(`select * from users where email = '${email}'`);
  console.log(user[0]);
  if (user[0].length == 0) {
    res.status(404).json({ message: "User Not Found" });
  } else {
    let generatedOTP = generateOTP();
    currentOTPs[email] = generatedOTP;
    sendEmail(email, generatedOTP)
      .then((data) => {
        console.log(data);
        res.status(200).json({ message: "OTP Sent " });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error At Server" });
      })
      .finally(() => {
        console.log(currentOTPs);
      });
  }
});

app.post("/user-login", async (req, res) => {
  console.log("Line17: ", req.body);

  const email = req.body.email;
  const password = req.body.password;
  const user = await pool.query(`select * from users where email = '${email}'`);
  const passwordHash = user[0][0].password;
  const isPassword = await bcrypt.compare(password, passwordHash);
  console.log("IsPassword:", isPassword);
  if (isPassword) {
    const acessToken = generateJWT({
      email: user[0][0].email,
      name: user[0][0].name,
    });
    res.status(200).json({ userAuthenticated: true, acessToken: acessToken });
  } else {
    res.status(401).json({ userAuthenticated: false });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, OTP } = req.body;
    if (Object.keys(currentOTPs).includes(email)) {
      if (currentOTPs[email] == OTP) {
        res.status(200).json({ message: "OTP Verified Sucessfully" });
      } else {
        res.status(401).json({ message: "OTP is not Valid" });
      }
    } else {
      res.status(404).json({ message: "OTP does not Exist for this Email" });
    }
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/update-newPassword", async (req, res) => {
  try {
    const { email, Newpassword } = req.body;
    const passwordHash = await bcrypt.hash(Newpassword, 10);
    const DBquery = await pool.query(
      `update users set password = '${passwordHash}' where email = '${email}'`,
    );
    res.status(200).json({ message: "Password Updated Sucessfully" });
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "ERROR:While update the Password" });
  }
});

app.post("/register-new-user", async (req, res) => {
  console.log("Line17: ", req.body);
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const passwordHash = await bcrypt.hash(password, 12);
  const newUser = await pool.query(
    `insert into users(name,email,password) value('${name}','${email}','${passwordHash}')`,
  );
  console.log(passwordHash);

  res.status(200).json({ message: "New user Registered Sucessfully!" });
});


app.get("/my-profile-data",JWTmiddleware,(req,res)=>{
  res.status(200).json({message:"only You should Acess this Page"})
})

app.listen(3000, () => {
  console.log("Server Sucessfully running on port 3000!");
});
