FROM quay.io/keycloak/keycloak:25.0

COPY bazzato-realm.json /opt/keycloak/data/import/bazzato-realm.json
COPY docker-entrypoint.sh /opt/keycloak/bin/bazzato-entrypoint.sh

USER root
RUN chmod +x /opt/keycloak/bin/bazzato-entrypoint.sh
USER keycloak

ENTRYPOINT ["/opt/keycloak/bin/bazzato-entrypoint.sh"]
