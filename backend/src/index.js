const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const debugRoutes = require("./routes/debug.routes");
const authRoutes = require("./routes/auth.routes");

const { initFirebaseAdmin } = require("./services/firebaseAdmin");

const app = express();

const catalogRoutes = require("./routes/catalog.routes");


app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/catalog", catalogRoutes);


// init firebase admin (o singură dată la pornire)
initFirebaseAdmin();

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "GameVault backend is running",
  });
});

app.use("/api/debug", debugRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
