const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoute.js");

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api", authRoutes);

module.exports = app;
