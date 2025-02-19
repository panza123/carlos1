import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import blogRoutes from "./routes/blog.route.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Get the current directory of the file (for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "https://carlos1.onrender.com",  
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);

// ✅ Serve static images from `uploads`
const uploadPath = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadPath));

console.log(`Serving images from: ${uploadPath}`);

// ✅ Ensure `/uploads` images are accessible via CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL || "https://carlos1.onrender.com");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ✅ Serve frontend build files
const clientPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// ✅ Connect to Database
connectDB();

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🖼️ Serving images from: ${uploadPath}`);
});
