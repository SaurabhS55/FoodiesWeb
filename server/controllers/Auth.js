const bcrypt = require("bcrypt");
const User = require("../models/studentLoginInfo");
const jwt = require("jsonwebtoken");
const Canteen = require("../models/canteenLoginInfo");

require("dotenv").config();

exports.studentSignup = async (req , res)=>{
    try{
        const {name , email ,   collegeName , accountType ,  password} = req.body;
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success : false,
                message : "User alredy exist"
            });
        }

        let hashedPassword;

        try{
            hashedPassword = await bcrypt.hash(password,10);
        }
        catch(error){
            return res.status(500).json({
                success : false,
                message : "Error in hashing password",
            })
        }

        const user = await User.create({
            name , email , collegeName,accountType , password:hashedPassword
        });

        return res.status(200).json({
            success : true,
            message : "User created succesfully"
        });


    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success : false,
            message : "USer can not be registred"
        });
    }
}


exports.studentLogin = async (req , res)=>{
    try{
        const { email, password, logintype } = req.body;
        // console.log(req.body);
        if(!email || !password){
            return res.status(400).json({
                success : false,
                message : "Please Fill all the deatils"
            });
        }

        
        let user = await User.findOne({email});
        if(logintype === "Google" && !user){
            // create a new user with google email and password
            User.create({
                name : email.split("@")[0],
                email,
                collegeName : "",
                accountType : "User",
                password:await bcrypt.hash(password,10),
            });            
        }
        else if(user && logintype === "Google"){
            return res.status(200).json({
                success : true,
                message : "User logged in succesfully"
            });
        }

        user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({
                success : false,
                message : "User is not registred"
            })
        }
        const payload = {
            email : user.email,
            id : user._id,
            accountType : user.accountType,
        };

        if(await bcrypt.compare(password , user.password)){
            let token = jwt.sign(payload ,
                process.env.JWT_SECRET,
                {
                    expiresIn : "2h",
                });
                user = user.toObject();
                user.token = token;
                user.password = undefined;
                console.log(user);

                const options = {
                    expires : new Date(Date.now() + 3 *24 *60 *60*1000),
                    httpOnly : true,
                }

                res.cookie("token" , token , options).status(200).json({
                    success : true,
                    token,
                    user,
                    message : "User logged in succesfully"
                });
        }
        else{
            return res.status(403).json({
                success : false,
                message : "Pasword Incorrect"
            });
        }
    }

    catch(error){

        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Login failure",
        })
    }
}

//for canteens

exports.canteenSignup = async (req , res)=>{
    
    try{
        const {name , email ,   collegeName , accountType ,  password} = req.body;
        const existingCanteen = await Canteen.findOne({email});

        if(existingCanteen){
            return res.status(400).json({
                success : false,
                message : "User alredy exist"
            });
        }

        let hashedPassword;

        try{
            hashedPassword = await bcrypt.hash(password,10);
        }
        catch(error){
            return res.status(500).json({
                success : false,
                message : "Error in hashing password",
            })
        }

        const canteen = await Canteen.create({
            name , email , collegeName,accountType , password:hashedPassword
        });

        

        return res.status(200).json({
            success : true,
            message : "User created succesfully",
            cantId : canteen._id
        });


    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success : false,
            message : "USer can not be registred"
        });
    }
}


exports.canteenLogin = async (req , res)=>{

    
    try{
        const {email , password, logintype } = req.body;
        // console.log(logintype)
        // console.log(req.body);
        if(!email || !password){
            return res.status(400).json({
                success : false,
                message : "Please Fill all the deatils"
            });
        }

        let canteen = await Canteen.findOne({email});
        // console.log(canteen);
        if (logintype === "Google" && canteen===null) {
          // create a new user with google email and password
          Canteen.create({
            name: email.split("@")[0],
            email,
            collegeName: "",
            accountType: "Canteen",
            password: await bcrypt.hash(password, 10),
          });
        }
        else if(canteen && logintype === "Google"){
            return res.status(200).json({
                success : true,
                message : "Canteen logged in succesfully",
                cantId : canteen._id
            });
        }
        canteen = await Canteen.findOne({email});
        // console.log(canteen);

        if(canteen===null){
            return res.status(401).json({
                success : false,
                message : " Canteen is not registred"
            })
        }
        const payload = {
            email : canteen.email,
            id : canteen._id,
            accountType : canteen.accountType,
        };

        if(await bcrypt.compare(password , canteen.password)){
            let token = jwt.sign(payload ,
                process.env.JWT_SECRET,
                {
                    expiresIn : "2h",
                });
                canteen = canteen.toObject();
                canteen.token = token;
                console.log(canteen);
                canteen.password = undefined;
                console.log(canteen);

                const options = {
                    expires : new Date(Date.now() + 3 *24 *60 *60*1000),
                    httpOnly : true,
                }

                res.cookie("token" , token , options).status(200).json({
                    success : true,
                    token,
                    canteen,
                    message : "Canteen logged in succesfully",
                    cantId : canteen._id,
                });
        }
        else{
            return res.status(403).json({
                success : false,
                message : "Pasword Incorrect"
            });
        }
    }

    catch(error){

        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Login failure",
        })
    }
}




