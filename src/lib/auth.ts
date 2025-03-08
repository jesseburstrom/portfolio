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
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminToken', data.token);
  }
  return data;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('adminToken');
};

export const isAdmin = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!getAuthToken();
};
