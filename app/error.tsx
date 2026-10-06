"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <h1>Wystąpił błąd</h1>

      <p>Nie udało się załadować strony.</p>

      <button onClick={() => reset()}>Spróbuj ponownie</button>
    </main>
  );
}
