import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PostCreate() {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const mediaData = files.map((file) => {
      return {
        file,
        url: URL.createObjectURL(file),
        type: file.type,
      };
    });
    setMediaFiles(mediaData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Convert files to base64 for demo purposes
      const media = await Promise.all(
        mediaFiles.map((m) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(m.file);
            reader.onload = () => resolve({ url: reader.result, type: m.type });
            reader.onerror = (error) => reject(error);
          });
        })
      );

      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');

      const res = await axios.post(
        'http://localhost:5000/api/posts',
        { user: user.id, content, media },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/feed');
    } catch (err) {
      setError('Failed to create post');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Create New Post</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          placeholder="Write something..."
          className="w-full p-3 border border-gray-300 rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleFileChange}
          className="block"
        />
        <div className="flex flex-wrap gap-4 mt-2">
          {mediaFiles.map((m, idx) => {
            if (m.type.startsWith('image')) {
              return (
                <img key={idx} src={m.url} alt="preview" className="max-w-xs rounded" />
              );
            } else if (m.type.startsWith('video')) {
              return (
                <video key={idx} src={m.url} controls className="max-w-xs rounded" />
              );
            } else if (m.type.startsWith('audio')) {
              return (
                <audio key={idx} src={m.url} controls className="w-full" />
              );
            }
            return null;
          })}
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Post
        </button>
      </form>
    </div>
  );
}
