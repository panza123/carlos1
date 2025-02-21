import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axiosInstance";

interface BlogType {
  _id: string;
  title: string;
  description: string;
  model: string;
  year: number;
  image: string;
}

const BlogId = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;

    axiosInstance
      .get(`/blog/blogs/${id}`)
      .then((res) => {
        if (res.data && res.data.blog) {
          setBlog(res.data.blog);
        } else {
          setError("Blog not found.");
        }
      })
      .catch(() => {
        setError("Failed to load the blog. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-xl font-semibold animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-xl">Blog not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-lg mt-10 border border-gray-200">
      {/* Blog Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-6">
        {blog.title}
      </h1>

      {/* Image Section */}
      <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
        <img
          src={
            blog.image
              ? blog.image.startsWith("http")
                ? blog.image
                : `http://localhost:5000/uploads/${blog.image}`
              : "default-image-url.jpg"
          }
          alt={blog.title || "Blog Image"}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Blog Content */}
      <div className="mt-6 px-4">
        <p className="text-gray-700 text-lg leading-relaxed">{blog.description}</p>

        <div className="mt-6 border-t border-gray-300 pt-4 text-gray-600 space-y-2">
          <p className="text-lg font-semibold">
            <span className="text-gray-900">Car Product:</span> {blog.model}
          </p>
          <p className="text-lg">
  <span className="text-gray-900">Published on:</span>{" "}
  {blog.year ? new Date(blog.year).toLocaleDateString() : "Unknown"}
</p>

        </div>
      </div>
    </div>
  );
};

export default BlogId;
