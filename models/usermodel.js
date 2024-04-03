const mongoose=require('mongoose');
const projectmodel=require('../models/projectmodel')
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

const userschema=new mongoose.Schema({
    username:{
       type: String,
       required: [true,"Username already exsists"],
       unique:true,
    },
    email:{
        type: String,
        required: [true,"Username already exsists"],
        unique:true,
     },
     password:{
        type:String,
        required:true,
     },
    projects:[{
        type:mongoose.Schema.ObjectId,
        ref: 'project'
    }],
    refreshToken: String
});

userschema.pre('save', async function(next) {
    try {
        // Check if the password has been modified
        
        if (!this.isModified('password')) 
        {    
            return next();
        }
       
        // Generate a salt and hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(this.password, saltRounds);
        
        // Replace the plain password with the hashed one
        this.password = hashedPassword; 
        return next();
    } catch (error) {
        return next();
    }
});


userschema.methods.ispasswordcorrect=  async function(password){
   return await bcrypt.compare(password,this.password);
};

// userschema.methods.ispasswordcorrect = async function(password){
//     return await bcrypt.compare(password, this.password)
// }

userschema.methods.generate_refresh_token= async function(){
    return jwt.sign(

        {_id:this._id},

        process.env.REFRESH_TOKEN_SECRET,

        {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
        );
};

userschema.methods.generate_access_token= async function(){
    return jwt.sign(

        {_id:this._id},
        process.env.ACCESS_TOKEN_SECRET,
        {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
        );
};


const users=mongoose.model('user',userschema);

module.exports=users;