'use client';

import Keycloak from 'keycloak-js';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextValue {
  initialized: boolean;
  authenticated: boolean;
  token?: string;
  roles: string[];
  fullName?: string;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let keycloakInstance: Keycloak | null = null;

function getKeycloak() {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8080',
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? 'legacy',
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'legacy-web-pro',
    });
  }
  return keycloakInstance;
}

/**
 * Le portail professionnel exige une authentification sur toutes les pages
 * (`onLoad: 'login-required'`) : contrairement au site public, il n'y a pas
 * de contenu accessible sans compte. Keycloak gère le rafraîchissement de
 * session automatiquement (`onTokenExpired`).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<AuthContextValue, 'logout' | 'hasRole'>>({
    initialized: false,
    authenticated: false,
    roles: [],
  });

  useEffect(() => {
    const keycloak = getKeycloak();
    keycloak
      .init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false })
      .then((authenticated) => {
        setState({
          initialized: true,
          authenticated,
          token: keycloak.token,
          roles: keycloak.tokenParsed?.realm_access?.roles ?? [],
          fullName: keycloak.tokenParsed?.name,
        });
      });

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).then(() => {
        setState((s) => ({ ...s, token: keycloak.token }));
      });
    };
  }, []);

  const value: AuthContextValue = {
    ...state,
    logout: () => getKeycloak().logout({ redirectUri: window.location.origin }),
    hasRole: (...roles: string[]) => roles.some((r) => state.roles.includes(r)),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  return ctx;
}
