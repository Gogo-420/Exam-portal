import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage, initializeStorage } from '../utils/storage';
import { DEMO_USERS } from '../utils/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const currentUser = storage.getUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      // Default demo initial state: student
      setUser(DEMO_USERS.student);
      storage.setUser(DEMO_USERS.student);
    }
    setLoading(false);
  }, []);

  const login = (emailOrUsername, password, role) => {
    let matchedUser = null;

    if (role === 'admin') {
      if (emailOrUsername === 'admin' || emailOrUsername === DEMO_USERS.admin.email) {
        matchedUser = { ...DEMO_USERS.admin };
      } else {
        matchedUser = {
          id: 'adm_custom_' + Date.now(),
          name: emailOrUsername || 'Administrator',
          username: emailOrUsername,
          email: 'admin@examportal.edu',
          role: 'admin',
          department: 'Central Board',
          avatar: DEMO_USERS.admin.avatar,
        };
      }
    } else if (role === 'interviewer') {
      if (emailOrUsername === DEMO_USERS.interviewer.email) {
        matchedUser = { ...DEMO_USERS.interviewer };
      } else {
        matchedUser = {
          id: 'int_custom_' + Date.now(),
          name: emailOrUsername.split('@')[0].replace('.', ' ') || 'Professor',
          email: emailOrUsername,
          role: 'interviewer',
          domain: 'Computer Science',
          experience: '5 Years',
          department: 'Department of Computer Science',
          avatar: DEMO_USERS.interviewer.avatar,
        };
      }
    } else {
      // student
      if (emailOrUsername === DEMO_USERS.student.email) {
        matchedUser = { ...DEMO_USERS.student };
      } else {
        matchedUser = {
          id: 'std_custom_' + Date.now(),
          name: emailOrUsername.split('@')[0].replace('.', ' ') || 'Student',
          email: emailOrUsername,
          role: 'student',
          rollNo: 'CS2026-REG',
          department: 'School of Computing',
          avatar: DEMO_USERS.student.avatar,
        };
      }
    }

    setUser(matchedUser);
    storage.setUser(matchedUser);
    return matchedUser;
  };

  const register = (data, role) => {
    const newUser = {
      id: `${role === 'student' ? 'std' : 'int'}_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: role,
      domain: data.domain || 'Computer Science',
      rollNo: data.rollNo || `CS2026-${Math.floor(100 + Math.random() * 900)}`,
      department: data.department || 'School of Engineering',
      avatar: `https://images.unsplash.com/photo-${role === 'student' ? '1535713875002-d1d0cf377fde' : '1573496359142-b8d87734a5a2'}?auto=format&fit=crop&q=80&w=250`,
    };

    setUser(newUser);
    storage.setUser(newUser);
    return newUser;
  };

  const switchRoleDemo = (roleKey) => {
    if (DEMO_USERS[roleKey]) {
      const demoUser = DEMO_USERS[roleKey];
      setUser(demoUser);
      storage.setUser(demoUser);
      return demoUser;
    }
  };

  const logout = () => {
    setUser(null);
    storage.removeUser();
  };

  const updateProfile = (updatedFields) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    storage.setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        loading,
        login,
        register,
        logout,
        switchRoleDemo,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
