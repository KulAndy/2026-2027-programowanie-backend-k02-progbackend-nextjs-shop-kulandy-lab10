# Next.js Labs of BackEnd Programming

## Lab 07 — Trasy dynamiczne i filtry w Next.js

Celem laboratorium jest rozwinięcie sklepu z Lab 06 o szczegóły produktu
oraz katalog z filtrami i sortowaniem zapisanymi w adresie URL.

Środowisko: Node.js 24 LTS, Next.js 16.3.x, TypeScript, App Router, npm, ESLint.

## Trasy

| Trasa                             | Opis                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `/product-list`                   | Katalog: filtry i sortowanie z parametrów zapytania (serwerowy odczyt danych) |
| `/product-list/[id]`              | Szczegóły produktu z walidacją identyfikatora                                 |
| `/product-list/image/[productId]` | Pełna strona obrazka (po odświeżeniu / bezpośrednim wejściu)                  |
| `/catalog`, `/catalog/[...slug]`  | Rozszerzenie: kategorie i produkt w ścieżce (Catch-all Segments)              |

### Kontrakt URL katalogu

| Parametr | Dozwolone wartości                 | Domyślnie |
| -------- | ---------------------------------- | --------- |
| `type`   | `all`, `cpu`, `gpu`, `ram`, `disk` | `all`     |
| `stock`  | `all`, `available`, `unavailable`  | `all`     |
| `sort`   | `name`, `newest`                   | `name`    |

Przykładowy adres: `/product-list?type=gpu&stock=available&sort=newest`

Wszystkie kryteria działają łącznie. Nieznaną, pustą albo powtórzoną wartość
rozpoznanego parametru zastępuje wartość domyślna, a strona pokazuje komunikat
o pominięciu błędnego ustawienia (pozostałe poprawne kryteria są zachowane).
Nieznane nazwy parametrów są ignorowane.

### Kontrakt identyfikatora produktu

Identyfikatory: od `1` do `2147483647`, zapisane cyframi dziesiętnymi, bez znaku
i zer wiodących (`/^[1-9][0-9]*$/` + `Number.isSafeInteger`). Niepoprawny format,
przekroczenie zakresu oraz nieznany poprawny ID prowadzą do `notFound()`.
Widok braku produktu zawiera link powrotu do katalogu.

### Sortowanie i remisy

- `name` — klucz nazwy rosnąco (porównanie UTF-8 z Lab 06); remisy: `id` rosnąco
- `newest` — data malejąco; remisy: `id` rosnąco

## Granica serwer–klient

- Odczyt danych i walidacja parametrów wykonują się na serwerze: strona katalogu
  i strona szczegółów to komponenty serwerowe korzystające z repozytorium.
- Klientem pozostają tylko: wyróżnienie aktywnej sekcji (`usePathname`),
  zamknięcie modala (`router.back()`).
- Stan katalogu przechowywany jest w URL, nie w `useState` — skopiowany adres,
  odświeżenie i bezpośrednie wejście odtwarzają ten sam widok.

## Rozszerzenia

1. **Trasy równoległe** — sloty `@products` i `@discounts` w layoucie
   `/product-list`; panel promocji renderuje się niezależnie od kategorii
   i produktu (pliki `default.tsx` dla niedopasowanych ścieżek).
   Slot `@folder` nie jest segmentem URL — nie wpływa na adres.
2. **Modal obrazu** — Intercepting Routes: kliknięcie obrazka otwiera modal
   (`@modal/(.)image/[productId]`), odświeżenie tego samego URL pokazuje pełną
   stronę (`image/[productId]`). Zamknięcie przez `router.back()`; pusty stan
   slotu po wyjściu zapewnia `@modal/default.tsx`.
3. **Catch-all w `/catalog`** — porównanie `[...slug]` z parametrami zapytania:
   kategoria i produkt są częścią ścieżki; sama liczba segmentów jest walidowana
   wraz ze zgodnością produktu z kategorią; dla samego `/catalog` widoczny
   jest wykaz kategorii.

## Odpowiedzi na pytania architektoniczne

- **Błędny format ID vs brak produktu vs awaria:** błędny format (`abc`, `12abc`,
  `0`, `01`) odrzuca walidacja przed dostępem do repozytorium → `notFound()`;
  poprawny, lecz nieistniejący ID zwraca `null` z repozytorium → `notFound()`;
  nieoczekiwana awaria repozytorium jest wyjątkiem i trafia do `error.tsx` —
  celowo nie zamieniamy jej na widok braku produktu.
- **Dlaczego `[id]` nie oznacza automatycznie renderowania przy żądaniu:**
  obecność parametru trasy i `await params` czyni stronę dynamiczną dopiero
  w połączeniu z odczytem danych przy renderze; bez `generateStaticParams`
  strona renderuje się przy żądaniu, ale o tym decyduje konfiguracja, nie sam
  folder.
- **Dlaczego walidujemy adres mimo kontrolek:** URL można edytować ręcznie,
  wkleić z zewnątrz lub wywołać bez interfejsu — formularz GET ogranicza tylko
  to, co użytkownik kliknie, nie to, co trafi do serwera.
- **Powtórzony klucz (`?type=gpu&type=cpu`):** `searchParams` przekazuje wtedy
  tablicę; interpretacja odrzuca ją jako niejednoznaczną i stosuje wartość
  domyślną z komunikatem, zachowując pozostałe poprawne kryteria.
- **Filtr w `useState` nie odtwarza widoku:** stan komponentu nie jest częścią
  adresu — udostępniony link pozbawiony informacji o filtrach pokazuje domyślny
  widok; dlatego źródłem prawdy jest URL.
- **Link vs pełne przeładowanie:** `Link` wykonuje miękką nawigację — zachowuje
  stan aplikacji i pobiera tylko potrzebny payload; pełne przeładowanie
  odbudowuje całość. Komponent `use client` otrzymuje początkowy HTML z serwera,
  bo client components są renderowane na serwerze przy pierwszym żądaniu.

## Testy i weryfikacja

Testy jednostkowe interpretacji parametrów (`lib/catalog-params.test.ts`):
poprawna kombinacja, brak wartości, nieznana wartość, pusty tekst, powtórzony
klucz; walidacja ID i brak mutowania danych wejściowych.

Wyniki sprawdzeń (wersja produkcyjna):
