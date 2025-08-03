// contexts/UserAuthContext.jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      try {
        let result = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
          { credentials: "include" }
        );
        result = await result.json();
        if (result.success) {
          setUser(result.user);
        }
      } catch (error) {
        console.log("getting error while fetching Users Data.");
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, []);

  return (
    <UserAuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => useContext(UserAuthContext);
