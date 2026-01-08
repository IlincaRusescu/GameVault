const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "GameVault API" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`GameVault API running on port ${PORT}`);
});
