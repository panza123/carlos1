import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axiosInsatnce";

interface BlogType {
  _id: string;
  title: string;
  description: string;
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
    return <div className="text-center text-gray-600 text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center text-lg">{error}</div>;
  }

  if (!blog) {
    return <div className="text-center text-gray-600 text-lg">Blog not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">{blog.title}</h1>
      
      {/* Image Container */}
      <div className="w-full h-96 overflow-hidden rounded-lg shadow-lg">
        <img
          src={
            blog.image.startsWith('/uploads/') 
              ? `http://localhost:5000${blog.image}` 
              : `http://localhost:5000/uploads/${blog.image}`
          }
          alt={blog.title}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      <p className="text-gray-700 mt-6 text-lg leading-relaxed">{blog.description}</p>
    </div>
  );
};

export default BlogId;
