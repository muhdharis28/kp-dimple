import React, { useState } from 'react';

export const AuthContext = React.createContext();

export default AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn}}>
      {children}
    </AuthContext.Provider>
  );
};
