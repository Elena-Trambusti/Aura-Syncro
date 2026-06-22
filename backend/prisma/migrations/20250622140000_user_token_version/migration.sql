-- Invalida sessioni JWT dopo reset password o disattivazione account
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
