const express = require("express");

const cors = require("cors");

const jwt = require("jsonwebtoken");

var cookieParser = require("cookie-parser");

const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());

const User = require("./model/User");

// cors to connect frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/test", (req, res) => {
  res.json("Test Woring...");
});

app.post("/register", async (req, res) => {
  // res.json(req.body);
  const { name, sammary, email, password } = req.body;
  const emailExist = await User.findOne({ email });

  try {
    if (!emailExist) {
      saveUser = await User.create({ name, sammary, email, password });
      saveUser.save();
      res.json(saveUser);
    } else {
      console.log("err", emailExist);
      return res.status(410).json(emailExist);
    }
  } catch (error) {
    console.log("err", error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
  const userExist = await User.findOne({ email });
  if (userExist) {
    if (userExist.password === password) {
      // console.log(userExist.password, password)
      const jwtSign = jwt.sign({ id: userExist._id, name:userExist.name, sammary:userExist.sammary, email:userExist.email }, "sec");
      // console.log("jwtTok",jwtSign)
      res.cookie("token", jwtSign);

      res.status(200).json(userExist);
      console.log("lllllluuu",jwtSign)
    } else {
      console.log("wrong pass");
    }
  } else {
    console.log("not exist");
  }
  } catch (error) {
    console.log("er",error)
  }
});

app.get("/home", async (req, res) => {
    const {token} = req.cookies;
        // console.log("76;",token)
        try {
          if(token){
            const jwtVerify = jwt.verify(token,"sec");
            // console.log("kkkkk",jwtVerify)
            if(!jwtVerify){
            return res.status(402).json("invalid jwt")
            }else{
              console.log("suc:", jwtVerify)
              res.json({id:jwtVerify.id, name:jwtVerify.name, sammary:jwtVerify.sammary, email:jwtVerify.email })
            }
          }else{
            return res.status(402).json({err: "not abpppple to reqest toks"})
          }
        } catch (error) {
          return res.status(418).json(error)
        }
});

app.post('/logout', (req,res)=>{
  res.clearCookie('token')
  return res.status(201).json("logout")
})

app.get('/getFriends', async (req,res)=>{
  const {token} = req.cookies;
  try {
    if(!token){
      return res.status(401).json('jwt required');
    }else{
      const users = await User.find();
      return res.status(201).json(users)
    }
  } catch (error) {
    return res.status(403).json("cannto get friends error")
  }
})

app.post('/profile/:id', async (req,res)=>{
  const {id} = req.params;
  const {token} = req.cookies;
  // console.log("id:",id)
  try {
    const userDetail = await User.findById(id)
    // console.log("userDetail:",userDetail)
    const curentUser = await jwt.verify(token, "sec");
    // console.log("curentuSER",curentUser);
    const getCurentUserAllData = await User.findById({_id:curentUser.id});
    console.log("getCurentUserAllData",getCurentUserAllData)

    const userId = JSON.stringify(userDetail._id);
    var isFriend = false;
    console.log("128:",isFriend)
    for(let i of getCurentUserAllData.friends){
      if(userId === JSON.stringify(i)){
        console.log("isTrue",i)
         isFriend = true;
        var getFriendAllData = await User.findById({_id:i});
         break;
       
      }
      else{
        isFriend = false;
        var getFriendAllData = await User.findById({_id:i});
      }
    }

    if(isFriend){
        console.log("143:",isFriend)
        console.log("onlyName",getFriendAllData.name)
          return res.status(202).json({validFriend : getFriendAllData, isFriend:isFriend});
    }else{
      console.log("148: not a friend",isFriend)
      console.log("all detail",userDetail)
      return res.status(203).json({validFriend : userDetail,isFriend:isFriend});

    }
    // console.log("138:",isFriend)


  } catch (error) {
    console.log(error)
  }
})

// app.post('/profile/:id', async (req,res)=>{
//   const {id} = req.params;
//   const {token} = req.cookies;
//   // console.log("id:",id)
//   try {
//     const userDetail = await User.findById(id)
//     // console.log("userDetail:",userDetail)
//     const curentUser = await jwt.verify(token, "sec");
//     // console.log("curentuSER",curentUser);
//     const getCurentUserAllData = await User.findById({_id:curentUser.id});
//     console.log("getCurentUserAllData",getCurentUserAllData)

//     const userId = JSON.stringify(userDetail._id);

//     for(let i of getCurentUserAllData.friends){
//       if(userId === JSON.stringify(i)){
//         console.log("isTrue",i)
//         let getFriendAllData = await User.findById({_id:i});
//         console.log("onlyName",getFriendAllData.name)
//           return res.status(202).json(getFriendAllData);
//       }
//     }
//     // return res.status(201).json(userDetail)
//   } catch (error) {
//     console.log(error)
//   }
// })
app.post('/follows/:id', async (req,res)=>{
  const {token} = req.cookies;
  const {id} = req.params;
  // console.log("id:",id)
  try {

    const verifyUser = await jwt.verify(token, 'sec');
    console.log("vUser",verifyUser);

    const currentDetail = await User.findByIdAndUpdate({_id:verifyUser.id},{$addToSet:{friends:id}},{new:true})
    console.log("follow currentDetail:",currentDetail)
    // const insertFriend = await User.findByIdAndUpdate({id,friends : userDetail._id})
    // console.log("friend:",insertFriend);
    return res.status(201).json({update:currentDetail})
  } catch (error) {
    console.log(error)
  }
})

app.get('/getfriends/:id', async (req,res)=>{
    console.log(req.params);
    const {id} = req.params
  try {
    const allFriends= await User.findById({_id:id}).populate('friends')
    console.log(allFriends)
      res.status(201).json(allFriends)
    } catch (error) {
      console.log(error)
    }
})

app.post('/follow/:id' , async (req,res)=>{

  const {token} = req.cookies;
  const {id} = req.body;
  
  try {

    const verifyUser = await jwt.verify(token, 'sec');
    console.log("vUser",verifyUser);

    const currentDetail = await User.findByIdAndUpdate({_id:verifyUser.id},{$addToSet:{friends:id}},{new:true})
    console.log("follow currentDetail:",currentDetail)
    // const insertFriend = await User.findByIdAndUpdate({id,friends : userDetail._id})
    // console.log("friend:",insertFriend);
    return res.status(201).json({update:currentDetail})
  } catch (error) {
    console.log(error)
  }

  res.status(201).json(req.body)
  
})

app.post('/unfollow/:id' , async (req,res)=>{
  console.log("foll",req.body)
  res.status(201).json(req.body)

})
  

require("./db/dbConnect");
app.listen(5000, () => {
  console.log("Server Loading || 5000");
});
