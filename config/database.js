const mongoose = require("mongoose");

const database = () => {
  mongoose.connect(process.env.DB_URI);

  const {connection} = mongoose;

  connection.on("error", (err) => {
    console.error(`Error connecting to database: ${err}`);
  });

  connection.once("open", () => {
    console.log("Database connected");
  });
};

module.exports = database;
