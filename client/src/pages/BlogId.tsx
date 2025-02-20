import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axiosInsatnce";

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
    return <div className="text-center text-gray-500 text-xl font-medium">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-lg font-semibold">{error}</div>;
  }

  if (!blog) {
    return <div className="text-center text-gray-500 text-xl">Blog not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      {/* Blog Title */}
      <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-6 leading-tight">
        {blog.title}
      </h1>

      {/* Image Section */}
      <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
        <img
          src={`http://localhost:5000${blog.image.startsWith("/") ? blog.image : `/uploads/${blog.image}`}`}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Blog Content */}
      <div className="mt-6">
        <p className="text-gray-700 text-lg leading-relaxed">{blog.description}</p>

        <div className="mt-6 border-t border-gray-300 pt-4 text-gray-600">
          <p className="text-lg font-semibold">
            Car product: <span className="text-gray-900">{blog.model}</span>
          </p>
          <p className="text-lg">
            Published on:{" "}
            <span className="text-gray-900">
              {new Date(blog.year).toLocaleDateString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlogId;
