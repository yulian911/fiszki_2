"use client";

import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";

interface FlashcardsSet {
  id: string;
  name: string;
  status: string;
}

export default function TestApiPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [sets, setSets] = useState<FlashcardsSet[]>([]);
  const [newSetName, setNewSetName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const supabase = createClient();

  // Sprawdź, czy użytkownik jest zalogowany na starcie
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser();
        setUser(userData.user);
        setToken(data.session.access_token);
      }
    };

    checkAuth();
  }, [supabase.auth]);

  // Logowanie użytkownika
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setUser(data.user);
      setToken(data.session?.access_token || null);
      setMessage("Zalogowano pomyślnie");
    } catch (err: any) {
      setError(err.message || "Błąd logowania");
    } finally {
      setLoading(false);
    }
  };

  // Wylogowanie użytkownika
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    setSets([]);
    setMessage("Wylogowano pomyślnie");
  };

  // Pobieranie zestawów fiszek
  const fetchSets = async () => {
    setLoading(true);
    setError("");

    try {
      // Odświeżenie tokenu
      const { data: sessionData } = await supabase.auth.getSession();
      const currentToken = sessionData.session?.access_token || token;

      if (!currentToken) {
        throw new Error("Brak tokenu uwierzytelniającego");
      }

      const response = await fetch("/api/flashcards-sets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `${response.status}: ${errorData.error || "Nieznany błąd"}`
        );
      }

      const data = await response.json();
      setSets(data.data || []);
      setMessage(`Pobrano ${data.data.length} zestawów`);
    } catch (err: any) {
      setError(err.message || "Błąd pobierania zestawów");
      console.error("Błąd podczas pobierania zestawów:", err);
    } finally {
      setLoading(false);
    }
  };

  // Tworzenie nowego zestawu
  const createSet = async () => {
    if (!newSetName.trim()) {
      setError("Nazwa zestawu nie może być pusta");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Odświeżenie tokenu
      const { data: sessionData } = await supabase.auth.getSession();
      const currentToken = sessionData.session?.access_token || token;

      if (!currentToken) {
        throw new Error("Brak tokenu uwierzytelniającego");
      }

      const response = await fetch("/api/flashcards-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: newSetName,
          // Dodajemy id właściciela z aktualnie zalogowanego użytkownika
          owner_id: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `${response.status}: ${errorData.error || "Nieznany błąd"}`
        );
      }

      const data = await response.json();
      setMessage(`Utworzono nowy zestaw: ${data.name}`);
      setNewSetName("");
      // Odśwież listę zestawów
      fetchSets();
    } catch (err: any) {
      setError(err.message || "Błąd tworzenia zestawu");
      console.error("Błąd podczas tworzenia zestawu:", err);
    } finally {
      setLoading(false);
    }
  };

  // Tworzenie nowego zestawu przy użyciu bezpośrednio Supabase
  const createSetDirect = async () => {
    if (!newSetName.trim()) {
      setError("Nazwa zestawu nie może być pusta");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Tworzenie zestawu bezpośrednio przez klienta Supabase
      const { data, error } = await supabase
        .from("flashcards_set")
        .insert({
          name: newSetName,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Błąd Supabase: ${error.message}`);
      }

      setMessage(`Utworzono nowy zestaw bezpośrednio: ${data.name}`);
      setNewSetName("");
      // Odśwież listę zestawów
      fetchSets();
    } catch (err: any) {
      setError(err.message || "Błąd tworzenia zestawu");
      console.error("Błąd podczas bezpośredniego tworzenia zestawu:", err);
    } finally {
      setLoading(false);
    }
  };

  // Diagnostyka - wyświetl tokeny i ciasteczka
  const showDebugInfo = async () => {
    const { data } = await supabase.auth.getSession();
    console.log("Sesja:", data);
    console.log("Token:", data.session?.access_token);
    console.log("Użytkownik:", await supabase.auth.getUser());
    console.log("Cookies:", document.cookie);
    setMessage(
      `Debug info wyświetlone w konsoli. Token: ${data.session?.access_token ? "Dostępny" : "Brak"}`
    );
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Test API Zestawów Fiszek</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-900 rounded">
          <strong>Błąd:</strong> {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-900 rounded">
          {message}
        </div>
      )}

      {!user ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Hasło:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-100 p-4 rounded">
            <p>
              <strong>Zalogowano jako:</strong> {user.email}
            </p>
            <p>
              <strong>ID użytkownika:</strong> {user.id}
            </p>
            <p>
              <strong>Status tokenu:</strong> {token ? "Dostępny" : "Brak"}
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={fetchSets}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Pobierz zestawy
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Wyloguj
            </button>
            <button
              onClick={showDebugInfo}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Debug Info
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Utwórz nowy zestaw</h2>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                placeholder="Nazwa zestawu"
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={createSetDirect}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Utwórz bezpośrednio
              </button>
              <button
                onClick={createSet}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Utwórz przez API
              </button>
            </div>
          </div>

          {sets.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">Twoje zestawy</h2>
              <ul className="divide-y divide-gray-200">
                {sets.map((set) => (
                  <li key={set.id} className="py-2">
                    <strong>{set.name}</strong>
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded">
                      {set.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
