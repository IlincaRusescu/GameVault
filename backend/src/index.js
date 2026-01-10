const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const debugRoutes = require("./routes/debug.routes");
const authRoutes = require("./routes/auth.routes"); // 👈 adaugă asta

const { initFirebaseAdmin } = require("./services/firebaseAdmin"); // 👈 adaugă asta (dacă nu ai deja)

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// init firebase admin (o singură dată la pornire)
initFirebaseAdmin();

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "GameVault backend is running",
  });
});

app.use("/api/debug", debugRoutes);
app.use("/api/auth", authRoutes); // 👈 adaugă asta

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
