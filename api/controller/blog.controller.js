
import User from "../model/auth.model.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Blog from "../model/blog.model.js";
import dotenv from "dotenv";
dotenv.config();

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer Storage Configuration (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

console.log("Multer storage configured: Using memory storage.");

// ✅ Upload Image to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "blogs" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// ✅ Create Blog
export const createBlog = [
    upload.single("image"),
    async (req, res) => {
      try {
        console.log("🔵 Received request to create blog");
        console.log("📝 Request body:", req.body);
        console.log("🖼️ File received:", req.file ? "Yes" : "No image uploaded");
  
        // Check for token
        const token = req.cookies.token;
        console.log("🔑 Token received:", token ? "Yes" : "No token provided");
        if (!token) {
          return res.status(401).json({ success: false, message: "Token required" });
        }
  
        // Verify token safely
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log("✅ Token verified:", decoded);
        } catch (err) {
          console.error("❌ Token verification failed:", err.message);
          return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }
  
        const user = await User.findById(decoded.id);
        console.log("👤 User found:", user ? "Yes" : "No user found");
        if (!user) {
          return res.status(401).json({ success: false, message: "Unauthorized" });
        }
  
        // Upload image only if provided
        let imagePath = null;
        if (req.file) {
          try {
            imagePath = await uploadToCloudinary(req.file.buffer);
            console.log("✅ Image uploaded successfully:", imagePath);
          } catch (uploadError) {
            console.error("❌ Image upload failed:", uploadError.message);
            return res.status(500).json({ success: false, message: "Image upload failed", error: uploadError.message });
          }
        }
  
        // Create new blog post
        const blog = await Blog.create({ 
          owner: user._id, 
          title: req.body.title, 
          description: req.body.description, 
          image: imagePath, 
          model: req.body.model, 
          year: new Date(),
        });
  
        console.log("✅ Blog created successfully:", blog);
  
        return res.status(201).json({ 
          success: true, 
          message: "Blog created successfully", 
          data: blog 
        });
  
      } catch (err) {
        console.error("❌ Error creating blog:", err);
        res.status(500).json({ 
          success: false, 
          message: "Internal server error", 
          error: err.message,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
      }
    },
  ];
  

// ✅ Get All Blogs
export const getAllJobs = async (req, res) => { 
    try {
         const blogs = await Blog.find().sort({ createdAt: -1 }); // Newest first
        if (!blogs.length) {
            return res.status(404).json({ success: false, message: "No blogs found" });
        }
        return res.status(200).json({ success: true, message: "Blogs fetched successfully", blogs });
    } catch (err) {
        console.error("Error fetching blogs:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Get Blogs by Creator
export const getBlogsByCreator = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized, token not provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("_id");

        const blogs = await Blog.find({ owner: user._id });

        return res.status(200).json({ success: true, message: "Blogs retrieved successfully", data: blogs });
    } catch (err) {
        console.error("Error fetching blogs by creator:", err);
        res.status(500).json({ success: false, message: "Failed to get blogs by creator" });
    }
};

// ✅ Get Blog by ID
export const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        return res.status(200).json({ success: true, blog });
    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Edit Blog
export const editBlog = [
    upload.single("image"),
    async (req, res) => { 
        try {
            const { id } = req.params;
            const { title, description, model, year } = req.body;

            if (!title || !description || !model || !year) {
                return res.status(400).json({ success: false, message: "All fields are required" });
            }

            const blog = await Blog.findById(id);
            if (!blog) {
                return res.status(404).json({ success: false, message: "Blog not found" });
            }

            blog.title = title;
            blog.description = description;
            blog.model = model;
            blog.year = year;

            if (req.file) { 
                blog.image = await uploadToCloudinary(req.file.buffer);
            }

            await blog.save();
            return res.status(200).json({ success: true, message: "Blog updated successfully", blog });
        } catch (error) {
            console.error("Error editing blog:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
];

// ✅ Delete Blog
export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        await Blog.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Error deleting blog:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
