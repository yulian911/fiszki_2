<div align="justify">
Prompt do analizy projektów bez rozbudowanej historii git
</div>

Przedstawiony prompt zapewnia kompleksowe podejście do analizy projektów bez polegania na historii git:

You are an AI assistant tasked with onboarding a new developer to a large project. Your goal is to create a comprehensive onboarding summary by exploring the project repository and analyzing its structure, recent developments, and key areas of focus. This summary should help the new developer quickly understand the project, regardless of the underlying technology stack.

To accomplish this task, you have access to the following tools:

1. file_read: Reads the content of a specified file.
2. file_search: Searches for files matching a given pattern.
3. list_dir: Lists the contents of a specified directory.

Use these tools to explore the project structure, read documentation, and analyze the codebase. Do not assume any information about the project that you haven't explicitly discovered through these tools.

Before creating the final onboarding summary, conduct your exploration inside <exploration> tags within your thinking block. In your exploration:

1. Explore the project structure:

   - Use list_dir to understand the directory structure.
   - Identify key directories (e.g., src, docs, tests).
   - Write down the main directories you've found.

2. Analyze core modules and components:

   - Use file_search and file_read to identify and examine main source code files.
   - Determine the project's primary programming language(s) and frameworks.
   - List each core module/component you've identified, numbering them as you go.
   - Write down key observations about each module/component.

3. Review documentation:

   - Search for and read README files, CONTRIBUTING guidelines, and other documentation.
   - Extract information about project setup, running tests, and development workflows.
   - Quote relevant parts of the documentation you find.

4. Identify recent development focus:

   - Examine recently modified files to infer areas of active development.
   - Use git log to check last 10 commits (modules, files, authors). Remember that you have to pipe the results to the stdout so command is not stuck.
   - List the most recently modified files and their modification dates.

5. Determine key contributors:

   - Look for author information in file headers, documentation and previous git log.
   - Write down the names of contributors you've found and their apparent roles.

6. Identify potential complexity areas:

   - Analyze core logic files, state management, or complex integrations.
   - List areas that seem particularly complex and explain why.

7. Gather development environment setup information:

   - Search for build scripts, configuration files, and setup instructions.
   - Summarize the setup process based on what you've found.

8. Collect helpful resources:

   - Find links to external documentation, issue trackers, and communication channels.
   - List all relevant links you've discovered.

9. Conclusions:
   - Summarize your key findings from the exploration.
   - Note any areas where you couldn't find information.

After your exploration, compile an onboarding summary in markdown format with the following structure:

```markdown
# Project Onboarding: [Project Name]

## Welcome

[Brief welcome message and project description]

## Project Overview & Structure

[Overview of project organization and key components]

## Core Modules

[For each identified core module/component]

### `[Module/Component Name]`

- **Role:** [Description of purpose]
- **Key Files/Areas:** [List of important files or areas]
- **Recent Focus:** [Description of recent work or changes]

## Key Contributors

[List of key contributors and their areas of focus]

## Overall Takeaways & Recent Focus

[List of major themes, recent initiatives, and focus areas]

## Potential Complexity/Areas to Note

[List of complex areas and what to watch out for]

## Questions for the Team

[List of 5-7 questions for the new developer to investigate]

## Next Steps

[List of 3-5 actionable steps for the new developer]

## Development Environment Setup

[Instructions for setting up the development environment]

## Helpful Resources

[List of relevant links and resources]
```

Ensure that all information in the summary is based on your exploration of the project using the provided tools. If you cannot find specific information, indicate that it was not found in the checked files.

Your final output should consist only of the markdown-formatted onboarding summary that you will save in .ai/onboarding.md and should not duplicate or rehash any of the work you did in the exploration section of the thinking block. Finish the work after you created document with a required structure and content.

Begin your response with your exploration.

Kluczowe elementy tego prompta:

1. Eksploracja struktury projektu

Zamiast polegać na historii git, model bezpośrednio analizuje strukturę katalogów używając narzędzia list_dir. To pozwala zidentyfikować główne komponenty projektu.

- Use list_dir to understand the directory structure.
- Identify key directories (e.g., src, docs, tests).
- Write down the main directories you've found.

2. Analiza modułów i komponentów

Model używa narzędzi file_search i file_read do identyfikacji i analizy głównych plików źródłowych, co pozwala określić architekturę projektu.

- Use file_search and file_read to identify and examine main source code files.
- Determine the project's primary programming language(s) and frameworks.
- List each core module/component you've identified, numbering them as you go.

3. Przegląd dokumentacji

Strategiczne wyszukiwanie i analiza plików dokumentacji (README, CONTRIBUTING) dostarcza informacji o celach projektu i procesach deweloperskich.

- Search for and read README files, CONTRIBUTING guidelines, and other documentation.
- Extract information about project setup, running tests, and development workflows.

4. Identyfikacja ostatnich prac

Mimo braku rozbudowanej historii git, model może użyć podstawowych komend git do zrozumienia ostatnich zmian.

- Use the following command git log command to understand recent developments:
  git --no-pager log --stat -n 10

5. Pozostałe elementy analizy

Prompt zawiera również wskazówki dotyczące identyfikacji:

Kluczowych kontrybutorów

Potencjalnych obszarów złożoności

Informacji o konfiguracji środowiska deweloperskiego

Pomocnych zasobów i dokumentacji zewnętrznej

</div>
