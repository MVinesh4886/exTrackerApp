const expenseModel = require("../model/expenseModel");

const userModel = require("../model/userModel");
const sequelize = require("sequelize");
const db = require("../config/database");
const AWS = require("aws-sdk");

const CreateExpense = async (req, res) => {
  // First, we start a transaction from the connection and save it into a variable
  const t = await db.transaction();
  try {
    // Then, we do some calls passing this transaction as an option

    const { amount, description, category } = req.body;

    //using the params, we extract the id and update the userModel totalExpenses.
    const userId = req.params.userId;

    // Update totalExpenses in userModel
    const user = await userModel.findByPk(userId);
    //The total Expenses is the new amount plus existing expenses.
    const totalExpenses = Number(user.totalExpenses) + Number(amount);

    await user.update({ totalExpenses });

    const newTracker = await expenseModel.create(
      {
        amount,
        description,
        category,
        // userId,
      },
      { transaction: t }
    );

    // Update userId in expenseModel
    await expenseModel.update(
      { userId },
      { where: { id: newTracker.id }, transaction: t }
    );

    // If the execution reaches this line, no errors were thrown.
    //When we commit a transaction, it means that all the changes made within the transaction are permanently saved to the database.
    await t.commit();
    console.log(newTracker);
    res.status(200).json({
      success: true,
      data: newTracker,
    });

    //When you roll back a transaction, it means that all the changes made within the transaction are discarded and the database is reverted to its previous state. The rollback() method is called instead of commit() to undo any changes made within the transaction. This ensures that the database is not permanently affected by the operations within the transaction.
  } catch (error) {
    // If the execution reaches this line, an error was thrown.
    // We rollback the transaction.
    await t.rollback();
    console.log(error);
    res.status(400).json({ message: "Internal server error" });
  }
};

// to get all expenses
const GetAllExpense = async (req, res) => {
  try {
    const getTracker = await expenseModel.findAll();
    res.status(200).json({
      success: true,
      data: getTracker,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal server error" });
  }
};

//to get a single expense
const GetSingleExpense = async (req, res) => {
  try {
    const userId = req.params.userId;
    const tracker = await expenseModel.findAll({ where: { userId } });
    //if there is no expense/tracker found
    if (!tracker) {
      return res.status(404).json({ message: "tracker not found" });
    }
    res.json(tracker);
  } catch (error) {
    res.status(400).json({ message: "Internal server error" });
  }
};

//to update the expense
const UpdateExpense = async (req, res) => {
  try {
    const findExpense = await expenseModel.findByPk(req.params.id);
    if (!findExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    //update the expense
    const { amount, description, category } = req.body;
    await expenseModel.update(
      { amount, description, category },
      {
        where: { id: req.params.id },
      }
    );
    const updatedExpense = await expenseModel.findByPk(req.params.id);
    return res.status(200).json({
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const DeleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;

    // Get the amount of the expense to be deleted
    const expense = await expenseModel.findByPk(expenseId);
    const amount = expense.amount;

    const deletedTracker = await expenseModel.destroy({
      where: { id: expenseId },
    });
    if (deletedTracker === 0) {
      return res.status(500).json({ message: "tracker not found" });
    }
    // Update totalExpenses in userModel
    const userId = expense.userId;
    const user = await userModel.findByPk(userId);
    const totalExpenses = Number(user.totalExpenses) - Number(amount);
    await user.update({ totalExpenses });

    res.status(200).json({
      success: true,
      message: "expense has been deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({ message: "internal server error" });
  }
};

const ShowLeaderBoard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;

    const leaderboard = await userModel.findAll({
      attributes: [
        "id",
        "name",

        [sequelize.fn("sum", sequelize.col("expenses.amount")), "total_cost"],
      ],
      include: [
        {
          model: expenseModel,
          attributes: [],
        },
      ],
      group: ["user.id"],
      order: [["total_cost", "DESC"]],
    });

    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedLeaderboard = leaderboard.slice(startIndex, endIndex);

    console.log(paginatedLeaderboard);
    res.json({ leaderboard: paginatedLeaderboard });
    // console.log(leaderboard);
    // res.json({ leaderboard });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

async function uploadToS3(data, filename) {
  const bucketName = "expensetrackerapp4321";
  const userKey = process.env.ACCESS_KEYID;
  const secretKey = process.env.SECRET_KEYID;

  const s3Bucket = new AWS.S3({
    accessKeyId: userKey,
    secretAccessKey: secretKey,
  });

  const params = {
    Bucket: bucketName,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };

  try {
    const s3response = await s3Bucket.upload(params).promise();
    console.log("Successfully uploaded", s3response);
    return s3response.Location; // Return the URL of the uploaded file
  } catch (err) {
    console.log("Something went wrong", err);
  }
}

const Download = async (req, res) => {
  try {
    const download = await userModel.findAll();
    console.log(download);
    const stringifiedExpenses = JSON.stringify(download);
    const userId = req.params.userId;
    const filename = `Expense${userId}/${new Date()}.txt`;

    const fileUrl = uploadToS3(stringifiedExpenses, filename);
    console.log(fileUrl);
    res.status(200).json({ fileUrl, success: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  CreateExpense,
  GetAllExpense,
  GetSingleExpense,
  DeleteExpense,
  UpdateExpense,
  Download,
  ShowLeaderBoard,
};
