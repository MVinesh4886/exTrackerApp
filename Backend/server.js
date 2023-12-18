const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const userModel = require("./model/userModel");
const expenseModel = require("./model/expenseModel");
const db = require("./config/database");
const userRouter = require("./route/userRoute");
const expenseRouter = require("./route/expenseRoute");
const orderRoute = require("./route/orderRoute");
const orderModel = require("./model/orderModel");

const cors = require("cors");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://127.0.0.1:5501",
    methods: ["GET", "POST", "DELETE", "PUT"],
  })
);

app.use(expenseRouter);
app.use(userRouter);
app.use(orderRoute);

// userModel.hasMany(expenseModel, { foreignKey: "userId" });
// expenseModel.belongsTo(userModel, { foreignKey: "userId" });

// userModel.hasMany(orderModel, { foreignKey: "userId" });
// orderModel.belongsTo(orderModel, { foreignKey: "userId" });

userModel.hasMany(expenseModel);
expenseModel.belongsTo(userModel);

userModel.hasMany(orderModel);
orderModel.belongsTo(userModel);

const PORT = process.env.PORT;

db.sync()
  .then((result) => {
    // console.log(result);

    app.listen(PORT, () => {
      console.log(`Server is listening on  port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
