import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n";
import { createActor } from "@/lib/backend";
import { formatPrice } from "@/lib/format";
import type { PaymentResult } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation } from "@tanstack/react-query";
import { CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";

type CardErrors = {
  name?: string;
  number?: string;
  expiry?: string;
  cvc?: string;
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value: string): string {
  return digitsOnly(value)
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function luhnValid(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length < 13) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function expiryValid(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length !== 4) return false;
  const month = Number(digits.slice(0, 2));
  const year = Number(digits.slice(2));
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

export function PaymentForm({
  bookingId,
  amountDt,
  onSuccess,
}: {
  bookingId: bigint;
  amountDt: number;
  onSuccess: (result: PaymentResult) => void;
}) {
  const { t, language } = useI18n();
  const { actor } = useActor(createActor);

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<CardErrors>({});

  const paymentMutation = useMutation<PaymentResult, Error, string>({
    mutationFn: async (reference: string) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.confirmBookingPayment(bookingId, reference);
    },
    onSuccess: (result) => {
      onSuccess(result);
    },
  });

  const validate = (): boolean => {
    const next: CardErrors = {};
    if (name.trim().length < 2) next.name = t("payment.invalidName");
    if (!luhnValid(number)) next.number = t("payment.invalidCard");
    if (!expiryValid(expiry)) next.expiry = t("payment.invalidExpiry");
    if (digitsOnly(cvc).length < 3) next.cvc = t("payment.invalidCvc");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    // Sandbox gateway: mint a deterministic reference, never persist card data.
    const reference = `SBX-${Date.now().toString(36).toUpperCase()}-${digitsOnly(
      number,
    ).slice(-4)}`;
    paymentMutation.mutate(reference);
  };

  const isPending = paymentMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
      data-ocid="payment.form"
    >
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/60 p-3">
        <div className="flex items-center gap-2.5">
          <span
            className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            <CreditCard className="size-4.5" />
          </span>
          <div>
            <p className="font-display text-sm font-bold">
              {t("payment.title")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("payment.sandboxBadge")}
            </p>
          </div>
        </div>
        <div className="text-end">
          <p className="text-xs text-muted-foreground">{t("payment.amount")}</p>
          <p className="font-display text-lg font-bold text-primary">
            {formatPrice(amountDt, language)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-name">{t("payment.cardName")}</Label>
        <Input
          id="card-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("payment.cardNamePlaceholder")}
          autoComplete="cc-name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "card-name-error" : undefined}
          className="h-11"
          data-ocid="payment.card_name_input"
        />
        {errors.name ? (
          <p
            id="card-name-error"
            className="text-xs font-medium text-destructive"
            data-ocid="payment.card_name_error"
          >
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-number">{t("payment.cardNumber")}</Label>
        <Input
          id="card-number"
          value={number}
          onChange={(event) => setNumber(formatCardNumber(event.target.value))}
          placeholder="4242 4242 4242 4242"
          inputMode="numeric"
          autoComplete="cc-number"
          aria-invalid={!!errors.number}
          aria-describedby={errors.number ? "card-number-error" : undefined}
          className="h-11 font-mono tracking-wider"
          data-ocid="payment.card_number_input"
        />
        {errors.number ? (
          <p
            id="card-number-error"
            className="text-xs font-medium text-destructive"
            data-ocid="payment.card_number_error"
          >
            {errors.number}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="card-expiry">{t("payment.expiry")}</Label>
          <Input
            id="card-expiry"
            value={expiry}
            onChange={(event) => setExpiry(formatExpiry(event.target.value))}
            placeholder="MM/AA"
            inputMode="numeric"
            autoComplete="cc-exp"
            aria-invalid={!!errors.expiry}
            aria-describedby={errors.expiry ? "card-expiry-error" : undefined}
            className="h-11 font-mono"
            data-ocid="payment.card_expiry_input"
          />
          {errors.expiry ? (
            <p
              id="card-expiry-error"
              className="text-xs font-medium text-destructive"
              data-ocid="payment.card_expiry_error"
            >
              {errors.expiry}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-cvc">{t("payment.cvc")}</Label>
          <Input
            id="card-cvc"
            value={cvc}
            onChange={(event) =>
              setCvc(digitsOnly(event.target.value).slice(0, 4))
            }
            placeholder="123"
            inputMode="numeric"
            autoComplete="cc-csc"
            aria-invalid={!!errors.cvc}
            aria-describedby={errors.cvc ? "card-cvc-error" : undefined}
            className="h-11 font-mono"
            data-ocid="payment.card_cvc_input"
          />
          {errors.cvc ? (
            <p
              id="card-cvc-error"
              className="text-xs font-medium text-destructive"
              data-ocid="payment.card_cvc_error"
            >
              {errors.cvc}
            </p>
          ) : null}
        </div>
      </div>

      {paymentMutation.isError ? (
        <p
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          data-ocid="payment.error_state"
        >
          {t("payment.error")}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-full text-base font-semibold shadow-glow-primary"
        data-ocid="payment.submit_button"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("payment.processing")}
          </>
        ) : (
          <>
            <Lock className="size-4" aria-hidden="true" />
            {t("payment.pay")} · {formatPrice(amountDt, language)}
          </>
        )}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        {t("payment.sandboxNote")}
      </p>
    </form>
  );
}
