import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { DEFAULT_USERS, AUTH_STORAGE_KEY, USERS_STORAGE_KEY } from '../constants/auth';
import { storage } from '../utils/storage';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Initialize auth state and user list from localStorage on mount
  useEffect(() => {
    // Load user list (or seed from defaults)
    const storedUsers = storage.get<User[]>(USERS_STORAGE_KEY);
    if (storedUsers && storedUsers.length > 0) {
      setAllUsers(storedUsers);
    } else {
      const defaultUserList = DEFAULT_USERS.map(uc => uc.user);
      setAllUsers(defaultUserList);
      storage.set(USERS_STORAGE_KEY, defaultUserList);
    }

    // Restore session — preserve any custom accessRoutes the user has saved
    try {
      const storedAuth = storage.get<{ user: User }>(AUTH_STORAGE_KEY);
      if (storedAuth && storedAuth.user && storedAuth.user.id && storedAuth.user.role && storedAuth.user.accessRoutes) {
        // Use stored routes as-is (admin may have customised their own access)
        setIsAuthenticated(true);
        setUser(storedAuth.user);
      } else if (storedAuth) {
        storage.remove(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      storage.remove(AUTH_STORAGE_KEY);
    }
  }, []);

  // Login function - validates credentials against all known users
  const login = (email: string, password: string, dryRun = false): boolean => {
    const trimmedEmail = email.trim().toLowerCase();

    const match = DEFAULT_USERS.find(
      uc => uc.email.toLowerCase() === trimmedEmail && uc.password === password
    );

    if (match) {
      if (!dryRun) {
        setIsAuthenticated(true);
        setUser(match.user);
        storage.set(AUTH_STORAGE_KEY, { user: match.user });
      }
      return true;
    }

    const dynamicUser = allUsers.find(u => u.email.toLowerCase() === trimmedEmail);
    if (dynamicUser && password === 'Password@123') {
      if (!dryRun) {
        const activatedUser = { ...dynamicUser, status: 'active' as const };
        setIsAuthenticated(true);
        setUser(activatedUser);
        storage.set(AUTH_STORAGE_KEY, { user: activatedUser });
        const updated = allUsers.map(u => u.id === activatedUser.id ? activatedUser : u);
        setAllUsers(updated);
        storage.set(USERS_STORAGE_KEY, updated);
      }
      return true;
    }

    return false;
  };

  // Logout function - clears state and storage
  const logout = (): void => {
    setIsAuthenticated(false);
    setUser(null);
    storage.remove(AUTH_STORAGE_KEY);
  };

  // Add a new user (from UAM module)
  const addUser = (newUser: User): void => {
    const updated = [...allUsers, newUser];
    setAllUsers(updated);
    storage.set(USERS_STORAGE_KEY, updated);
  };

  // Update an existing user — also updates the active session if it's the current user
  const updateUser = (userId: string, updates: Partial<User>): void => {
    const updated = allUsers.map(u => u.id === userId ? { ...u, ...updates } : u);
    setAllUsers(updated);
    storage.set(USERS_STORAGE_KEY, updated);
    // Keep the active session in sync so the sidebar reflects changes immediately
    if (user && user.id === userId) {
      const updatedSelf = { ...user, ...updates };
      setUser(updatedSelf);
      storage.set(AUTH_STORAGE_KEY, { user: updatedSelf });
    }
  };

  // Remove a user
  const removeUser = (userId: string): void => {
    const updated = allUsers.filter(u => u.id !== userId);
    setAllUsers(updated);
    storage.set(USERS_STORAGE_KEY, updated);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    allUsers,
    login,
    logout,
    addUser,
    updateUser,
    removeUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
