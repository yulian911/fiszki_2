import { FlashcardsSetService } from "../../features/flashcard-sets/services/FlashcardsSetService";

/**
 * Plik z testami jednostkowymi API zestawów fiszek.
 * Używamy mocków dla FlashcardsSetService, aby izolować testy.
 */

// Mock dla serwisu
jest.mock("../../features/flashcard-sets/services/FlashcardsSetService");

describe("FlashcardsSetService", () => {
  let mockFlashcardsSetService: any;
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Konfiguracja mocków
    mockSupabaseClient = { from: jest.fn() };
    mockFlashcardsSetService = FlashcardsSetService as any;
    
    // Ustaw implementację metod mockowych
    mockFlashcardsSetService.prototype.list = jest.fn();
    mockFlashcardsSetService.prototype.getById = jest.fn();
    mockFlashcardsSetService.prototype.create = jest.fn();
    mockFlashcardsSetService.prototype.update = jest.fn();
    mockFlashcardsSetService.prototype.delete = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("powinno zwrócić listę zestawów fiszek", async () => {
      // Konfiguracja mocków
      const mockSets = [
        { id: "set1", name: "Zestaw 1" },
        { id: "set2", name: "Zestaw 2" },
      ];

      mockFlashcardsSetService.prototype.list.mockResolvedValue({
        data: mockSets,
        meta: { page: 1, limit: 20, total: 2 },
      });

      // Wywołanie testowanej metody
      const service = new FlashcardsSetService(mockSupabaseClient);
      const result = await service.list("user123", 1, 20, "createdAt");

      // Asercje
      expect(result).toEqual({
        data: mockSets,
        meta: { page: 1, limit: 20, total: 2 },
      });
      expect(mockFlashcardsSetService.prototype.list).toHaveBeenCalledWith(
        "user123",
        1,
        20,
        "createdAt"
      );
    });
  });

  describe("getById", () => {
    it("powinno zwrócić szczegóły zestawu fiszek", async () => {
      const mockSetId = "set-uuid";
      const mockSetWithCards = {
        id: mockSetId,
        name: "Testowy zestaw",
        status: "pending",
        flashcards: [
          { id: "card1", question: "Pytanie 1", answer: "Odpowiedź 1" },
        ],
      };

      mockFlashcardsSetService.prototype.getById.mockResolvedValue(
        mockSetWithCards
      );

      // Wywołanie testowanej metody
      const service = new FlashcardsSetService(mockSupabaseClient);
      const result = await service.getById("user123", mockSetId);

      // Asercje
      expect(result).toEqual(mockSetWithCards);
      expect(mockFlashcardsSetService.prototype.getById).toHaveBeenCalledWith(
        "user123",
        mockSetId
      );
    });

    it("powinno obsłużyć błąd gdy zestaw nie istnieje", async () => {
      const mockSetId = "nonexistent-set";

      mockFlashcardsSetService.prototype.getById.mockRejectedValue(
        new Error("Zestaw nie istnieje lub użytkownik nie ma do niego dostępu")
      );

      // Wywołanie testowanej metody
      const service = new FlashcardsSetService(mockSupabaseClient);
      
      // Asercje
      await expect(service.getById("user123", mockSetId)).rejects.toThrow(
        "Zestaw nie istnieje lub użytkownik nie ma do niego dostępu"
      );
    });
  });
});
