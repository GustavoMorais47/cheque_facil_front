import { useContext } from "react";
import AppRoutes from "../../routes/app.routes";
import PublicoRoutes from "../../routes/publico.routes";
import { AuthContext } from "../../contexts/auth";
import DadosProvider from "../../contexts/dados";

export default function Auth() {
  const { token, usuario } = useContext(AuthContext);

  return !token || !usuario ? <PublicoRoutes /> : <DadosProvider><AppRoutes /></DadosProvider>;
}
