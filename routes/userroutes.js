const express=require('express')
const router=express.Router();
const usermodel=require('../models/usermodel');
const mongoose = require('mongoose');
const {verifyToken}=require('../middlewares/auth')


router.get('/register',(req,res)=>{
    res.render('user/register',{user:req.user});
});

router.post('/register',async (req,res)=>{
    try{
    const { username, email, password } = req.body;


const existingUser = await usermodel.findOne({ $or: [{ username }, { email }] });

if (existingUser) {
 
    res.status(409).send('User with this username or email already exists');
} else {
 
    const newUser = new usermodel({ username, email, password });
    try {
        await newUser.save();
        console.log('User saved successfully');
        res.status(201).redirect('/login');
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).send('Error saving user');
    }
}
    }catch{
        res.redirect('/');
    }

});

router.get('/login',(req,res)=>
{
    res.render('user/login',{user:req.user});
});

router.post('/login',async (req,res)=>
{
    try{
    const {username,password,email}=req.body;

    if(!username && !email)
    {
        // return res.send("error pls provide username or email");
        return res.redirect('/login');
    }

    const user= await usermodel.findOne(
        {$or:[{username},{email}]}
    );
    
    if(!user || !user.ispasswordcorrect(password))
    {
        return res.redirect("/login");
    }
    console.log("password is correct");
    
    const _id=user._id;
    const refresh_token=await user.generate_refresh_token();
    const access_token=await user.generate_access_token();

    user.refreshToken=refresh_token;
    console.log(user);
    
    await user.save();
    console.log("saved sucessfully");

    const options={
        httpOnly:true,
        secure:true
    }
    // req.user=user;
    return res
           .status(200)
           .cookie("accessToken",access_token,options)
           .cookie("refreshToken",refresh_token,options)
           .redirect('/');
}catch{
    res.redirect('/');
}      



    // res.send('Login intialize');
});

router.get('/logout',verifyToken,async (req,res)=>{
    if(!req.user)
    {
        return res.send("No user");
    }
    const user_id=req.user._id;
    // user.refreshToken=undefined;
    await usermodel.findByIdAndUpdate(
        {_id:user_id},
        {$unset:
            {refreshToken:1}
        }
        );

        const options={
            httpOnly:true,
            secure:true
        }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .redirect('/');

});


module.exports=router;

