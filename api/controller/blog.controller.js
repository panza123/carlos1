import User from "../model/auth.model.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import Blog from "../model/blog.model.js";

// ✅ Ensure `uploads/` directory is created before using it
const UPLOAD_DIR = path.resolve("uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`✅ Upload directory created: ${UPLOAD_DIR}`);
} else {
    console.log(`✅ Upload directory already exists: ${UPLOAD_DIR}`);
}

// ✅ Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(`📂 Saving file to: ${UPLOAD_DIR}`);
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        console.log(`📁 File saved as: ${filename}`);
        cb(null, filename);
    },
});

// ✅ File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only images are allowed."));
    }
};

// ✅ Upload middleware
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

// ✅ Create Blog
export const createBlog = [
    upload.single("image"),
    async (req, res) => {
        const { token } = req.cookies;
        try {
            const { title, description, model, year } = req.body;

            if (!token) {
                return res.status(401).json({ success: false, message: "Token is required" });
            }

            if (!title || !description || !model || !year) {
                return res.status(403).json({ success: false, message: "All fields are required" });
            }

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(401).json({ success: false, message: "Invalid or expired token" });
            }

            const foundedUser = await User.findById(decoded.id);
            if (!foundedUser) {
                return res.status(401).json({ success: false, message: "Not authorized, user not found" });
            }

            const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

            const blog = await Blog.create({
                owner: foundedUser._id,
                title,
                description,
                image: imagePath,
                model,
                year,
            });

            return res.status(201).json({
                success: true,
                message: "Blog created successfully",
                data: blog,
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },
];

// ✅ Get All Blogs
export const getAllJobs = async (req, res) => {
    try {
        console.log("Received GET request to /blogs");

        const blogs = await Blog.find({});
        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ success: false, message: "No blogs found" });
        }

        console.log("Fetched blogs:", blogs);
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

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid or expired token" });
        }

        const user = await User.findById(decoded.id).select("_id");
        const blogs = await Blog.find({ owner: user._id });

        res.status(200).json({ success: true, message: "Blogs retrieved successfully", data: blogs });
    } catch (err) {
        console.error("Error fetching blogs by creator:", err);
        res.status(500).json({ success: false, message: "Failed to get blogs by creator", error: err.message });
    }
};

// ✅ Get Blog by ID
export const getJobId = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.status(200).json({ blog });
    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

// ✅ Edit Blog
export const editBlog = async (req, res) => {
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
            blog.image = `/uploads/${req.file.filename}`;
        }

        await blog.save();

        return res.status(200).json({ success: true, message: "Blog updated successfully", blog });
    } catch (error) {
        console.error("Error editing blog:", error);
        return res.status(500).json({ success: false, message: "Internal server error", error });
    }
};

// ✅ Delete Blog
export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }

        await Blog.findByIdAndDelete(id);

        if (blog.image) {
            const imagePath = path.resolve(`.${blog.image}`);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.status(200).json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json({ success: false, message: "Internal server error", error });
    }
};
