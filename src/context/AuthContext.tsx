import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken, clearToken, getToken } from '../lib/api';
import type { CourseId } from '../data/courses';

interface User {
  id: string;
  role: 'student' | 'lecturer' | 'tenant_admin' | 'super_admin';
  photo?: string;
  loginTime?: string;
  displayName?: string;
  course?: CourseId;
  must_change_password?: boolean;
  permissions?: string[];
  tenant_id?: number;
  session_id?: string;
}

interface AuthContextType {
  user: User | null;
  student: User | null; // backward compat alias
  loading: boolean;
  course: CourseId | null;
  mustChangePassword: boolean;
  login: (id: string, photo: string, faceAttempt?: number, skipFaceVerify?: boolean) => Promise<void>;
  lecturerLogin: (username: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token) {
      api<{ user: User }>('/api/auth/me')
        .then(data => setUser(data.user))
        .catch(() => clearToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (id: string, photo: string, faceAttempt?: number, skipFaceVerify?: boolean) => {
    const courseId = (localStorage.getItem('selected_course') ?? 'infosec') as CourseId;
    const data = await api<{ token: string; user: User }>('/api/auth/student-login', {
      method: 'POST',
      body: JSON.stringify({
        studentId: id,
        photo: photo || undefined,
        course_id: courseId,
        attempt_number: faceAttempt,
        skip_face_verify: skipFaceVerify,
      }),
    });
    setToken(data.token);
    setUser(data.user);
    navigate('/');
  };

  const lecturerLogin = async (username: string, password: string) => {
    const data = await api<{ token: string; must_change_password?: boolean; user: User }>('/api/auth/lecturer-login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    const userData = { ...data.user, must_change_password: data.must_change_password };
    setUser(userData);
    navigate('/lecturer');
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    // Update local state to remove the force-change flag
    setUser(prev => prev ? { ...prev, must_change_password: false } : null);
  };

  const logout = async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
      // Proceed with client-side cleanup even if server call fails
    }
    setUser(null);
    clearToken();
    navigate('/login');
  };

  const course: CourseId | null = user?.course
    ?? (localStorage.getItem('selected_course') as CourseId | null)
    ?? null;

  const mustChangePassword = !!(user?.must_change_password);

  return (
    <AuthContext.Provider value={{ user, student: user, loading, course, mustChangePassword, login, lecturerLogin, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
