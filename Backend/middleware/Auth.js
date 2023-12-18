// const getToken = require("../utils/getToken");
// const verifyToken = require("../utils/verifyToken");
// const userModel = require("../model/userModel");

// const isLogin = async (req, res, next) => {
//   try {
//     //1.get Token from headers
//     const token = getToken(req);
//     console.log("Token from isLogin: ", token);
//     //2.verify Token
//     const decodedUser = verifyToken(token);
//     console.log("This is token of decoded User: ", decodedUser);

//     const user = await userModel.findByPk(decodedUser.id);
//     console.log("Checking user Login: ", user);

//     // if there is no decoded user then
//     if (!decodedUser) {
//       return res.json({
//         message: "Invalid token or token expired",
//       });
//       // throw new Error("Invalid token or token expired");
//     }

//     //3. save the user into req obj
//     // req.user = decodedUser;
//     // console.log("Id of the decoded User: ", req.user);
//     req.user = user;
//     console.log("Id of the decoded User: ", req.user);

//     next();
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({ error: error.message });
//   }
// };

// module.exports = isLogin;
const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

const isLogin = async (req, res, next) => {
  try {
    //1.get Token from headers
    const token = req.headers["authorization"].split(" ")[1];
    // console.log("Get Token from the headers: ", token);

    //2.verify Token
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log("Verify Token: ", decodedUser);

    const user = await userModel.findByPk(decodedUser.id);
    // console.log("Check User Login: ", user);

    if (user) {
      req.user = user;
      // console.log("Id of the decoded User: ", req.user);
      next();
    } else {
      return res.json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = isLogin;
