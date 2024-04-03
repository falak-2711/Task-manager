require('dotenv').config();
const express=require('express');
const app=express();
const path=require('path');
const methodoverride=require('method-override');
const mongoose=require('mongoose');
const ejsmate=require('ejs-mate');
const { error } = require('console');
const userroutes=require('./routes/userroutes');
const projectroutes=require('./routes/projectsroutes');
const cookieParser=require('cookie-parser')
const {verifyToken}=require('./middlewares/auth');

app.use(express.urlencoded({extended:true}));
app.use(methodoverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

app.engine('ejs',ejsmate);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));

try{
    mongoose.connect('mongodb://127.0.0.1:27017/task-manager');
    console.log('DataBase Connected');
}catch{
    throw error('Database Not Connected');
}

app.use('/',userroutes);
app.use('/',projectroutes);

app.get('/',verifyToken,(req,res)=>
{
  res.render('user/home',{user:req.user});
});

let port=process.env.PORT || 3000;
app.listen(port,()=>
{
    console.log(`Listening on Port: ${port}`);
});