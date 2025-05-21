import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates, createParser } from "nuqs";

// Options for sortBy. Extend as needed.
const sortByOptions = ["createdAt", "question", "answer"] as const;
type SortByOption = (typeof sortByOptions)[number];

const sortOrderOptions = ["asc", "desc"] as const;
type SortOrderOption = (typeof sortOrderOptions)[number];

// Parser for limit; default 10
const parseLimitWithDefault = createParser({
  parse: (value: string) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed < 1 || parsed > 100 ? 10 : parsed;
  },
  serialize: (value: number) => String(value),
})
  .withDefault(10)
  .withOptions({ clearOnDefault: true });

export const useFlashcardFilters = () => {
  return useQueryStates({
    page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
    limit: parseLimitWithDefault,
    sortBy: parseAsStringEnum<SortByOption>([...sortByOptions]).withDefault("createdAt"),
    sortOrder: parseAsStringEnum<SortOrderOption>([...sortOrderOptions]).withDefault("desc"),
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  });
}; 