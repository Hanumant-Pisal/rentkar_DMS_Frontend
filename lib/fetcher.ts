import axios from 'axios';
export const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await axios.get(url, { 
    headers,
    withCredentials: true 
  });
  return res.data;
};
