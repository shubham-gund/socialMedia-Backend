import { Request,Response } from "express-serve-static-core"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export const signup = async (req:Request,res:Response)=>{
  
  try {
    const {fullName,username,email,password}=req.body;
    const emailRegex = /^[^\$@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
      return res.status(400).json({message:"Invalid email address"});
    }
    const existingUser = await User.findOne({ username });
    if(existingUser){
      return res.status(400).json({message:"Username is already taken"});
    }
    const existingEmail = await User.findOne({ email });
    if(existingEmail){
      return res.status(400).json({message:"Email is already taken"});
    }

    if(password.length<6){
      return res.status(400).json({
        error:"Password must me at least 6 characters long"
      })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt)
    const newUser = new User ({
      fullName,
      username,
      email,
      password:hashedPassword
    })

    await newUser.save();
    const userId = newUser._id.toString();
    const token = jwt.sign({userId},process.env.JWT_SECRET || "",{
      expiresIn:"15d"
    })
    res.status(200).json({
        token,
        _id:newUser._id,
        fullName:newUser.fullName,
        username:newUser.username,
        email:newUser.email,
        followers:newUser.followers,
        following:newUser.following,
        profileImg:newUser.profileImg,
        coverImg:newUser.coverImg,
        bio:newUser.bio
      });
  } catch (error:any) {
    console.log("error in signup controller",error.message);
    res.status(500).json({
      error:"Internal server error"
    })
  }

}

export const login = async (req:Request,res:Response)=>{
  
  try {

    const {username,password} = req.body;
    const user = await User.findOne({username});
    const isPasswordCorrect = await bcrypt.compare(password,user?.password || "");

    if(!user || !isPasswordCorrect){
      return res.status(401).json({
        error:"Invalid username or password"
      })
    }
      const userId = user._id.toString();
      const token = jwt.sign({userId},process.env.JWT_SECRET || "",{
        expiresIn:"15d"
      })
      res.status(200).json({
        token,
        _id:user._id,
        fullName:user.fullName,
        username:user.username,
        email:user.email,
        followers:user.followers,
        following:user.following,
        profileImg:user.profileImg,
        coverImg:user.coverImg,
        bio:user.bio
      })
  } catch (error:any) {
    console.log("error in login controller",error.message);
    res.status(500).json({
      error:"Internal server error"
    })
  }
}

export const logout = async (req:Request,res:Response)=>{
  
  try {
    res.cookie("jwt","",{
      maxAge:0
    })
    res.status(200).json({msg:"Logged out successfuly"})
  } catch (error) {
    console.log("Erroor in logout");
    res.status(500).json({error:"Internal server error"});
  }
}

export const getMe = async (req:Request,res:Response)=>{
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getME", error);
    res.status(500).json({ error: "Internal server error" });
  }
}