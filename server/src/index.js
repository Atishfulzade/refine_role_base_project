const express = require("express");
const cors = require("cors");
const app = require("./app.js");
const connectDB = require("./conn/db.js");

const PORT = process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
