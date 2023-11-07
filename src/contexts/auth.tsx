import React, { createContext, useState } from "react";
import { IUsuario } from "../types/interfaces";

type AuthContextType = {
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  usuario: IUsuario | null;
  setUsuario: React.Dispatch<React.SetStateAction<IUsuario | null>>;
};

export const AuthContext = createContext<AuthContextType>(null!);

export default function AuthProvider({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<IUsuario | null>(null);
  return (
    <AuthContext.Provider value={{ usuario, setUsuario, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
