/// Static behavioral documentation for the AYA NKAWROU? backend.
/// This mixin declares no state and reads no runtime data: `getApiDoc`
/// returns a fixed Markdown document authored from the current source.
mixin () {
  public query func getApiDoc() : async Text {
    "# AYA NKAWROU? — API Backend\n\n" #
    "## Objectif\n\n" #
    "Backend Motoko de la plateforme de football AYA NKAWROU? (Mahdia, Tunisie). " #
    "Il gère les comptes joueurs, les terrains, les réservations, les équipes, " #
    "les matchs, la disponibilité des joueurs et une vue d'administration. " #
    "Les données persistées sont également interrogeables via OQL " #
    "(`schema()` / `execute()`).\n\n" #
    "## Authentification et identité\n\n" #
    "L'identité est fournie par Internet Identity : chaque appelant est identifié " #
    "par son principal. Les méthodes marquées « connecté » exigent un appelant " #
    "non anonyme ; un appelant anonyme reçoit une erreur ou un trap (voir chaque " #
    "méthode). Le frontend épingle une origine de dérivation Internet Identity, " #
    "publiée sur `/.well-known/ii-derivation-origin` lorsqu'elle est disponible. " #
    "Un agent qui détient déjà l'autorisation Internet Identity de l'utilisateur " #
    "dérive le principal correct pour cette application contre cette origine " #
    "(par exemple `icp identity link web <name> --app <host>`). Une telle " #
    "délégation agit avec l'autorité complète de l'utilisateur dans cette " #
    "application jusqu'à son expiration.\n\n" #
    "### Prérequis d'enregistrement\n\n" #
    "L'enregistrement se fait via `register`, appelé par un appelant connecté " #
    "(non anonyme). Un appelant qui ne s'est jamais enregistré via le frontend " #
    "de l'application est non enregistré, même s'il appartient au propriétaire " #
    "de l'application ; un appelant dérivé contre une autre origine est un " #
    "principal différent de celui enregistré par le frontend. Les méthodes " #
    "d'administration (`getAdminOverview`, `listAccounts`, `setAccountBanned`, " #
    "`setFieldAvailability`, `listAllBookings`) vérifient le rôle admin sans " #
    "trap pour un appelant non enregistré : elles renvoient une valeur vide ou " #
    "`false`, sauf `getAdminOverview` qui trap avec " #
    "« Accès réservé aux administrateurs ».\n\n" #
    "## Autorisation\n\n" #
    "- Anonyme : peut lire les terrains, les équipes, les matchs et les profils " #
    "publics. Ne peut pas créer de compte, réserver, créer une équipe ou un match.\n" #
    "- Connecté (non anonyme) : peut s'enregistrer, se connecter, réserver, " #
    "créer des équipes et des matchs, gérer sa disponibilité.\n" #
    "- Capitaine : peut ajouter/retirer des joueurs et changer le capitaine de " #
    "son équipe, et créer un match pour son équipe.\n" #
    "- Admin : accès aux vues d'administration et à la gestion des comptes et " #
    "des terrains.\n\n" #
    "## Unités et encodage\n\n" #
    "- `Timestamp` : `Int`, nanosecondes depuis l'époque Unix (`Time.now()`).\n" #
    "- `UserId` : `Principal` (identité Internet Identity).\n" #
    "- `FieldId`, `BookingId`, `TeamId`, `MatchId` : `Nat`.\n" #
    "- `priceDt`, `pricePerPlayerDt`, `totalRevenueDt`, `amountDt` : `Float`, " #
    "dinars tunisiens (DT).\n" #
    "- `distanceKm` : `Float`, kilomètres.\n" #
    "- `rating` : `Float`.\n" #
    "- `date` : `Text` (format libre, ex. `2026-10-06`).\n" #
    "- `time` : `Text` (format `HH:MM`, ex. `20:00`).\n" #
    "- `durationMinutes` : `Nat`, minutes.\n" #
    "- `PlayerPosition` : `#goalkeeper | #defender | #midfielder | #winger | #striker`.\n" #
    "- `PlayerLevel` : `#beginner | #intermediate | #good | #professional`.\n" #
    "- `UserRole` : `#user | #captain | #referee | #volunteer | #admin`.\n" #
    "- `BookingStatus` : `#pending | #paid | #cancelled`.\n" #
    "- `MatchStatus` : `#scheduled | #completed | #cancelled`.\n" #
    "- Les champs optionnels (`?Text`) sont encodés en Candid `opt` ; " #
    "`null` signifie absent.\n\n" #
    "## Cycle de vie et polling\n\n" #
    "Les lectures (`listFields`, `getField`, `listTeams`, `getTeam`, " #
    "`listMatches`, `getMatch`, `getMatchShareCard`, `getCallerAccount`, " #
    "`getAccount`, `getPlayerProfile`, `listMyBookings`, `getBooking`, " #
    "`searchPlayers`, `getApiDoc`) sont des `query` : elles ne modifient aucun " #
    "état et peuvent être appelées en polling sans effet de bord. Les écritures " #
    "(`register`, `login`, `updateProfile`, `createBooking`, " #
    "`confirmBookingPayment`, `cancelBooking`, `createTeam`, `addTeamPlayer`, " #
    "`removeTeamPlayer`, `setTeamCaptain`, `setMyAvailability`, `createMatch`, " #
    "`inviteMatchPlayers`, `setFieldAvailability`, `setAccountBanned`) sont des " #
    "appels de mise à jour.\n\n" #
    "Une réservation créée est en statut `#pending` ; elle passe à `#paid` " #
    "après `confirmBookingPayment`, ou à `#cancelled` après `cancelBooking`. " #
    "Un match créé est `#scheduled`. Il n'existe pas de transition automatique " #
    "côté backend : le frontend doit re-interroger l'état.\n\n" #
    "## Sûreté de reprise des mutations\n\n" #
    "- `register` : non idempotent — un second appel pour le même principal " #
    "renvoie `#err(\"Un compte existe déjà pour cet utilisateur.\")`.\n" #
    "- `createBooking` : non idempotent — chaque appel crée une nouvelle " #
    "réservation avec un nouvel identifiant.\n" #
    "- `confirmBookingPayment` : idempotent — ré-appliquer la même référence " #
    "sur une réservation non annulée laisse le statut `#paid`.\n" #
    "- `cancelBooking` : idempotent — un second appel renvoie `false`.\n" #
    "- `createTeam` / `createMatch` : non idempotents — chaque appel crée une " #
    "nouvelle entité.\n" #
    "- `addTeamPlayer` / `removeTeamPlayer` / `setTeamCaptain` : renvoient " #
    "`false` si l'opération est invalide ou déjà appliquée.\n" #
    "- `setMyAvailability` : idempotent — remplace la disponibilité courante.\n" #
    "- `setFieldAvailability` / `setAccountBanned` : idempotents — fixent " #
    "l'état demandé.\n\n" #
    "## Méthodes publiques\n\n" #
    "### Comptes\n" #
    "- `register(input : RegisterInput) : AuthResult` — connecté requis. " #
    "Crée le compte du principal appelant. `#err` si anonyme, déjà enregistré, " #
    "nom d'utilisateur ou email déjà pris.\n" #
    "- `login(password : Text) : AuthResult` — connecté requis. Vérifie le mot " #
    "de passe du compte du principal appelant. `#err` si aucun compte, compte " #
    "banni ou mot de passe incorrect.\n" #
    "- `getCallerAccount() : ?AccountView` — query, retourne le compte de " #
    "l'appelant ou `null`.\n" #
    "- `getAccount(user : Principal) : ?AccountView` — query, public.\n" #
    "- `updateProfile(input : UpdateProfileInput) : AuthResult` — connecté " #
    "requis. Met à jour le profil ; `#err` si le nom d'utilisateur ou l'email " #
    "appartient à un autre compte.\n" #
    "- `getPlayerProfile(user : Principal) : ?PlayerProfile` — query, public. " #
    "Retourne le compte, les statistiques (par défaut à zéro), les identifiants " #
    "d'équipes et les succès.\n\n" #
    "### Terrains\n" #
    "- `listFields(filter : FieldFilter) : [FieldView]` — query, public. " #
    "Filtre par prix max, distance max, créneau horaire et note minimale ; " #
    "les champs `null` du filtre sont ignorés.\n" #
    "- `getField(id : Nat) : ?FieldView` — query, public.\n" #
    "- `setFieldAvailability(id : Nat, available : Bool) : Bool` — admin " #
    "requis ; renvoie `false` si non admin ou terrain inconnu.\n\n" #
    "### Réservations\n" #
    "- `createBooking(input : CreateBookingInput) : BookingView` — connecté " #
    "requis. Le prix est celui du terrain, ou 5.6 DT par défaut si le terrain " #
    "est inconnu. Statut initial `#pending`.\n" #
    "- `confirmBookingPayment(bookingId : Nat, paymentReference : Text) : " #
    "PaymentResult` — connecté requis, propriétaire uniquement. `#err` si " #
    "introuvable, non autorisé ou annulée. Aucune donnée de carte n'est " #
    "stockée : seule la référence de paiement est conservée.\n" #
    "- `listMyBookings() : [BookingView]` — query, réservations de l'appelant.\n" #
    "- `getBooking(bookingId : Nat) : ?BookingView` — query, propriétaire " #
    "uniquement (`null` sinon).\n" #
    "- `listAllBookings() : [BookingView]` — query, admin requis (liste vide " #
    "sinon).\n" #
    "- `cancelBooking(bookingId : Nat) : Bool` — connecté requis, propriétaire " #
    "uniquement ; `false` si introuvable, non autorisé ou déjà annulée.\n\n" #
    "### Équipes\n" #
    "- `createTeam(input : CreateTeamInput) : TeamView` — connecté requis " #
    "(trap « Authentification requise » si anonyme). Le créateur devient " #
    "capitaine et premier membre.\n" #
    "- `listTeams() : [TeamView]` — query, public.\n" #
    "- `getTeam(teamId : Nat) : ?TeamView` — query, public.\n" #
    "- `addTeamPlayer(teamId : Nat, player : Principal) : Bool` — connecté " #
    "requis, capitaine uniquement ; `false` si déjà membre ou non capitaine.\n" #
    "- `removeTeamPlayer(teamId : Nat, player : Principal) : Bool` — connecté " #
    "requis, capitaine uniquement ; impossible de retirer le capitaine.\n" #
    "- `setTeamCaptain(teamId : Nat, newCaptain : Principal) : Bool` — " #
    "connecté requis, capitaine actuel uniquement ; le nouveau capitaine doit " #
    "être membre.\n" #
    "- `searchPlayers(filter : PlayerSearchFilter) : [AvailablePlayer]` — " #
    "query, public. Filtre par poste, niveau, ville (sous-chaîne, insensible à " #
    "la casse), disponibilité du jour et créneau. La note retournée est " #
    "actuellement `0.0`.\n" #
    "- `setMyAvailability(input : AvailabilityInput) : ()` — connecté requis.\n\n" #
    "### Matchs\n" #
    "- `createMatch(input : CreateMatchInput) : MatchView` — connecté requis. " #
    "L'appelant doit être capitaine de l'équipe à domicile ; sinon un match " #
    "`#cancelled` avec `id = 0` est renvoyé sans être persisté.\n" #
    "- `listMatches() : [MatchView]` — query, public.\n" #
    "- `getMatch(matchId : Nat) : ?MatchView` — query, public.\n" #
    "- `inviteMatchPlayers(matchId : Nat, players : [Principal]) : Bool` — " #
    "connecté requis ; ajoute les joueurs à la liste d'invitations ; `false` " #
    "si le match est introuvable.\n" #
    "- `getMatchShareCard(matchId : Nat) : ?ShareCard` — query, public. " #
    "Retourne les noms d'équipes, le terrain, la date, l'heure, le lieu et " #
    "`shareUrl` (`/matches/<id>`).\n\n" #
    "### Administration\n" #
    "- `getAdminOverview() : AdminOverview` — query, admin requis (trap " #
    "« Accès réservé aux administrateurs »). Retourne les statistiques " #
    "globales, les revenus par mois et les réservations par statut.\n" #
    "- `listAccounts() : [AccountView]` — query, admin requis (liste vide " #
    "sinon).\n" #
    "- `setAccountBanned(user : Principal, banned : Bool) : Bool` — admin " #
    "requis ; `false` si non admin, compte inconnu ou compte admin.\n\n" #
    "### Documentation\n" #
    "- `getApiDoc() : Text` — query, public. Retourne ce document.\n\n" #
    "## Erreurs et pièges\n\n" #
    "- Les erreurs métier sont renvoyées via les variantes `AuthResult` " #
    "(`#ok` / `#err`) et `PaymentResult` (`#ok` / `#err`), jamais par trap, " #
    "sauf les contrôles d'authentification des équipes/matchs et le contrôle " #
    "admin de `getAdminOverview`.\n" #
    "- Les mots de passe ne sont jamais stockés en clair : seul un digest " #
    "déterministe non réversible est conservé.\n" #
    "- Aucune donnée de carte bancaire n'est stockée ; le paiement est en mode " #
    "sandbox et seule une référence de paiement est enregistrée.\n" #
    "- Les identifiants de réservation, d'équipe et de match sont attribués " #
    "séquentiellement et ne sont jamais réutilisés.\n" #
    "- `searchPlayers` avec `availableToday = true` exclut les joueurs sans " #
    "disponibilité enregistrée.\n" #
    "- Les listes ne sont pas paginées : elles retournent l'ensemble des " #
    "enregistrements correspondants.\n";
  };
};
