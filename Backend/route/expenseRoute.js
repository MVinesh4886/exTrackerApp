const express = require("express");

const isLogin = require("../middleware/Auth");
const {
  CreateExpense,
  GetAllExpense,
  GetSingleExpense,
  DeleteExpense,
  UpdateExpense,
  Download,
  ShowLeaderBoard,
} = require("../controller/expenseController");
const expenseRouter = express.Router();

expenseRouter.post("/expense/create/:userId", isLogin, CreateExpense);

expenseRouter.get("/expense/get", isLogin, GetAllExpense);

expenseRouter.get("/expense/getSingle/:userId", isLogin, GetSingleExpense);

expenseRouter.put("/expense/put/:id", isLogin, UpdateExpense);

expenseRouter.delete("/expense/delete/:id", isLogin, DeleteExpense);

expenseRouter.get("/expense/showleaderboard", isLogin, ShowLeaderBoard);

expenseRouter.get("/expense/download/:userId", isLogin, Download);

module.exports = expenseRouter;
