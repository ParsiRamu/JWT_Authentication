import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import pool from "./db.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("This was the message from the server");
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
    res.status(200).json({ userAuthenticated: true });
  } else {
    res.status(401).json({ userAuthenticated: false });
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

app.listen(3000, () => {
  console.log("Server Sucessfully running on port 3000!");
});
