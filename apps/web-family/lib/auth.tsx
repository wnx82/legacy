'use client';

import Keycloak from 'keycloak-js';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextValue {
  initialized: boolean;
  authenticated: boolean;
  token?: string;
  fullName?: string;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let keycloakInstance: Keycloak | null = null;

function getKeycloak() {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8080',
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? 'legacy',
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'legacy-web-family',
    });
  }
  return keycloakInstance;
}

/**
 * Comme le portail professionnel, l'espace famille exige une session valide
 * sur toute page — un proche y accède via un lien d'invitation qui le fait
 * d'abord passer par la création de compte Keycloak (ou la connexion si le
 * compte existe déjà).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<AuthContextValue, 'logout'>>({ initialized: false, authenticated: false });

  useEffect(() => {
    const keycloak = getKeycloak();
    keycloak.init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false }).then((authenticated) => {
      setState({ initialized: true, authenticated, token: keycloak.token, fullName: keycloak.tokenParsed?.name });
    });

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).then(() => setState((s) => ({ ...s, token: keycloak.token })));
    };
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, logout: () => getKeycloak().logout({ redirectUri: window.location.origin }) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  return ctx;
}
