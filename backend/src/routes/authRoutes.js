import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  console.log("SIGNUP HIT");
  console.log(req.body);
  try {

    const { fullname, email, password } = req.body;

    // validation
    if (!fullname || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if(password.length < 6){
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // existing user check
    const existingUser = await User.findOne({ email : email.trim().toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullname,
      email : email.trim().toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });

  }

});

// login
router.post("/login", async (req, res) => {
    console.log("LOGIN HIT");
    console.log(req.body);
    
    try {
      const { email, password } = req.body;

      if(!email || !password){
        return res.status(400).json({
          message: "All fields are required"
        });
      }

      const user = await User.findOne({ email : email.trim().toLowerCase() });
      if(!user){
        return res.status(400).json({
          message: "Invalid email or password"
        });
      }

      const isMatch = await bcrypt.compare(
        password,
        user.password
      );
      
      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid email or password"
        });
      }

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Server Error"
      });
    }
  });

export default router;