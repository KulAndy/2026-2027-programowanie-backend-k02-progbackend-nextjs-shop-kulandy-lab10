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
