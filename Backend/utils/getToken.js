//get Token from headers

// const getToken = (req) => {
//   const headerObj = req.headers;
//   console.log("headers: ", headerObj);
//   const token = headerObj["authorization"].split(" ")[1];
//   console.log("Get Token from the headers: ", token);

//   //if there is token, return token
//   if (token !== undefined) {
//     return token;
//   }

//   return {
//     status: "failed",
//     message: "There is no token attached to the headers",
//   };
// };

// module.exports = getToken;

// const token = getToken(req);
