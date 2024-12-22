//commmon cookie handling method
import jwt from 'jsonwebtoken' //nml jwt upayogichanu token undakkiye token is in the jwt =
import dotenv from 'dotenv';
 
dotenv.config();
const secretkey=process.env.Secretkey


const authenticate=(req,res,next)=>{
   const cookies= req.headers.cookie;
    // req.cookies
    console.log(cookies)
    const cookie=cookies.split(';');
    if(!cookie){
        console.log("Cookie not found")
    }
    for(let cooki of cookie){   //2 variabe authtoken name and token they are stored in different arrays 
        const [name,token]=cooki.trim().split('=')
        if(name=='libraray'){
            //to verify the token using the inbuilt function in jwt jwt.verify(token stored veriable and secretkey)
            const verified= jwt.verify(token,secretkey)
            console.log(verified)
            // console.log(verified.UserName)
            // console.log(verified.Role)

            req.UserName=verified.UserName;
            req.Role=verified.Role
            break;
        }
        }
        next();

    }

export{authenticate}