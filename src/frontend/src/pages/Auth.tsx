import {
  EMPTY_PROFILE_FORM,
  ProfileForm,
  type ProfileFormValues,
} from "@/components/ProfileForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { createActor } from "@/lib/backend";
import { cn } from "@/lib/utils";
import type { AuthResult, RegisterInput } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Loader2,
  LogIn,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { type FormEvent, useState } from "react";

type Mode = "register" | "login";

function resultError(result: AuthResult): string | null {
  return result.__kind__ === "err" ? result.err : null;
}

export function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);
  const { isAuthenticated, isInitializing, login, account } = useAuth();

  const [mode, setMode] = useState<Mode>("register");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async (input: RegisterInput) => {
      if (!actor) throw new Error(t("error.title"));
      return actor.register(input);
    },
    onSuccess: (result) => {
      const error = resultError(result);
      if (error) {
        setFormError(error);
        return;
      }
      setFormError(null);
      void queryClient.invalidateQueries({ queryKey: ["callerAccount"] });
      void navigate({ to: "/profile" });
    },
    onError: () => setFormError(t("error.hint")),
  });

  const loginMutation = useMutation({
    mutationFn: async (value: string) => {
      if (!actor) throw new Error(t("error.title"));
      return actor.login(value);
    },
    onSuccess: (result) => {
      const error = resultError(result);
      if (error) {
        setPasswordError(error);
        return;
      }
      setPasswordError(null);
      void queryClient.invalidateQueries({ queryKey: ["callerAccount"] });
      void navigate({ to: "/profile" });
    },
    onError: () => setPasswordError(t("error.hint")),
  });

  const handleRegister = (values: ProfileFormValues) => {
    if (!password.trim()) {
      setPasswordError(t("form.errorRequired"));
      return;
    }
    setPasswordError(null);
    setFormError(null);
    registerMutation.mutate({
      firstName: values.firstName,
      lastName: values.lastName,
      username: values.username,
      email: values.email,
      phone: values.phone,
      photoUrl: values.photoUrl || undefined,
      city: values.city,
      position: values.position,
      level: values.level,
      password,
    });
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setPasswordError(t("form.errorRequired"));
      return;
    }
    setPasswordError(null);
    loginMutation.mutate(password);
  };

  const isPending = registerMutation.isPending || loginMutation.isPending;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6" data-ocid="auth.page">
      <div className="mb-6 text-center">
        <span
          className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-primary text-3xl shadow-glow-primary"
          aria-hidden="true"
        >
          ⚽
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("auth.title")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t("auth.subtitle")}
        </p>
      </div>

      {!isAuthenticated ? (
        <Card
          className="items-center gap-4 rounded-2xl border-border p-8 text-center shadow-subtle"
          data-ocid="auth.identity_panel"
        >
          <span
            className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary"
            aria-hidden="true"
          >
            <ShieldCheck className="size-6" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold">
              {t("auth.connectTitle")}
            </h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              {t("auth.connectHint")}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => login()}
            disabled={isInitializing}
            className="rounded-full"
            data-ocid="auth.identity_login_button"
          >
            {isInitializing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogIn className="size-4" aria-hidden="true" />
            )}
            {t("auth.connectButton")}
          </Button>
        </Card>
      ) : account ? (
        <Card
          className="items-center gap-3 rounded-2xl border-border p-8 text-center shadow-subtle"
          data-ocid="auth.already_signed_in"
        >
          <p className="font-display text-lg font-bold">
            {t("auth.alreadyTitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("auth.alreadyHint")}
          </p>
          <Button asChild className="rounded-full">
            <Link to="/profile" data-ocid="auth.go_profile_button">
              {t("nav.profile")}
            </Link>
          </Button>
        </Card>
      ) : (
        <Card className="rounded-2xl border-border p-5 shadow-subtle sm:p-7">
          <div
            className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-muted p-1"
            data-ocid="auth.mode_tabs"
          >
            {(
              [
                { id: "register", label: t("auth.registerTab") },
                { id: "login", label: t("auth.loginTab") },
              ] as { id: Mode; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMode(tab.id);
                  setFormError(null);
                  setPasswordError(null);
                }}
                aria-pressed={mode === tab.id}
                data-ocid={`auth.${tab.id}_tab`}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-smooth",
                  mode === tab.id
                    ? "bg-card text-foreground shadow-subtle"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mode === "register" ? (
            <ProfileForm
              initialValues={EMPTY_PROFILE_FORM}
              submitLabel={t("auth.registerButton")}
              pendingLabel={t("auth.registering")}
              isPending={isPending}
              errorMessage={formError}
              onSubmit={handleRegister}
              showPassword
              password={password}
              onPasswordChange={(value) => {
                setPassword(value);
                setPasswordError(null);
              }}
              passwordError={passwordError}
              ocidPrefix="auth"
            />
          ) : (
            <form
              onSubmit={handleLogin}
              noValidate
              className="space-y-5"
              data-ocid="auth.login_form"
            >
              {passwordError ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                  data-ocid="auth.login_error_state"
                >
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{passwordError}</span>
                </div>
              ) : null}
              <div>
                <Label htmlFor="auth-login-password">
                  {t("form.password")}
                </Label>
                <Input
                  id="auth-login-password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setPasswordError(null);
                  }}
                  autoComplete="current-password"
                  className="mt-1.5"
                  data-ocid="auth.login_password_input"
                />
              </div>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full"
                data-ocid="auth.login_submit_button"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LogIn className="size-4" aria-hidden="true" />
                )}
                {isPending ? t("auth.loggingIn") : t("action.login")}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {t("auth.loginHint")}
              </p>
            </form>
          )}

          {mode === "register" ? (
            <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <UserPlus className="size-3.5" aria-hidden="true" />
              {t("auth.registerHint")}
            </p>
          ) : null}
        </Card>
      )}
    </div>
  );
}
