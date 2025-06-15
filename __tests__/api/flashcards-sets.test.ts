import dotenv from "dotenv";
import path from "path";

// Load environment variables before any other imports
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

import { FlashcardsSetService } from "../../features/flashcard-sets/services/FlashcardsSetService";
import { createClient } from "@/utils/supabase/client";

/**
 * Plik z testami jednostkowymi API zestawów fiszek.
 * Używamy mocków dla FlashcardsSetService, aby izolować testy.
 */

describe("FlashcardsSetService Integration Tests", () => {
  let service: FlashcardsSetService;
  let supabase: ReturnType<typeof createClient>;
  let authenticatedUserId: string;

  beforeAll(async () => {
    // This client will be used by the service. It connects to the actual test DB.
    supabase = createClient();
    // We need to be authenticated to perform create/delete operations
    const { data, error } = await supabase.auth.signInWithPassword({
      email: process.env.E2E_EMAIL!,
      password: process.env.E2E_PASSWORD!,
    });
    if (error) {
      throw new Error(`Test login failed: ${error.message}`);
    }
    if (!data.user) {
      throw new Error("Test login failed: user is null");
    }
    authenticatedUserId = data.user.id;
    service = new FlashcardsSetService(supabase);
  });

  afterAll(async () => {
    await supabase.auth.signOut();
  });

  describe("list", () => {
    it("should return a paginated list of flashcard sets", async () => {
      // This is an integration test, so it assumes some data exists.
      // For a real scenario, you'd seed the DB in a `beforeAll` or `beforeEach`.
      const result = await service.list(authenticatedUserId, 1, 5);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).toBeDefined();
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(5);
    });
  });

  describe("create and delete", () => {
    let newSetId: string;
    const setName = `Test Set ${Date.now()}`;

    it("should create a new flashcard set", async () => {
      const newSet = await service.create(authenticatedUserId, {
        name: setName,
        description: "A test set",
      });

      expect(newSet).toBeDefined();
      expect(newSet.name).toBe(setName);
      expect(newSet.ownerId).toBe(authenticatedUserId);
      newSetId = newSet.id;
    });

    it("should get the newly created set by ID", async () => {
      expect(newSetId).toBeDefined(); // Ensure the previous test ran and set the ID
      const fetchedSet = await service.getById(authenticatedUserId, newSetId);

      expect(fetchedSet).toBeDefined();
      expect(fetchedSet.id).toBe(newSetId);
      expect(fetchedSet.name).toBe(setName);
    });

    it("should delete the created flashcard set", async () => {
      expect(newSetId).toBeDefined();
      await expect(
        service.delete(authenticatedUserId, newSetId)
      ).resolves.not.toThrow();

      // Verify it's gone
      await expect(
        service.getById(authenticatedUserId, newSetId)
      ).rejects.toThrow();
    });
  });
});
