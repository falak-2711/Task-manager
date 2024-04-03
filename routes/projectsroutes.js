const express=require('express')
const router=express.Router();
const projectmodel=require('../models/projectmodel');
const {verifyToken}=require('../middlewares/auth');
const usermodel=require('../models/usermodel');
const multer=require('multer');
const {cloudinary,storage}=require('../cloudinary/index');
const upload= multer({storage});

router.use(verifyToken);
router.get('/new',(req,res)=>{
    // res.send('New Project form');
    res.render('projects/new',{user:req.user});
});

router.post('/new',upload.single('image'),async (req,res)=>{
    try{
    const project=new projectmodel(req.body.project);
    const user=req.user;
    project.image.path=req.file.path;
    project.image.filename=req.file.filename;
    await project.save();

    user.projects.push(project);
    await user.save({validateBeforeSave:false});
    res.redirect('/projects');
    }catch{
        res.redirect('/projects');
    }
});

router.get('/projects',async (req,res)=>{
    const user_id=req.user._id;

    const user= await usermodel.findOne({_id:user_id}).populate('projects');
    const projects=user.projects;
    res.render('user/projects',{user:req.user,projects:projects});
});

router.get('/:id',async (req,res)=>
{
    // res.render('user/login');
    const {id}=req.params;
    // res.send(id);
    const project =await projectmodel.findOne({_id:id});
    // res.send(project)
    // res.send("show single project");

    res.render('projects/s_project',{project,user:req.user});
});

router.delete('/:id',async (req,res)=>{

    try{
        if(!req.user)
        return res.redirect('/login');
    const user_id=req.user._id;

    const project_id=req.params.id;
    const project=await projectmodel.findById(project_id);
    await cloudinary.uploader.destroy(project.image.filename);

    await projectmodel.findByIdAndDelete(project_id);
    
    
    await usermodel.findByIdAndUpdate(user_id,{$pulll:{project:project_id}});
    return res.redirect('/projects');
    }catch{
        res.redirect('/projects');
    }
});
router.get('/edit/:id',async (req,res)=>{
    try{
        const project_id=req.params.id;
        const project=await projectmodel.findById(project_id);
        res.render('projects/edit',{project,user:req.user});
    }
    catch{

        res.redirect('/project_id');
    }
});

router.post('/edit/:id',upload.single('image'),async (req,res)=>{
    try{
       
        const project_id=req.params.id;
        await projectmodel.findByIdAndUpdate(project_id,req.body.project);

        const project=await projectmodel.findOne({_id:project_id});

    //    return  res.send("Got it");

        if(req.file)
        {
            await cloudinary.uploader.destroy(project.image.filename);
            project.image.path=req.file.path;
            project.image.filename=req.file.filename;
        }
        await project.save();
        return res.redirect(`/${project_id}`);

        
    }
    catch{
        res.redirect('/project_id');
    }
});


module.exports=router;

