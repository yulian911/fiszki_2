Etap 2: Analiza kodu poprzez logowanie

Po stworzeniu action planu, kolejnym krokiem jest przeanalizowanie faktycznego działania kodu przy użyciu strategicznych console.logów, które pomogą zrozumieć przepływ danych i zachowanie aplikacji.

Również tutaj Gemini 2.5 Pro może służyć pomocą, analizując kod i sugerując najbardziej wartościowe miejsca do umieszczenia logów.

Etap 2 zaczynamy w nowej konwersacji. 

Struktura promptu dodającego logi do kluczowych plików:
You are a skilled developer tasked with debugging an issue related to bug in a codebase. Your goal is to add strategic logging to understand which parts of the code are responsible for the bug. You will be working with the following information:

1. An action plan for debugging:
<action-plan>
{{action-plan}} - referencja do pliku z action planem

</action-plan>

2. Investigation questions to guide your analysis:
<investigation-questions>
{{investigation-questions}} - przeklejona lista pytań z action planu, na które możemy odpowiedzieć dzięki logom/analizie

</investigation-questions>

3. A list of files that need to be analyzed and modified:
<suggested-files>
{{suggested-files}} - referencje do plików, które podejrzewamy o związek z błędem

</suggested-files>

For each file in the suggested-files list, follow these steps inside your thinking block:

1. Analyze the code using the action plan and investigation questions.
2. Extract and list key functions and variables related to the bug.
3. Summarize existing logging or debugging code in the file.
4. Brainstorm potential causes of the issue based on the file content.
5. Plan 5-10 key logs that will help understand the codebase behavior.
6. Consider if more logs are needed.

After finishing analysis within thinking block, start performing actions on the first file in the suggested-files list. Process one file at a time and wait for user confirmation before moving to the next file.

Important guidelines:
- Process one file at a time.
- Focus on adding logs that best address the investigation questions.
- Avoid refactoring the code unless absolutely necessary. If you must refactor, clearly mark the changed variable with a comment and explain why it was necessary.
- For JS code, add JSON.stringify when logging objects to ensure their content is visible in the console and easy to copy into this conversation.

Remember to prioritize logs that directly address the investigation questions and provide insights into the issue. Avoid unnecessary code changes or refactoring.

Focus on adding logs to the suggested file, adding explantions why these logs are valuable. You should not duplicate or rehash any of the work you did in the thinking block.

Przykładowa analiza i dodanie logów

Dla pliku binding.ts, który został zidentyfikowany jako kluczowy dla problemu, Gemini 2.5 Pro może przeanalizować kod i zaproponować odpowiednie logi:

// packages/excalidraw/element/binding.ts

// Istniejąca funkcja
export function updateBoundElements(
  elements: readonly ExcalidrawElement[],
  changedElement: ExcalidrawElement
): ExcalidrawElement[] {
  
  // Dodane przez AI logi dla debugowania
  console.log(`[binding] updateBoundElements called for element:`, 
    JSON.stringify({
      id: changedElement.id,
      type: changedElement.type,
      x: changedElement.x,
      y: changedElement.y,
      width: changedElement.width,
      height: changedElement.height
    })
  );
  
  if (!changedElement.boundElements?.length) {
    return elements;
  }
  
  // Dodane przez AI logi dla debugowania
  console.log(`[binding] Element has ${changedElement.boundElements.length} bound elements:`, 
    JSON.stringify(changedElement.boundElements)
  );
  
  // Pozostały kod funkcji...
}

// Istniejąca funkcja
function getElligibleElementId(
  element: ExcalidrawElement,
  way: "center" | "outside",
  startPoint: Point,
  endPoint: Point
): string | null {

  // Dodane przez AI logi dla debugowania
  console.log(`[binding] getElligibleElementId called with way: ${way}`, 
    JSON.stringify({
      elementId: element.id,
      elementType: element.type,
      startPoint,
      endPoint
    })
  );
  
  // Pozostały kod funkcji...
}



Takie logi pozwalają:
    - Śledzić kiedy i jak aktualizowane są powiązania między elementami
    - Obserwować zmiany w pozycjach elementów
    - Zrozumieć warunki, które wywołują problemy z wiązaniami strzałek

Dodawanie takich logów samodzielnie nie jest wcale banalnym zadaniem, zwłaszcza gdy mamy do przeanalizowania plik taki jak binding.ts, z 2,5k linii kodu logiki biznesowej.