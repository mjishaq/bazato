ALTER TABLE "User" RENAME COLUMN "keycloakSubject" TO "authSubject";

ALTER INDEX "User_keycloakSubject_key" RENAME TO "User_authSubject_key";
