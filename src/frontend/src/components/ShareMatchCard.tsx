import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n";
import { formatDate } from "@/lib/format";
import type { ShareCard } from "@/types";
import { Check, Copy, MapPin, Share2 } from "lucide-react";
import { useState } from "react";
import {
  SiFacebook,
  SiInstagram,
  SiMessenger,
  SiWhatsapp,
} from "react-icons/si";

export function ShareMatchCard({ card }: { card: ShareCard }) {
  const { t, language } = useI18n();
  const [copied, setCopied] = useState(false);

  const shareText = `${card.homeTeamName} vs ${card.awayTeamName} — ${formatDate(
    card.date,
    language,
  )} ${card.time} · ${card.fieldName}, ${card.location}`;

  const encodedUrl = encodeURIComponent(card.shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const channels = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      icon: SiWhatsapp,
      className: "bg-[#25D366] text-white hover:opacity-90",
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: SiFacebook,
      className: "bg-[#1877F2] text-white hover:opacity-90",
    },
    {
      key: "messenger",
      label: "Messenger",
      href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=0&redirect_uri=${encodedUrl}`,
      icon: SiMessenger,
      className: "bg-[#0084FF] text-white hover:opacity-90",
    },
    {
      key: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/",
      icon: SiInstagram,
      className:
        "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:opacity-90",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(card.shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card
      className="gap-0 overflow-hidden rounded-2xl border-border p-0 shadow-elevated"
      data-ocid="share.card"
    >
      <div className="relative bg-gradient-primary p-5 text-primary-foreground">
        <div
          className="pitch-lines absolute inset-0 opacity-30"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
            {t("share.title")}
          </p>
          <p className="mt-2 font-display text-xl font-bold leading-tight">
            {card.homeTeamName}
            <span className="mx-2 opacity-80">vs</span>
            {card.awayTeamName}
          </p>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">{t("label.date")}</p>
            <p className="font-medium">{formatDate(card.date, language)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("label.time")}</p>
            <p className="font-medium">{card.time}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("label.field")}</p>
          <p className="flex items-center gap-1.5 font-medium">
            <MapPin
              className="size-3.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            {card.fieldName} · {card.location}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {card.shareUrl}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCopy}
            data-ocid="share.copy_button"
          >
            {copied ? (
              <Check className="size-3.5 text-primary" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            {copied ? t("share.copied") : t("share.copy")}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <a
                key={channel.key}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-smooth ${channel.className}`}
                data-ocid={`share.${channel.key}_link`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {channel.label}
              </a>
            );
          })}
        </div>

        <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground">
          <Share2 className="size-3.5" aria-hidden="true" />
          {t("share.hint")}
        </p>
      </div>
    </Card>
  );
}
