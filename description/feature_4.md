# Feature 4: Use the `useAuth` Hook

## Description

- The `AuthContext` provider has been updated.
- Replace all direct usages of `AuthContext` with the new `useAuth` hook throughout the application.
- Ensure all authentication-related functionality continues to work as expected after the refactor.
- Remove any unused `AuthContext` imports where applicable.

```jsx
import React, { createContext, useContext, useEffect, useState, FC } from "react";
import { StorageService } from "../Storage/Storage.service";

interface AuthContextType {
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

interface Props {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider: FC<Props> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(StorageService.retrieveToken());
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Consume via this instead of useContext(AuthContext) directly
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
```



