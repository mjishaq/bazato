import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useMemo } from "react";

import { env } from "../config/env";
import type { AuthSession as AppAuthSession } from "./authGateway";

WebBrowser.maybeCompleteAuthSession();

function decodeJwtPayload(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return {};
  }

  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  const decoded =
    typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("utf8");

  return JSON.parse(decoded) as {
    phone_number?: string;
    preferred_username?: string;
    realm_access?: {
      roles?: string[];
    };
    sub?: string;
  };
}

export function useKeycloakAuth() {
  const discovery = useMemo<AuthSession.DiscoveryDocument>(
    () => ({
      authorizationEndpoint: `${env.keycloakIssuer}/protocol/openid-connect/auth`,
      tokenEndpoint: `${env.keycloakIssuer}/protocol/openid-connect/token`,
      revocationEndpoint: `${env.keycloakIssuer}/protocol/openid-connect/revoke`
    }),
    []
  );
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "bazzato"
  });
  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: env.keycloakClientId,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes: ["openid", "profile", "phone"],
      usePKCE: true
    },
    discovery
  );

  const signIn = async (): Promise<AppAuthSession> => {
    const result = await promptAsync();

    if (result.type !== "success" || !result.params.code || !request?.codeVerifier) {
      throw new Error("Keycloak sign-in was cancelled or incomplete");
    }

    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId: env.keycloakClientId,
        code: result.params.code,
        extraParams: {
          code_verifier: request.codeVerifier
        },
        redirectUri
      },
      discovery
    );
    const accessToken = tokenResponse.accessToken;
    const payload = decodeJwtPayload(accessToken);
    const phone = payload.phone_number ?? payload.preferred_username ?? "";

    return {
      phone,
      token: accessToken,
      user: {
        id: payload.sub ?? phone,
        phone,
        role: "customer"
      }
    };
  };

  return {
    isReady: Boolean(request),
    redirectUri,
    signIn
  };
}
