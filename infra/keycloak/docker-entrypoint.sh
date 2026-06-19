#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  rest="${DATABASE_URL#postgresql://}"
  userpass="${rest%%@*}"
  hostpart="${rest#*@}"
  KC_DB_USERNAME="${userpass%%:*}"
  KC_DB_PASSWORD="${userpass#*:}"
  hostport="${hostpart%%/*}"
  db="${hostpart#*/}"
  db="${db%%\?*}"

  export KC_DB=postgres
  export KC_DB_URL="jdbc:postgresql://${hostport}/${db}"
  export KC_DB_USERNAME
  export KC_DB_PASSWORD
fi

if [ -z "${KC_DB_URL:-}" ]; then
  echo "Keycloak requires DATABASE_URL or KC_DB_URL." >&2
  exit 1
fi

if [ -n "${RAILWAY_PUBLIC_DOMAIN:-}" ]; then
  export KC_HOSTNAME="${RAILWAY_PUBLIC_DOMAIN}"
fi

export KC_HTTP_ENABLED="${KC_HTTP_ENABLED:-true}"
export KC_PROXY="${KC_PROXY:-edge}"
export KC_PROXY_HEADERS="${KC_PROXY_HEADERS:-xforwarded}"
export KC_HOSTNAME_STRICT="${KC_HOSTNAME_STRICT:-false}"

if [ -n "${PORT:-}" ]; then
  export KC_HTTP_PORT="${PORT}"
fi

/opt/keycloak/bin/kc.sh build
exec /opt/keycloak/bin/kc.sh start --import-realm --optimized
