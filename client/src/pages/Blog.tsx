import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axiosInstance";

import { Link } from "react-router-dom";

interface BlogType {
  _id: string;
  title: string;
  description: string;
  image: string;
}

const Blog = () => {
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axiosInstance
      .get("/blog/blogs")
      .then((res) => {
        if (res.data && res.data.blogs) {
          setBlogs(res.data.blogs);
        } else {
          setError("Invalid response format.");
        }
      })
      .catch((err) => {
        setError("Failed to load blogs. Please try again.");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center text-gray-600 text-lg py-10">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-900 text-center mb-10">Latest Blogs</h1>

      {error && <p className="text-red-500 text-center mb-6">{error}</p>}

      {blogs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              to={`/blog/${blog._id}`}
              className="block rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl"
            >
              {/* Blog Image */}
              <div className="w-full h-60">
              <img
  src={`http://localhost:5000${blog.image.startsWith("/") ? blog.image : `/uploads/${blog.image}`}`}
  alt={blog.title}
  className="w-full h-full object-cover"
  loading="eager"
/>

              </div>

              {/* Blog Content */}
              <div className="p-6 bg-white">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{blog.title}</h2>
                <p className="text-gray-600">
                  {blog.description.length > 80
                    ? `${blog.description.slice(0, 80)}...`
                    : blog.description}
                </p>
                <p className="text-blue-600 font-medium mt-4">Read More →</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-700 text-center">No blogs found.</p>
      )}
    </div>
  );
};

export default Blog;
