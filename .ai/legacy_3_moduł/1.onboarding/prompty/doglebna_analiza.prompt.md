3 ETAPY

1. Prompt do analizy modułów

You are a skilled software developer tasked with analyzing the core modules of a project. Your goal is to provide a high-level overview of these modules based on the project's onboarding documentation and git history.

First, carefully read the project onboarding document:

<project_onboarding_doc>
{{onboarding.md}} - przekaż referencję do dokumentacji onboardingowej

</project_onboarding_doc>

Based on this document, identify the core modules of the project. For each core module, you will conduct an analysis using git history and various tools. Perform your initial analysis inside <module_analysis> tags within your thinking block (step 1), then when you encounter <perform_action> block, exit thinking block and use tool calling to perform git commands for further analysis via exploring the project (step 2).

<module_analysis>

1. List all core modules identified from the onboarding document:
   [List modules here]

</module_analysis>

Then use git commands to perform next steps:
<perform_action> 2. For each core module:
a. Extract and quote relevant information about the module from the onboarding document.

b. Git History Analysis:
Command: git --no-pager log --pretty=format:"Commit: %H%nAuthor: %an <%ae>%nDate: %ad%nSubject: %s%n%n------------------------------------------------------------" --date=iso -n 10 -- [path-to-module]
[Record the output here]
[Identify and note patterns or themes in the commit messages]

c. Module Analysis Summary:
Module Name: [Name of the module]
Role: [Describe the primary purpose and responsibilities in 2-3 sentences]
Structure: [Outline the key components and organization in 2-3 sentences]
Recent Focus: [Identify areas of recent development activity in 2-3 sentences]

[Repeat steps a-c for each core module]
</perform_action>

3. Cross-module analysis:
   [Compare and contrast modules, noting similarities and differences]
   [Summarize findings across all modules, noting any patterns or relationships]

After completing your analysis, compile a high-level overview that summarizes your findings. Your final output should be structured as follows:

Core Modules Overview:

1. [Module Name 1]

   - Role: [Description in 2-3 sentences based on onboarding document and performed analysis]
   - Structure: [Key components]
   - Recent Focus: [Areas of recent activity]

2. [Module Name 2]
   - Role: [Description in 2-3 sentences based on onboarding document and performed analysis]
   - Structure: [Key components]
   - Recent Focus: [Areas of recent activity]

[Continue for all identified core modules]

Ensure that your overview is based on the detailed analysis you conducted, including insights from the git history and tool usage. Focus on the most important aspects of each module, providing a concise yet informative summary. Your final output should consist only of the Core Modules Overview and should not duplicate or rehash any of the work you did in the thinking block.

---

Kluczowe elementy tego promptu:

Identyfikacja wszystkich głównych modułów z dokumentu onboardingowego

Analiza historii git dla każdego modułu

Podsumowanie roli, struktury i ostatnich obszarów aktywności dla każdego modułu

Analiza relacji między modułami

Wartość dla onboardingu: Ten prompt pozwala uzyskać głębsze zrozumienie każdego modułu, bazując nie tylko na statycznych opisach, ale także na rzeczywistej historii zmian w kodzie. Szczególnie cenne jest odkrywanie wzorców i trendów w ostatniej aktywności, co daje nowym deweloperom wgląd w aktualne priorytety zespołu.

---

2. Prompt do analizy kluczowych plików

You are a skilled software developer tasked with analyzing the key files of a project. Your goal is to provide a high-level overview based on the project's top files list, git history, and file system analysis.

First, carefully examine the list of top files and their change history:
<top_files_list>
{{top-files}} - ta sama lista top plików ze skryptu git którą przekazywaliśmy do przygotowania dokumentu onboardingowego

</top_files_list>

Please complete this analysis in THREE DISTINCT PHASES:

PHASE 1: Initial Identification
Identify the 10 most important files based on the provided top files list. List them by full path and briefly note why each appears significant based on change frequency and contributor involvement.

PHASE 2: Git History Analysis
For each of the 10 key files identified:

1. First, run the git log command to examine the recent commit history:
   git --no-pager log --pretty=format:"Commit: %H%nAuthor: %an <%ae>%nDate: %ad%nSubject: %s%n%n" --date=iso -n 5 -- [file-path]
2. Analyze the commit messages to identify patterns and recent focus areas
3. Record your observations about the git history before proceeding to file analysis

YOU MUST COMPLETE PHASE 2 BEFORE MOVING TO PHASE 3.

PHASE 3: File Content Analysis
After completing the git history analysis for all 10 files, examine the actual content of each file:

1. Use the file_read tool to view the content of each key file
2. For each file, provide:

- File purpose and function (2-3 sentences)
- Content organization and key components (2-3 sentences)
- How the file connects to other parts of the system (1-2 sentences)

Final Deliverable:
After completing all three phases, summarize your findings in a "Key Files Overview" section that includes:

1. The role of each file in the system
2. Recent development focus areas based on git history
3. Key architectural insights about how these files work together

## Your response should clearly show the progression through all three phases and culminate in the final overview.

---

Trzy fazy analizy plików:

Identyfikacja - określenie 10 najważniejszych plików na podstawie częstotliwości zmian

Analiza historii git - badanie ostatnich commitów do każdego pliku

Analiza zawartości plików - badanie rzeczywistego kodu i jego struktury

Wartość dodana: Ten prompt pozwala przejść od wysokopoziomowej analizy modułów do szczegółowych informacji o konkretnych plikach. Dla nowego dewelopera zrozumienie kluczowych plików, ich przeznaczenia oraz ostatnich zmian jest nieocenione. Szczególnie wartościowe jest powiązanie plików z ogólną architekturą systemu, które Gemini 2.5 Pro opisuje naprawdę nieźle (chociaż wciąż nieidealnie).

3. Prompt do syntezy i aktualizacji dokumentu onboardingowego

You are a senior developer tasked with enhancing the onboarding documentation for the Excalidraw project. You have completed both module-level and file-level analyses, and now need to synthesize these findings to update the original onboarding document.

Please review:

1. Your module analysis findings
2. Your key files analysis findings
3. The original onboarding document:
   <onboarding-document>
   {{onboarding-md}} - przekaż referencję do dokumentacji onboardingowej

</onboarding-document>

Based on your comprehensive analysis, update the following sections of the document with deeper insights:

1. Core Modules

   - Enhance the description of each module with insights from your analysis
   - Add any missing modules you discovered that weren't in the original document
   - Include relationships between modules that weren't previously documented

2. Key Contributors

   - Update with accurate contributor information from git history
   - Note areas of expertise/focus for major contributors
   - Identify which contributors are most active in which areas

3. Overall Takeaways & Recent Focus

   - Synthesize patterns discovered in git commits across files and modules
   - Highlight the current development priorities based on recent activity
   - Note any shifts in focus compared to what was stated in the original document

4. Potential Complexity/Areas to Note

   - Flag specific files or modules with high change rates that might indicate complexity
   - Identify areas where multiple contributors frequently make changes (potential knowledge sharing needs)
   - Note any discrepancies between documented architecture and actual implementation

5. Questions for the Team

   - Based on your analysis, formulate 3-5 specific questions that would help a new developer understand unclear aspects of the codebase
   - Focus on areas where the documentation doesn't align with observed code patterns

6. Next Steps
   - Provide concrete recommendations for a new developer joining the project
   - Suggest which files/modules should be reviewed first based on your analysis
   - Recommend specific documentation improvements

Create a revised onboarding document that maintains the overall structure of the original, but enhances these sections with your new findings. The document should be comprehensive yet concise, suitable for helping new developers quickly understand the project landscape.

When updating each section, clearly indicate:

- What information was preserved from the original
- What new insights were added based on your analysis
- Any corrections to the original documentation

Don't return new version as a text, but update the existing @onboarding.md file.

---

Kluczowe elementy aktualizacji:

Wzbogacenie opisów modułów o nowe odkrycia

Aktualizacja informacji o kluczowych kontrybutorach

Synteza aktualnych obszarów rozwoju i priorytetów

Identyfikacja potencjalnych obszarów złożoności

Tworzenie celnych pytań dla zespołu

Rekomendacja konkretnych kroków dla nowych deweloperów

Wartość końcowa: Ten prompt pozwala połączyć wszystkie znalezione informacje w spójny, zaktualizowany dokument onboardingowy, który będzie znacznie bardziej wartościowy dla nowych deweloperów niż wersja początkowa. Dokument zawiera nie tylko statyczne opisy, ale także informacje o aktualnych trendach rozwoju, potencjalnych wyzwaniach i konkretnych krokach do podjęcia.
