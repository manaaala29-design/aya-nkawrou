import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { PlayerLevel, PlayerPosition } from "@/types";
import { AlertCircle, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

export type ProfileFormValues = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  photoUrl: string;
  city: string;
  position: PlayerPosition;
  level: PlayerLevel;
};

export const EMPTY_PROFILE_FORM: ProfileFormValues = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  photoUrl: "",
  city: "",
  position: PlayerPosition.midfielder,
  level: PlayerLevel.beginner,
};

const POSITIONS: PlayerPosition[] = [
  PlayerPosition.goalkeeper,
  PlayerPosition.defender,
  PlayerPosition.midfielder,
  PlayerPosition.winger,
  PlayerPosition.striker,
];

const LEVELS: PlayerLevel[] = [
  PlayerLevel.beginner,
  PlayerLevel.intermediate,
  PlayerLevel.good,
  PlayerLevel.professional,
];

type FieldErrors = Partial<Record<keyof ProfileFormValues, string>>;

function validate(values: ProfileFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.firstName.trim()) errors.firstName = "required";
  if (!values.lastName.trim()) errors.lastName = "required";
  if (!values.username.trim()) errors.username = "required";
  if (!values.email.trim()) errors.email = "required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "invalid";
  if (!values.phone.trim()) errors.phone = "required";
  if (!values.city.trim()) errors.city = "required";
  return errors;
}

export function ProfileForm({
  initialValues,
  submitLabel,
  pendingLabel,
  isPending,
  errorMessage,
  onSubmit,
  showPassword,
  password,
  onPasswordChange,
  passwordError,
  ocidPrefix = "profile",
}: {
  initialValues: ProfileFormValues;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  errorMessage?: string | null;
  onSubmit: (values: ProfileFormValues) => void;
  showPassword?: boolean;
  password?: string;
  onPasswordChange?: (value: string) => void;
  passwordError?: string | null;
  ocidPrefix?: string;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});

  const update = <K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    if (showPassword && !password?.trim()) nextErrors.username = undefined;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      city: values.city.trim(),
      photoUrl: values.photoUrl.trim(),
    });
  };

  const fieldError = (key: keyof ProfileFormValues) =>
    errors[key] ? (
      <p
        className="mt-1 text-xs font-medium text-destructive"
        data-ocid={`${ocidPrefix}.${key}_error`}
      >
        {errors[key] === "invalid"
          ? t("form.errorEmail")
          : t("form.errorRequired")}
      </p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
      data-ocid={`${ocidPrefix}.form`}
    >
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          data-ocid={`${ocidPrefix}.error_state`}
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${ocidPrefix}-firstName`}>
            {t("form.firstName")}
          </Label>
          <Input
            id={`${ocidPrefix}-firstName`}
            value={values.firstName}
            onChange={(event) => update("firstName", event.target.value)}
            autoComplete="given-name"
            aria-invalid={!!errors.firstName}
            className="mt-1.5"
            data-ocid={`${ocidPrefix}.first_name_input`}
          />
          {fieldError("firstName")}
        </div>
        <div>
          <Label htmlFor={`${ocidPrefix}-lastName`}>{t("form.lastName")}</Label>
          <Input
            id={`${ocidPrefix}-lastName`}
            value={values.lastName}
            onChange={(event) => update("lastName", event.target.value)}
            autoComplete="family-name"
            aria-invalid={!!errors.lastName}
            className="mt-1.5"
            data-ocid={`${ocidPrefix}.last_name_input`}
          />
          {fieldError("lastName")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${ocidPrefix}-username`}>{t("form.username")}</Label>
          <Input
            id={`${ocidPrefix}-username`}
            value={values.username}
            onChange={(event) => update("username", event.target.value)}
            autoComplete="username"
            aria-invalid={!!errors.username}
            className="mt-1.5"
            data-ocid={`${ocidPrefix}.username_input`}
          />
          {fieldError("username")}
        </div>
        <div>
          <Label htmlFor={`${ocidPrefix}-city`}>{t("label.city")}</Label>
          <Input
            id={`${ocidPrefix}-city`}
            value={values.city}
            onChange={(event) => update("city", event.target.value)}
            autoComplete="address-level2"
            aria-invalid={!!errors.city}
            className="mt-1.5"
            data-ocid={`${ocidPrefix}.city_input`}
          />
          {fieldError("city")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${ocidPrefix}-email`}>{t("form.email")}</Label>
          <Input
            id={`${ocidPrefix}-email`}
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="mt-1.5"
            data-ocid={`${ocidPrefix}.email_input`}
          />
          {fieldError("email")}
        </div>
        <div>
          <Label htmlFor={`${ocidPrefix}-phone`}>{t("form.phone")}</Label>
          <Input
            id={`${ocidPrefix}-phone`}
            type="tel"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            className="mt-1.5"
            data-ocid={`${ocidPrefix}.phone_input`}
          />
          {fieldError("phone")}
        </div>
      </div>

      <div>
        <Label htmlFor={`${ocidPrefix}-photoUrl`}>{t("form.photoUrl")}</Label>
        <Input
          id={`${ocidPrefix}-photoUrl`}
          type="url"
          value={values.photoUrl}
          onChange={(event) => update("photoUrl", event.target.value)}
          placeholder="https://..."
          className="mt-1.5"
          data-ocid={`${ocidPrefix}.photo_url_input`}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {t("form.photoUrlHint")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${ocidPrefix}-position`}>
            {t("label.position")}
          </Label>
          <Select
            value={values.position}
            onValueChange={(value) =>
              update("position", value as PlayerPosition)
            }
          >
            <SelectTrigger
              id={`${ocidPrefix}-position`}
              className="mt-1.5 w-full"
              data-ocid={`${ocidPrefix}.position_select`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POSITIONS.map((position) => (
                <SelectItem key={position} value={position}>
                  {t(`position.${position}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`${ocidPrefix}-level`}>{t("label.level")}</Label>
          <Select
            value={values.level}
            onValueChange={(value) => update("level", value as PlayerLevel)}
          >
            <SelectTrigger
              id={`${ocidPrefix}-level`}
              className="mt-1.5 w-full"
              data-ocid={`${ocidPrefix}.level_select`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {t(`level.${level}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showPassword ? (
        <div>
          <Label htmlFor={`${ocidPrefix}-password`}>{t("form.password")}</Label>
          <Input
            id={`${ocidPrefix}-password`}
            type="password"
            value={password ?? ""}
            onChange={(event) => onPasswordChange?.(event.target.value)}
            autoComplete="new-password"
            aria-invalid={!!passwordError}
            className="mt-1.5"
            data-ocid={`${ocidPrefix}.password_input`}
          />
          {passwordError ? (
            <p
              className="mt-1 text-xs font-medium text-destructive"
              data-ocid={`${ocidPrefix}.password_error`}
            >
              {passwordError}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("form.passwordHint")}
            </p>
          )}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className={cn("w-full rounded-full sm:w-auto")}
        data-ocid={`${ocidPrefix}.submit_button`}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {pendingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
