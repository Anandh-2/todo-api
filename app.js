const express=require('express');
const mongoose=require('mongoose');
require('dotenv').config();

const cors=require('cors');

const app=express();
app.use(express.json());

app.use(cors());

const uri=`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.iitck.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(uri,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const db=mongoose.connection;

db.on('connected',()=> console.log('Connected to MongoDB Atlas!'));
db.on('error',(err)=>console.log('Error connecting to MongoDB:',err));

const todoSchema=new mongoose.Schema({
    task:{type:String,required:true},
    completed:{type:Boolean,default:false},
});

const Todo = mongoose.model('Todo',todoSchema);

app.get('/todos',async(req,res)=>{
    try{
        const todos=await Todo.find();
        res.json(todos);
    }
    catch(error){
        res.status(500).json({error:'Failed to fetch todos'});
    }
});

app.post('/todos',async(req,res)=>{
    const {task}=req.body;
    if(!task){
        return res.status(400).json({error:'Task is required'});
    }

    try{
        const newTodo=new Todo({task});
        await newTodo.save();
        res.status(201).json(newTodo);
    }
    catch(error){
        res.status(500).json({error:'Failed to create todo'});
    }
});

app.put('/todos/:id',async (req,res)=>{
    const {id}=req.params;
    const {task,completed}=req.body;

    try{
        const updatedTodo=await Todo.findByIdAndUpdate(
            id,
            {task,completed},
            {new:true}
        );

        if(!updatedTodo){
            return res.status(404).json({error:'To-Do not found'});
        }
        res.json(updatedTodo)
    }
    catch(error){
        res.status(500).json({error:'Failed to update todo'});
    }
});  

app.delete('/todos/:id',async(req,res)=>{
    const {id}=req.params;
    try{
        const deleteTodo=await Todo.findByIdAndDelete(id);

        if(!deleteTodo){
            return res.status(404).json({error:'To-Do not found'});
        }

        res.status(204).send();
    }
    catch(error){
        res.status(500).json({error:'Failed to delete todo'});
    }
});

const PORT=process.env.PORT||3000

app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});