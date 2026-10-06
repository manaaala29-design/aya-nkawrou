# Project Guidance

## User Preferences

- Langue par défaut: Français, avec bascule vers Arabe et Anglais
- Palette: vert sport, blanc, noir/gris foncé, accents dorés ou bleus
- Design moderne, sportif, jeune, avec cartes, icônes, images et animations légères
- 100% responsive: navigation basse sur mobile, barre latérale sur ordinateur
- Paiement en mode sandbox, sans stockage des données de carte
- Crédits footer: « Developed by Ala Manaa — Student »

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend auth is two-step: Internet Identity supplies the principal, then actor.register(input) creates the account and actor.login(password) verifies it; useAuth().login is II login, so backend login is a separate mutation.
- AuthResult is a variant {__kind__: 'ok'|'err'}; read result.__kind__ === 'err' ? result.err : null rather than truthiness.
- Backend photoUrl is ?Text, so profile photos are URL strings; do not wire object-storage ExternalBlob upload for this contract.
- Concurrent page tasks can overwrite shared files like App.tsx and i18n/translations.ts; re-read them before finalizing and reconcile rather than assuming an earlier edit survived.
- TranslationKey is keyof typeof translations.fr, so every new key must be added to the fr block first or t() calls fail typecheck.
- TanStack Router validateSearch must declare an explicit return type with optional keys, and every Link/navigate to a route with validateSearch must pass search.
- Match/team/field/booking IDs are bigints, so use id.toString() for React keys and BigInt() when parsing route params.
- Backend listFields takes a FieldFilter object; pass {} for no filter.
- The design wave's non-standard tokens (--info, --primary-soft, --status-*, --gradient-*) are raw OKLCH vars not mapped in tailwind.config.js, so consume them via bg-[oklch(var(--x))] or the provided @layer utilities (bg-gradient-primary, pitch-lines, safe-bottom).
- This project uses Enhanced Migration with check-limit=1: fold changes into the single pending migration and never add a second pending migration file.
