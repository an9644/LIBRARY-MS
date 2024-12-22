import { Router } from "express"
import bcrypt from 'bcrypt'
import { authenticate } from "../Middleware/auth.js";
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

dotenv.config();
const adminRouter=Router()
// const library=new Map();
const secretkey =process.env.Secretkey

const userSchema=new mongoose.Schema({
    firstName:String,
    email:String,
    userName:{type:String,unique:true},
    password:String,
    role:String
})
const User =mongoose.model('User details',userSchema)

 // create model for addcourse
 const bookSchema= new mongoose.Schema({
    bookName:String,
    author:String,
    bookId:{type:String,unique:true},
    genre:String,
    description:String,
    price:String
})
const Book =mongoose.model('Book',bookSchema)
mongoose.connect("mongodb://localhost:27017/LIBRARY-Management")

adminRouter.get('/',(req,res)=>{
    res.send("Hello World")
})
adminRouter.post('/signup',async(req,res)=>{
    try{
    const {Name,Email,Username,Password,Role}=req.body

        const newp=await bcrypt.hash(Password,10)

        const existinguser= await User.findOne({userName:Username})

        if(existinguser){
            res.status(400).json({message:"User Already Exist"})
        }else{
            const newuser=new User({
                firstName:Name,
                email:Email,
                userName:Username,
                password:newp,
                role:Role                
            })

            await newuser.save()
            res.status(201).json({message:"User Added Successfully"})
        }
     }catch(error){
        res.status(500).json(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }})

    adminRouter.post('/login',async(req,res)=>{
        
       try {
        const {Username,Password}=req.body
        const result=await User.findOne({userName:Username})

        if(!result){
            res.status(201).json({message:"User does not found"})
        }else{

            const valid= await bcrypt.compare(Password,result.password)
            console.log(valid)

            if(valid){
                const token=jwt.sign({Username : result.userName , Role:result.role},secretkey,{expiresIn:'1h'})
                res.cookie('libraray',token,{httpOnly:true})
                console.log({token})
                return res.status(200).json({token})
            }
        }
        
       } catch (error) {
            console.log(error)
       }

    })
  adminRouter.post('/addbook',authenticate,async(req,res)=>{
        try {
            const {title,bookid,author,genre,description,price}=req.body

            if(req.Role=='Admin'){
                console.log("Admin login success")

                const existingCourse= await Book.findOne({bookId :bookid})                        
                if(existingCourse){
                    console.log("Book Already Exist!!")
                    return res.status(400).json({message:"Book Already Exist!!"})
                 }                       
                    const newbook=new Book({
                    bookName:title,
                    bookId: bookid,
                    author:author,
                    genre:genre,
                    description:description,
                    price:parseInt(price)
                    })
                    //save course  to mongo
                    await newbook.save()
                    console.log("Book Addedd Successfully!!")
                     return res.status(201).json({message:"Book Addedd Successfully!!"})
                    // alert("Course Addedd Successfully!!")
                }else{
                console.log("You dont have permission ")
                return res.status(403).json({ message: "You don't have permission" });
                }
        } catch (error) {
            console.log(error)            
        }
    })
    adminRouter.put('/update',authenticate,async(req,res)=>{
        try {
            const {newtitle,bookid,newauthor,newgenre,newdescription,newprice}=req.body           
                
                if(req.Role !=='Admin'){
                    console.log("You dont have permission ");
                    return res.status(403).json({ message: "You don't have permission" });
                }            
                const existingbook=await Book.findOne({bookId:bookid})

                if(!existingbook){
                    return res.status(400).json({message:"Book does not exist"})
                }
                    existingbook.title=newtitle || existingbook.title
                    existingbook.author=newauthor || existingbook.author
                    existingbook.genre=newgenre || existingbook.genre
                    existingbook.description=newdescription || existingbook.description
                    existingbook.price=newprice || existingbook.price
                    
                    await existingbook.save()
                    res.status(200).json({message:"Book Updated Successfully"})
                    console.log("Book Updated Successfully")               

        } catch (error) {
            console.log(error);            
            res.status(500).json({message:"Internal server error"})
        }
    })
    adminRouter.get('/getbook',async(req,res)=>{
        try {
            const search=req.query.bookId
            console.log(search)
            const  result=await Book.findOne({bookId:search})

            if(result){
                res.status(200).send(result)
            }else{
                res.status(400).json({message:'No such Book'})
                console.log("No such Book")
            }
            
        } catch (error) {
            res.status(500).json({message:'Internal server error'})    
        }       
       })

    adminRouter.delete('/deletebook',authenticate,async(req,res)=>{
        try {
            if(req.Role=='Admin'){
            const result=req.query.bookid
            const book =await Book.deleteOne({bookId:result})

            if(result){
                console.log("Book removed")
                res.status(200).json({message:'Book removed'})            
            } else{
                console.log("no item found");            
            }
            }else{
                console.log("Unothorize");
                res.status(400).json({message:'Unothorize'})                       
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({meassage:"Internal server Error"})            

        }
   })
   
   adminRouter.post('/logout', authenticate, (req, res) => {
    try {
        if (req.Role) {
            res.clearCookie('libraray');
            res.status(200).json({ message: "Logout successfull" });
            // alert("Logout sucessfull")
        } else {
            res.status(404).json({ message: "no user found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" })
    }

});
adminRouter.get('/viewallbook', async(req,res)=>{
    try{

        const viewallbooks=await Book.find()

        if(viewallbooks){
            res.send(Array.from(viewallbooks.entries()))
        }else{
            res.status(404).json({message:'Not Found'});
     }} catch{
        res.status(404).json({message:"Internal error"})
    }
})


 adminRouter.get('/viewuser',authenticate,(req,res)=>{
        try{
        const user=req.Role;
        res.json({user});}
        catch{
            res.status(404).json({message:'user not authorized'});
        }
    })

export {adminRouter}
