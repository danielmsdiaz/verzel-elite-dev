"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

import {
  assertSessionConfiguration,
  createSession,
  deleteSession,
} from "./session";

const DUMMY_PASSWORD_HASH =
  "$2b$12$tI3A.e5SVeXYAO.Zy3rUdeq4VVuigIhksFfYi1mCph5PCk3eHf0fq";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthActionState = {
  message?: string;
  fieldErrors?: Partial<
    Record<"name" | "email" | "password" | "passwordConfirmation", string>
  >;
};

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = normalizeEmail(readText(formData, "email"));
  const password = readText(formData, "password");
  const remember = formData.get("remember") === "on";
  const fieldErrors: AuthActionState["fieldErrors"] = {};

  if (!isValidEmail(email)) fieldErrors.email = "Informe um e-mail válido.";
  if (!password) {
    fieldErrors.password = "Informe sua senha.";
  } else if (new TextEncoder().encode(password).byteLength > 72) {
    fieldErrors.password = "A senha informada é muito longa.";
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    assertSessionConfiguration();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        passwordHash: true,
        role: true,
      },
    });
    const passwordMatches = await compare(
      password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordMatches) {
      return { message: "E-mail ou senha incorretos." };
    }

    await createSession(user, remember);
  } catch (error) {
    console.error("Login failed:", error);
    return {
      message: "Não foi possível entrar agora. Tente novamente em instantes.",
    };
  }

  redirect("/");
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = normalizeName(readText(formData, "name"));
  const email = normalizeEmail(readText(formData, "email"));
  const password = readText(formData, "password");
  const passwordConfirmation = readText(formData, "passwordConfirmation");
  const fieldErrors = validateSignup({
    name,
    email,
    password,
    passwordConfirmation,
  });

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    assertSessionConfiguration();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return { fieldErrors: { email: "Este e-mail já está cadastrado." } };
    }

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: UserRole.CUSTOMER,
      },
      select: {
        id: true,
        role: true,
      },
    });

    await createSession(user);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { fieldErrors: { email: "Este e-mail já está cadastrado." } };
    }

    console.error("Signup failed:", error);
    return {
      message: "Não foi possível criar sua conta. Tente novamente.",
    };
  }

  redirect("/");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}

function validateSignup({
  name,
  email,
  password,
  passwordConfirmation,
}: {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}) {
  const errors: NonNullable<AuthActionState["fieldErrors"]> = {};

  if (name.length < 2 || name.length > 80) {
    errors.name = "Use um nome entre 2 e 80 caracteres.";
  }
  if (!isValidEmail(email)) {
    errors.email = "Informe um e-mail válido.";
  }

  const passwordBytes = new TextEncoder().encode(password).byteLength;
  if (password.length < 8) {
    errors.password = "A senha deve ter pelo menos 8 caracteres.";
  } else if (passwordBytes > 72) {
    errors.password = "A senha deve ter no máximo 72 bytes.";
  }
  if (passwordConfirmation !== password) {
    errors.passwordConfirmation = "As senhas não coincidem.";
  }

  return errors;
}

function isValidEmail(email: string) {
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase().normalize("NFKC");
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").normalize("NFKC");
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
