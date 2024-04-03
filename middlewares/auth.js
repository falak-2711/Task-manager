const jwt=require('jsonwebtoken');
const usermodel=require('../models/usermodel');

const verifyToken=async function(req,res,next){
    try{
    const token= req.cookies?.refreshToken;
    if(!token)
    {
        console.log("token not recieved")
        return next();
    }
    const decodeToken=jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);

    if(!decodeToken)
    {
        console.log('Not a decoded token');
        // return res.send("error");
        return next();
    }

    const user=await usermodel.findOne({_id:decodeToken._id});
    req.user=user;
   return next();
    
   }catch(err){
    console.log(err);
    // res.send("error auth");
    return next();

   }

};

module.exports={verifyToken};