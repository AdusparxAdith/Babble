const express = require("express");
const router = express.Router();
const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;
    let secret = process.env.SECRET;

    if (!email || !password || !name) throw Error("Please enter all fields!");

    let userExists = await User.findOne({ email });
    if (userExists) throw Error("User already exists!");
    else {
      let created_on = new Date().toISOString();

      password = await bcrypt.hash(password, 10);

      let user = await User.findOneAndUpdate(
        {
          email,
        },
        {
          $set: {
            email,
            name,
            password,
            created_on,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      let token = jwt.sign({ id: user.id }, secret, {
        expiresIn: "24h", // expires in 24 hours
      });

      return res.status(200).send({
        message: "Welcome to the best Chat Application!",
        token,
        success: true,
        user: {
          id: user.id,
          name: user.name,
        },
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(400).send({ message: error.message, success: false });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    let secret = process.env.SECRET;

    if (!email || !password)
      return res.send({ message: "Please enter all details!", success: false });

    let user = await User.findOne({ email });

    if (user) {
      let authorized = await bcrypt.compare(password, user.password);

      if (authorized) {
        console.log(`${user.name} just logged in!`);

        let token = jwt.sign({ id: user.id }, secret, {
          expiresIn: "24h", // expires in 24 hours
        });

        return res.send({
          message: `Welcome back ${user.name}`,
          token,
          success: true,
          user: {
            id: user.id,
            name: user.name,
          },
        });
      } else {
        console.log(`Unauthorized attempt, ${email} - ${user.name}`);
        return res
          .status(400)
          .send({ message: "Please check credentials!", success: false });
      }
    } else {
      console.log("User does not exist!");
      return res
        .status(400)
        .send({ message: "User does not exist!", success: false });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .send({ message: "Internal Server Error", success: false });
  }
});

module.exports = router;
