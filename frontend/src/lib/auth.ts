// Authentication utility functions
export const login = async (username: string, password: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  localStorage.setItem('adminToken', data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem('adminToken');
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
};

export const isAdmin = () => {
  return !!getAuthToken();
};
