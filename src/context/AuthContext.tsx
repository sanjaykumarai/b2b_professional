import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Business, UserRole, LoginPayload, SignupPayload } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  currentBusiness: Business | null;
  allBusinesses: Business[];
  allUsers: User[];
  currentRole: UserRole;
  isAuthenticated: boolean;
  authPortalRole: UserRole;
  setAuthPortalRole: (role: UserRole) => void;
  login: (payload: LoginPayload) => Promise<{ success: boolean; error?: string }>;
  signup: (payload: SignupPayload) => Promise<{ success: boolean; error?: string }>;
  switchUser: (userId: string) => void;
  switchBusiness: (businessId: string) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  refreshUsersAndBusinesses: () => Promise<void>;
  removeUser: (userId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  addUser: (payload: Partial<User>) => Promise<User>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'omniflow_auth_user_id';
const PORTAL_STORAGE_KEY = 'omniflow_auth_portal_role';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authPortalRole, setAuthPortalRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem(PORTAL_STORAGE_KEY) as UserRole) || 'OWNER';
  });
  const [isLoading, setIsLoading] = useState(true);

  const setAuthPortalRole = (role: UserRole) => {
    setAuthPortalRoleState(role);
    localStorage.setItem(PORTAL_STORAGE_KEY, role);
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [businesses, users] = await Promise.all([api.getBusinesses(), api.getUsers()]);
      setAllBusinesses(businesses);
      setAllUsers(users);

      const savedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUserId) {
        const matchingUser = users.find((u) => u.id === savedUserId);
        if (matchingUser) {
          setCurrentUser(matchingUser);
          const biz = businesses.find((b) => b.id === matchingUser.businessId) || businesses[0] || null;
          setCurrentBusiness(biz);
          setAuthPortalRoleState(matchingUser.role);
          return;
        }
      }

      // If no saved user, don't auto-force if user explicitly logs out; or set default for initial load
      if (businesses.length > 0 && users.length > 0) {
        const defaultBiz = businesses[0];
        setCurrentBusiness(defaultBiz);
        const defaultUser = users.find((u) => u.businessId === defaultBiz.id && u.role === 'OWNER') || users[0];
        setCurrentUser(defaultUser || null);
        if (defaultUser) {
          setAuthPortalRoleState(defaultUser.role);
        }
      }
    } catch (err) {
      console.error('Failed to load initial auth data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const login = async (payload: LoginPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await api.login(payload);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setCurrentBusiness(res.business);
        setAuthPortalRole(res.user.role);
        localStorage.setItem(AUTH_STORAGE_KEY, res.user.id);
        await refreshUsersAndBusinesses();
        return { success: true };
      }
      return { success: false, error: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to authenticate' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: SignupPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await api.signup(payload);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setCurrentBusiness(res.business);
        setAuthPortalRole(res.user.role);
        localStorage.setItem(AUTH_STORAGE_KEY, res.user.id);
        await refreshUsersAndBusinesses();
        return { success: true };
      }
      return { success: false, error: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to register account' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchBusiness = (businessId: string) => {
    const biz = allBusinesses.find((b) => b.id === businessId);
    if (!biz) return;
    setCurrentBusiness(biz);
    // Find matching user with same role if possible
    const currentRole = currentUser?.role || 'OWNER';
    const userInBiz =
      allUsers.find((u) => u.businessId === businessId && u.role === currentRole) ||
      allUsers.find((u) => u.businessId === businessId) ||
      null;
    if (userInBiz) {
      setCurrentUser(userInBiz);
      localStorage.setItem(AUTH_STORAGE_KEY, userInBiz.id);
    }
  };

  const switchUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (!user) return;
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    setAuthPortalRole(user.role);
    if (user.businessId !== currentBusiness?.id) {
      const biz = allBusinesses.find((b) => b.id === user.businessId);
      if (biz) setCurrentBusiness(biz);
    }
  };

  const switchRole = (role: UserRole) => {
    setAuthPortalRole(role);
    if (!currentBusiness) return;
    const userWithRole = allUsers.find(
      (u) => u.businessId === currentBusiness.id && u.role === role
    );
    if (userWithRole) {
      setCurrentUser(userWithRole);
      localStorage.setItem(AUTH_STORAGE_KEY, userWithRole.id);
    } else {
      // Create a temporary mock user for the role in current business
      const fallbackUser: User = {
        id: `usr_${role.toLowerCase()}_${Date.now()}`,
        name: role === 'OWNER' ? `${currentBusiness.name} Executive` : role === 'STAFF' ? 'Specialist Operator' : 'Client Representative',
        email: `${role.toLowerCase()}@${currentBusiness.name.toLowerCase().replace(/\s+/g, '')}.com`,
        role,
        businessId: currentBusiness.id,
        title: role === 'OWNER' ? 'Owner & Founder' : role === 'STAFF' ? 'Operational Staff' : 'Client User',
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(fallbackUser);
      localStorage.setItem(AUTH_STORAGE_KEY, fallbackUser.id);
    }
  };

  const refreshUsersAndBusinesses = async () => {
    const [businesses, users] = await Promise.all([api.getBusinesses(), api.getUsers()]);
    setAllBusinesses(businesses);
    setAllUsers(users);
    if (currentBusiness) {
      const updated = businesses.find((b) => b.id === currentBusiness.id);
      if (updated) setCurrentBusiness(updated);
    }
  };

  const removeUser = async (userId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await api.deleteUser(userId);
      setAllUsers((prev) => prev.filter((u) => u.id !== userId));

      // If current user is the one that got deleted, switch to default or logout
      if (currentUser?.id === userId) {
        const remainingUsers = allUsers.filter((u) => u.id !== userId);
        if (remainingUsers.length > 0) {
          const fallback = remainingUsers.find((u) => u.businessId === currentBusiness?.id) || remainingUsers[0];
          setCurrentUser(fallback);
          localStorage.setItem(AUTH_STORAGE_KEY, fallback.id);
        } else {
          logout();
        }
      }
      await refreshUsersAndBusinesses();
      return { success: true, message: res.message || 'User removed successfully' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to remove user' };
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (payload: Partial<User>): Promise<User> => {
    try {
      setIsLoading(true);
      const created = await api.createUser(payload);
      setAllUsers((prev) => [...prev, created]);
      await refreshUsersAndBusinesses();
      return created;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentBusiness,
        allBusinesses,
        allUsers,
        currentRole: currentUser?.role || authPortalRole,
        isAuthenticated: !!currentUser,
        authPortalRole,
        setAuthPortalRole,
        login,
        signup,
        switchUser,
        switchBusiness,
        switchRole,
        logout,
        refreshUsersAndBusinesses,
        removeUser,
        addUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

