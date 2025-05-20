import { 
  parseAsString, 
  parseAsStringEnum, 
  parseAsInteger, 
  useQueryStates,
  parseAsBoolean,
  createParser
} from "nuqs";
import { FlashcardsSetStatus } from "@/types";

// Enum statusów zestawów fiszek do filtrowania
const statusOptions = ["", "pending", "accepted", "rejected"] as const;
type StatusOption = (typeof statusOptions)[number];

// Opcje sortowania
const sortByOptions = ["name", "createdAt", "updatedAt"] as const;
type SortByOption = (typeof sortByOptions)[number];

const sortOrderOptions = ["asc", "desc"] as const;
type SortOrderOption = (typeof sortOrderOptions)[number];

// Parser dla limitu z domyślną wartością
const parseLimitWithDefault = createParser({
  parse: (value: string) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed < 1 || parsed > 100 ? 10 : parsed;
  },
  serialize: (value: number) => String(value),
})
.withDefault(10)
.withOptions({ clearOnDefault: true });

// Hook do zarządzania filtrami zestawów fiszek
export const useFlashcardSetFilters = () => {
  return useQueryStates({
    page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
    limit: parseLimitWithDefault,
    sortBy: parseAsStringEnum<SortByOption>([...sortByOptions]).withDefault("createdAt"),
    sortOrder: parseAsStringEnum<SortOrderOption>([...sortOrderOptions]).withDefault("desc"),
    status: parseAsStringEnum<StatusOption>([...statusOptions]).withDefault(""),
    nameSearch: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  });
}; 