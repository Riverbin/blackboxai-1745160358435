import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Feed</h1>
        <Link
          to="/post"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          New Post
        </Link>
      </div>
      {posts.length === 0 && <p>No posts yet.</p>}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-4 rounded shadow">
            <p className="font-semibold mb-2">{post.user.username}</p>
            {post.content && <p className="mb-2">{post.content}</p>}
            <div className="flex flex-wrap gap-4">
              {post.media.map((m, idx) => {
                if (m.type.startsWith('image')) {
                  return (
                    <img
                      key={idx}
                      src={m.url}
                      alt="post media"
                      className="max-w-xs rounded"
                    />
                  );
                } else if (m.type.startsWith('video')) {
                  return (
                    <video key={idx} controls className="max-w-xs rounded">
                      <source src={m.url} type={m.type} />
                      Your browser does not support the video tag.
                    </video>
                  );
                } else if (m.type.startsWith('audio')) {
                  return (
                    <audio key={idx} controls className="w-full">
                      <source src={m.url} type={m.type} />
                      Your browser does not support the audio element.
                    </audio>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
