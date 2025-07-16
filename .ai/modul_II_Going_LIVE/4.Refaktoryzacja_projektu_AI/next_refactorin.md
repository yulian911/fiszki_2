Prompt dla AI: Modernizacja Next.js do wersji 15.4 z React 19
Zadanie: Zmodernizuj aplikację Next.js do najnowszej wersji 15.4 z React 19, implementując zaawansowane pattern'y loading'u i optymalizacji performance.
🎯 Krok 1: Analiza i Upgrade
Sprawdź aktualną wersję Next.js w projekcie i znajdź najnowszą dostępną wersję
Zaktualizuj dependencies do:
Next.js 15.4
React 19
React DOM 19
Najnowsze wersje @tanstack/react-query, TypeScript
Uruchom upgrade używając npm/yarn
Przeanalizuj obecne pattern'y loading'u w aplikacji (conditional rendering, loading states)
🛠️ Krok 2: Next.js Configuration Enhancement
Zaktualizuj next.config.ts dodając:
experimental: {
  reactCompiler: true,
  optimizePackageImports: ['@radix-ui/*', 'lucide-react', '@tanstack/react-query'],
  turbo: { memoryLimit: 50 }
}
🗄️ Krok 3: Server-Side Caching
W pliku z database queries:
Zaimportuj cache z React
Wrap wszystkie server-side functions używane w Server Components z cache()
Napraw ewentualne TypeScript errors związane z undefined values
⚡ Krok 4: TanStack Query Optimization
W query provider:
Zwiększ staleTime z domyślnego na 5 minut
Dodaj intelligent retry logic (nie retry dla 4xx errors)
Implement exponential backoff dla retry delays
Dodaj networkMode: 'offlineFirst'
🌐 Krok 5: API Routes Cache Headers
Dla każdego API route:
Dodaj odpowiednie cache headers (Cache-Control, Vary, ETag)
Różnicuj cache time w zależności od typu danych (statyczne vs dynamiczne)
Implement no-store dla mutations
🎭 Krok 6: Suspense Infrastructure
Stwórz reusable Suspense components:
components/suspense/suspense-wrapper.tsx:
Enum z variant'ami loading (PAGE, LIST, CARD, FORM, DASHBOARD)
SuspenseWrapper component z fallback selection
Specialized wrappers (PageSuspense, ListSuspense, etc.)
Skeleton components w components/suspense/skeletons/:
PageSkeleton (full layout z header, sidebar, content)
CardSkeleton (grid layout)
ListSkeleton (lista z pagination)
FormSkeleton (form fields)
DashboardSkeleton (stats, charts, tables)
📈 Krok 7: Progressive Loading System
Stwórz components/suspense/progressive-suspense.tsx:
Priority enum (critical, important, normal, low)
Different delays dla każdego priority (0ms, 100ms, 300ms, 800ms)
ProgressiveSuspense component z useState i useEffect
Layout components dla różnych page types
🌊 Krok 8: Streaming UI
Stwórz components/suspense/streaming-ui.tsx:
StreamingContainer z priority handling
ProgressiveReveal dla multiple sections
StreamingList z virtual scrolling
ConcurrentWrapper wykorzystujący React 19 scheduler API
⚛️ Krok 9: React 19 Concurrent Features
Stwórz components/suspense/concurrent-features.tsx z hooks:
useOptimisticUpdate - optimistic UI updates
useDeferredSearch - search z useDeferredValue
usePriorityUpdates - high/low priority updates
useBatchUpdates - batched update queue
useConcurrentForm - form handling z optimistic updates
usePerformanceMetrics - render performance tracking
🚨 Krok 10: Enhanced Error Handling
Przepisz app/error.tsx:
Contextual error messages (NETWORK, UNAUTHORIZED, NOT_FOUND)
Enhanced logging z digest, timestamp, userAgent, URL
Development vs production error displays
Recovery actions dla różnych error types
🏗️ Krok 11: Client Component Refactoring
Dla każdej głównej strony:
Zastąp conditional loading Suspense boundaries
Użyj odpowiednich layout components
Wrap components w appropriate Suspense wrappers
Implement progressive reveal dla complex pages
Dodaj ErrorBoundary gdzie potrzeba
Pattern dla każdej strony:
<LayoutComponent>
  <PageSuspense><Header /></PageSuspense>
  <ListSuspense><MainContent /></ListSuspense>
  <UserProgressSuspense><Sidebar /></UserProgressSuspense>
</LayoutComponent>
Apply to mcp.json
✅ Krok 12: Validation & Testing
Sprawdź TypeScript errors i napraw
Test loading states w development
Verify cache behavior dla API routes
Test error scenarios z error boundaries
Performance check w browser dev tools
🎯 Expected Result
Po wykonaniu tych kroków aplikacja powinna mieć:
✅ Najnowsze wersje Next.js 15.4 + React 19
✅ Declarative Suspense boundaries zamiast conditional loading
✅ Progressive loading z priority-based rendering
✅ Server-side caching z React Cache
✅ Optimized TanStack Query configuration
✅ Enhanced error handling z recovery options
✅ Comprehensive skeleton loading states
✅ React 19 concurrent features integration
Kolejność wykonania: Wykonuj kroki sequentially, testując po każdym większym kroku. Użyj parallel tool calls gdzie możliwe dla efficiency.
