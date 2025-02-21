import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axiosInstance";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Blog {
  _id: string;
  image: string;
  description: string;
}

const Profile: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axiosInstance.get("/blog/fetch");
        console.log(res.data);
        setBlogs(res.data.data || []);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to fetch blogs");
      }
    };

    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/blog/delete/${id}`);
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      toast.success("Blog deleted successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete blog");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Your Blogs
      </h1>
      {blogs.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">No blogs available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <img
                src={
                  blog.image
                    ? blog.image.startsWith("http")
                      ? blog.image
                      : `http://localhost:5000/uploads/${blog.image}`
                    : "default-image-url.jpg"
                }
                alt="Blog Image"
                className="w-full h-56 object-cover"
                loading="eager"
              />
              <div className="p-4">
                <p className="text-gray-700 text-sm mb-4">
                  {blog.description.length > 120
                    ? `${blog.description.slice(0, 120)}...`
                    : blog.description}
                </p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => navigate(`/edit/${blog._id}`)}
                    className="flex items-center text-blue-500 hover:text-blue-700 transition duration-200"
                  >
                    <FaEdit className="mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="flex items-center text-red-500 hover:text-red-700 transition duration-200"
                  >
                    <FaTrashAlt className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
