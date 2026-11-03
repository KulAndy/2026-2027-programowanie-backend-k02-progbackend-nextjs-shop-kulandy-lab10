## Lab 08 — PostgreSQL i Prisma ORM

### Cel laboratorium

Rozbudowa sklepu z Lab 07 o relacyjną bazę danych PostgreSQL oraz Prisma ORM. Celem jest przechowywanie produktów w bazie danych i wykonywanie operacji odczytu za pośrednictwem Prisma zamiast wcześniejszego repozytorium danych.

### Środowisko

- Node.js 24 LTS
- Next.js 16.3.x
- TypeScript
- App Router
- PostgreSQL 17
- Prisma ORM
- npm
- ESLint
- Docker Compose

### Baza danych

Projekt wykorzystuje dwie instancje PostgreSQL:

| Usługa          | Baza danych | Port hosta | Przeznaczenie         |
| --------------- | ----------- | ---------- | --------------------- |
| `postgres`      | `shop`      | `5432`     | Główna baza aplikacji |
| `postgres-test` | `shop_test` | `5433`     | Baza do testów        |

Dane głównej bazy są przechowywane w wolumenie Docker `shopdata`. Baza testowa nie ma skonfigurowanego trwałego wolumenu.

### Uruchomienie PostgreSQL

Uruchom kontenery:

```bash
docker compose up -d
```

Sprawdź ich stan:

```bash
docker compose ps
```

Wyświetl logi:

```bash
docker compose logs -f postgres postgres-test
```

Aby całkowicie usunąć kontenery i dane zapisane w wolumenach Compose, a następnie uruchomić środowisko od nowa:

```bash
docker compose down -v --remove-orphans
docker compose up -d
```

**Uwaga:** `docker compose down -v` usuwa wolumen `shopdata`, a wraz z nim dane głównej bazy.

### Konfiguracja połączenia

Połączenie Prisma z PostgreSQL powinno być skonfigurowane za pomocą zmiennych środowiskowych. Przykładowa konfiguracja lokalna:

```env
DATABASE_URL="postgresql://shop:shoppass@localhost:5432/shop"
```

Dla testów można użyć osobnego adresu:

```env
TEST_DATABASE_URL="postgresql://shop:shoppass@localhost:5433/shop_test"
```

Nazwy zmiennych muszą odpowiadać konfiguracji Prisma i skryptom testowym w projekcie. Plików zawierających rzeczywiste hasła nie należy commitować do repozytorium.

### Prisma ORM

Prisma odpowiada za mapowanie modeli na tabele PostgreSQL oraz wykonywanie zapytań do bazy danych.

Typowy cykl pracy obejmuje:

1. Definicję modeli w schemacie Prisma.
2. Konfigurację połączenia z PostgreSQL.
3. Utworzenie i zastosowanie migracji.
4. Wygenerowanie klienta Prisma.
5. Wykorzystanie klienta w warstwie repozytorium.
6. Weryfikację działania aplikacji i testów.

Przykładowe polecenia — dostosuj je do wersji Prisma i skryptów zdefiniowanych w `package.json`:

```bash
npx prisma migrate dev
npx prisma generate
```

### Integracja z aplikacją

Odczyt produktów powinien odbywać się przez warstwę repozytorium korzystającą z Prisma. Strony App Router mogą nadal pozostać komponentami serwerowymi.

Należy zachować założenia z Lab 07:

- filtrowanie i sortowanie katalogu na podstawie parametrów URL;
- walidację identyfikatorów przed odczytem produktu;
- rozróżnienie braku produktu od nieoczekiwanego błędu bazy;
- zachowanie działania tras dynamicznych i obsługi `notFound()`;
- brak mutowania danych wejściowych w logice interpretacji parametrów.

### Testy i weryfikacja

Po skonfigurowaniu bazy danych należy zweryfikować:

- poprawność połączenia Prisma z PostgreSQL;
- zastosowanie migracji;
- odczyt produktów;
- filtrowanie i sortowanie;
- obsługę nieistniejących identyfikatorów;
- obsługę błędów połączenia z bazą;
- izolację danych testowych od głównej bazy;
- poprawność lintowania, kontroli TypeScript i kompilacji produkcyjnej.

## Deployment (Vercel)

### Production domain

- Stable domain: https://2026-2027-programowanie-backend-k02.vercel.app
- SHA wdrożonego commita: <UZUPEŁNIJ po deployu>
- Data wdrożenia: <UZUPEŁNIJ>

### Zmienne środowiskowe (Production, Vercel → Settings → Environment Variables)

| Variable               | Wartość                                                  |
| ---------------------- | -------------------------------------------------------- |
| `DATABASE_URL`         | Prisma Postgres (pooled), `sslmode=verify-full`          |
| `BETTER_AUTH_URL`      | `https://2026-2027-programowanie-backend-k02.vercel.app` |
| `BETTER_AUTH_SECRET`   | losowy, ≥32 znaki, inny niż lokalny                      |
| `GITHUB_CLIENT_ID`     | z **produkcyjnej** OAuth App                             |
| `GITHUB_CLIENT_SECRET` | z **produkcyjnej** OAuth App                             |

Żadna zmienna nie ma prefiksu `NEXT_PUBLIC_`.

### OAuth GitHub (Production)

- Homepage URL: `https://2026-2027-programowanie-backend-k02.vercel.app`
- Authorization callback URL: `https://2026-2027-programowanie-backend-k02.vercel.app/api/auth/callback/github`

### Kolejność wdrożenia

1. Testy: `npm ci && npx --no-install prisma generate && npm run lint && npm run test && npm run build`
2. Migracje: `npx --no-install prisma migrate deploy` (na bazie zdalnej, raz)
3. Seed: `npx --no-install prisma db seed` (raz, po migracjach)
4. Publikacja: merge PR `lab10 → main` → Vercel automatycznie buduje Production
5. Odbiór: scenariusze z Tabeli 7.1 (PDF Lab 10)

### Rollback

- Vercel → Deployments → poprzedni działający deploy → Promote to Production.
- Uwaga: rollback kodu nie cofa migracji. Sprawdź zgodność kodu ze schematem.

### Ograniczenia

- Preview Deployments wyłączone (Better Auth + cookies wymagają stable domain).
- Baza Prisma Postgres — darmowy plan ma limity połączeń; runtime używa pooled URL.
