import "dotenv/config";
import app from "./app";
import pool from "./config/database";

const PORT = Number(process.env.PORT) || 5000;

pool.query("SELECT 1")
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log("Database connected successfully");
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });