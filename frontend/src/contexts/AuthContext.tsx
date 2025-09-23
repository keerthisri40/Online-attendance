import React, { createContext, useContext, useState, useEffect } from 'react';

// --- INTERFACES (No changes needed here) ---
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'faculty' | 'student';
  department?: string;
  registrationNumber?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface LoginCredentials {
  userId: string;
  password: string;
  role: 'admin' | 'faculty' | 'student';
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'faculty' | 'student';
  department?: string;
  registrationNumber?: string;
}
// --- END OF INTERFACES ---


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Define the base URL for your backend API
const API_URL = 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This part remains the same, it checks for a logged-in user in local storage
    const storedUser = localStorage.getItem('attendanceUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const foundUser: User = await response.json();
      setUser(foundUser);
      localStorage.setItem('attendanceUser', JSON.stringify(foundUser));
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupData) => {
    setLoading(true);
    if (data.password !== data.confirmPassword) {
      setLoading(false);
      throw new Error('Passwords do not match');
    }
    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account.');
      }

      const newUser: User = await response.json();
      setUser(newUser);
      localStorage.setItem('attendanceUser', JSON.stringify(newUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('attendanceUser');
  };

  const updateProfile = async (data: Partial<User>) => {
    // This is still mock logic. You would need a '/api/profile' endpoint for this.
    if (!user) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('attendanceUser', JSON.stringify(updatedUser));
    setLoading(false);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};