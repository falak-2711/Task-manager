const mongoose=require('mongoose');

const projectschema=new mongoose.Schema({
    name:String,
    Github: String,
    iscompleted: Boolean,
    Task_pending: String,
    description:String,
    Contributors:[{
        type:String
    }],
    Deadline: String,
    image: {
        path:String,
        filename:String
    }
});
const projects=mongoose.model('project',projectschema);

module.exports=projects;