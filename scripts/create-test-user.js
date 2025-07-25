const { createClient } = require("@supabase/supabase-js");
const { config } = require("dotenv");

// Załaduj zmienne środowiskowe
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Sprawdzanie zmiennych środowiskowych...");
console.log("SUPABASE_URL:", supabaseUrl ? "✓ Ustawione" : "✗ Brak");
console.log("SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓ Ustawione" : "✗ Brak");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Brak wymaganych zmiennych środowiskowych:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error("- NEXT_PUBLIC_SUPABASE_ANON_KEY");
  console.error("\nUpewnij się, że secrets są poprawnie ustawione w GitHub.");
  process.exit(1);
}

// Sprawdź czy URL wygląda poprawnie
if (
  !supabaseUrl.startsWith("https://") ||
  !supabaseUrl.includes(".supabase.co")
) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL wygląda niepoprawnie:");
  console.error("Otrzymano:", supabaseUrl);
  console.error("Oczekiwano format: https://xxxxx.supabase.co");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  const testEmail = process.env.E2E_EMAIL || "test@test.pl";
  const testPassword = process.env.E2E_PASSWORD || "Test123!";

  console.log(`Tworzenie użytkownika testowego: ${testEmail}`);
  console.log(`Hasło: ${testPassword}`);

  // Próbuj zarejestrować użytkownika
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (error) {
    if (error.message.includes("already registered")) {
      console.log("Użytkownik testowy już istnieje ✓");

      // Sprawdź czy można się zalogować
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        console.error(
          "Nie można zalogować użytkownika testowego:",
          signInError.message
        );
        console.log(
          "Spróbuj zresetować hasło użytkownika w Supabase Dashboard"
        );
      } else {
        console.log("Logowanie użytkownika testowego działa ✓");
      }
    } else {
      console.error("Błąd tworzenia użytkownika:", error.message);
    }
  } else {
    console.log("Użytkownik testowy został utworzony ✓");
    console.log("Sprawdź email aby potwierdzić konto (jeśli wymagane)");
  }
}

createTestUser().catch(console.error);
