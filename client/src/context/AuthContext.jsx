// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  loginApi,
  requestOtpApi,
  verifyOtpApi,
  getMeApi,
} from "../api/auth";

const AuthContext = createContext(null);

const USER_KEY = "campkart_user";
const TOKEN_KEY = "campkart_token";
const ONBOARDING_KEY = "campkart_onboarding_completed";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // -----------------------------
  // Load existing session on refresh
  // -----------------------------
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        // Defensive check for new fields
        if (parsedUser && parsedUser.onboardingCompleted === undefined) {
          parsedUser.onboardingCompleted = parsedUser.role === 'admin';
        }
        setUser(parsedUser);
        setToken(storedToken);

        // Check if onboarding is needed
        const onboardingCompleted = localStorage.getItem(ONBOARDING_KEY) === 'true';

        /*  
        if (!onboardingCompleted) {
          setShowOnboarding(true);
        }
        */

        // Optional: refresh user data from backend
        getMeApi()
          .then((data) => {
            if (data?.user) {
              setUser(data.user);
              localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }
          })
          .catch(() => {
            // token invalid → logout user
            logout();
          });
      }
    } catch (err) {
      console.error("Error loading auth from storage", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------
  // Persist login/signup session
  // -----------------------------
  const persistSession = (userObj, tokenStr) => {
    setUser(userObj);
    setToken(tokenStr);
    localStorage.setItem(USER_KEY, JSON.stringify(userObj));
    localStorage.setItem(TOKEN_KEY, tokenStr);

    // Check if onboarding is needed
    const onboardingCompleted = localStorage.getItem(ONBOARDING_KEY) === 'true';

    /*
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
    */
  };

  // -----------------------------
  // Complete Onboarding
  // -----------------------------
  const completeOnboarding = (userType) => {
    // Update local storage
    localStorage.setItem(ONBOARDING_KEY, 'true');

    // Update user object with userType
    const updatedUser = {
      ...user,
      userType: userType
    };

    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

    // Hide the onboarding modal
    setShowOnboarding(false);

    return userType;
  };

  // -----------------------------
  // Skip Onboarding (close button)
  // -----------------------------
  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  // -----------------------------
  // LOGIN
  // -----------------------------
  const login = async (email, password) => {
    const data = await loginApi(email, password); // { token, user }
    persistSession(data.user, data.token);
    return data.user;
  };

  // -----------------------------
  // SIGNUP STEP 1: Request OTP
  // -----------------------------
  const signupStart = async (formData) => {
    return await requestOtpApi(formData); // { message, email, expiresIn }
  };

  // -----------------------------
  // SIGNUP STEP 2: Verify OTP + Create Account
  // -----------------------------
  const signupVerify = async (email, otp) => {
    const data = await verifyOtpApi(email, otp); // { user, token }
    persistSession(data.user, data.token);
    return data.user;
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = () => {
    setUser(null);
    setToken(null);
    setShowOnboarding(false);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    // Note: We keep ONBOARDING_KEY so it persists across sessions
  };

  // -----------------------------
  // REFRESH USER (optional)
  // -----------------------------
  const refreshUser = async () => {
    if (!token) return; // Guard against unauthenticated refresh
    try {
      const data = await getMeApi();
      if (data?.user) {
        // Ensure the onboardingCompleted field is clearly defined
        const updatedUser = {
          ...data.user,
          onboardingCompleted: data.user.onboardingCompleted ?? (data.user.role === 'admin')
        };
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Failed to refresh user", err);
    }
  };

  const value = {
    user,
    token,
    loading,
    showOnboarding,
    isAuthenticated: !!user,
    isVerifiedStudent: !!user?.isVerifiedStudent,
    login,
    signupStart,
    signupVerify,
    logout,
    refreshUser,
    completeOnboarding,
    skipOnboarding,
    setShowOnboarding
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);