import { NextRequest } from "next/server";
import { GET, POST } from "../../app/api/flashcards-sets/route";
import {
  GET as GET_SET,
  PUT,
  DELETE,
} from "../../app/api/flashcards-sets/[setId]/route";
import * as supabaseClient from "../../utils/supabase/client";
import { FlashcardsSetService } from "../../features/flashcard-sets/services/FlashcardsSetService";

/**
 * Plik z testami jednostkowymi API zestawów fiszek.
 * Używamy mocków dla Supabase i FlashcardsSetService, aby izolować testy endpointów.
 */

// Aby uniknąć błędów TypeScript związanych z brakiem typów Jest,
// możemy dodać deklarację typu 'jest' w tsconfig.json lub zainstalować @types/jest

// Mock dla supabase
jest.mock("../../utils/supabase/client", () => ({
  createSupabaseServerClient: jest.fn(),
}));

// Mock dla serwisu
jest.mock("../../services/FlashcardsSetService");

describe("API Flashcards Sets", () => {
  let mockSupabase: any;
  let mockFlashcardsSetService: any;

  beforeEach(() => {
    // Konfiguracja mocków
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
    };

    // Musimy użyć any, aby uniknąć błędów TypeScript związanych z brakiem typów Jest
    (supabaseClient.createSupabaseServerClient as any).mockReturnValue(
      mockSupabase
    );
    mockFlashcardsSetService = FlashcardsSetService as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/flashcards-sets", () => {
    it("powinno zwrócić listę zestawów fiszek", async () => {
      // Konfiguracja mocków
      const mockUser = { id: "user123" };
      const mockSets = [
        { id: "set1", name: "Zestaw 1" },
        { id: "set2", name: "Zestaw 2" },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockFlashcardsSetService.prototype.list.mockResolvedValue({
        data: mockSets,
        meta: { page: 1, limit: 20, total: 2 },
      });

      // Wywołanie testowanego endpointu
      const request = new NextRequest(
        "http://localhost:3000/api/flashcards-sets?page=1&limit=20"
      );
      const response = await GET(request);
      const responseData = await response.json();

      // Asercje
      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        data: mockSets,
        meta: { page: 1, limit: 20, total: 2 },
      });
      expect(mockFlashcardsSetService.prototype.list).toHaveBeenCalledWith(
        "user123",
        1,
        20,
        "createdAt",
        undefined
      );
    });

    it("powinno zwrócić błąd 401 gdy użytkownik nie jest zalogowany", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Brak autoryzacji" },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/flashcards-sets"
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(mockFlashcardsSetService.prototype.list).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/flashcards-sets/[setId]", () => {
    it("powinno zwrócić szczegóły zestawu fiszek", async () => {
      const mockUser = { id: "user123" };
      const mockSetId = "set-uuid";
      const mockSetWithCards = {
        id: mockSetId,
        name: "Testowy zestaw",
        status: "pending",
        flashcards: [
          { id: "card1", question: "Pytanie 1", answer: "Odpowiedź 1" },
        ],
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockFlashcardsSetService.prototype.getById.mockResolvedValue(
        mockSetWithCards
      );

      const request = new NextRequest(
        `http://localhost:3000/api/flashcards-sets/${mockSetId}`
      );
      const params = { setId: mockSetId };
      const response = await GET_SET(request, { params });
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockSetWithCards);
      expect(mockFlashcardsSetService.prototype.getById).toHaveBeenCalledWith(
        "user123",
        mockSetId
      );
    });

    it("powinno zwrócić błąd 404 gdy zestaw nie istnieje", async () => {
      const mockUser = { id: "user123" };
      const mockSetId = "nonexistent-set";

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockFlashcardsSetService.prototype.getById.mockRejectedValue(
        new Error("Zestaw nie istnieje lub użytkownik nie ma do niego dostępu")
      );

      const request = new NextRequest(
        `http://localhost:3000/api/flashcards-sets/${mockSetId}`
      );
      const params = { setId: mockSetId };
      const response = await GET_SET(request, { params });

      expect(response.status).toBe(404);
    });
  });
});
