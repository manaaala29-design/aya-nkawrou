import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n";
import { renderWithProviders } from "@/test/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

function Probe() {
  const { language, dir, t } = useI18n();
  return (
    <div>
      <span data-ocid="lang">{language}</span>
      <span data-ocid="dir">{dir}</span>
      <span data-ocid="home-label">{t("nav.home")}</span>
      <LanguageSwitcher />
    </div>
  );
}

describe("language switcher", () => {
  it("defaults to French and marks FR active", () => {
    renderWithProviders(<Probe />);

    expect(screen.getByTestId("lang")).toHaveTextContent("fr");
    expect(screen.getByTestId("dir")).toHaveTextContent("ltr");
    expect(screen.getByTestId("home-label")).toHaveTextContent("Accueil");
    expect(screen.getByTestId("language.fr_button")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("switches to Arabic, applies RTL, and translates labels", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Probe />);

    await user.click(screen.getByTestId("language.ar_button"));

    await waitFor(() =>
      expect(screen.getByTestId("lang")).toHaveTextContent("ar"),
    );
    expect(screen.getByTestId("dir")).toHaveTextContent("rtl");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
    expect(screen.getByTestId("language.ar_button")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("switches to English and back to French", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Probe />);

    await user.click(screen.getByTestId("language.en_button"));
    await waitFor(() =>
      expect(screen.getByTestId("lang")).toHaveTextContent("en"),
    );
    expect(screen.getByTestId("home-label")).toHaveTextContent("Home");

    await user.click(screen.getByTestId("language.fr_button"));
    await waitFor(() =>
      expect(screen.getByTestId("lang")).toHaveTextContent("fr"),
    );
    expect(screen.getByTestId("home-label")).toHaveTextContent("Accueil");
  });

  it("restores the persisted language on mount", () => {
    window.localStorage.setItem("ayankawrou.language", "en");
    renderWithProviders(<Probe />);

    expect(screen.getByTestId("lang")).toHaveTextContent("en");
    expect(screen.getByTestId("home-label")).toHaveTextContent("Home");
  });
});
