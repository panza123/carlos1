import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/connectDb.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import blogRoutes from './routes/blog.route.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Get the current directory of the file (for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "https://carlos1.onrender.com",  
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);

// ✅ Serve static files from the `uploads` folder in `carlos/`
const uploadPath = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadPath));

console.log(`Serving images from: ${uploadPath}`);

// ✅ Serve frontend build files (client is outside api)
const clientPath = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientPath));

app.get("*", (req, res) => {
    res.sendFile(path.resolve(clientPath, "index.html"));
});

// Connect to the database
connectDB();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
