# Etap 1: Tworzenie Action Planu z Gemini 2.5 Pro

Pierwszym krokiem, aby wykorzystać potencjał LLM w pracy nad problemem, jest stworzenie kompleksowego planu działania, który pomoże zorientować się w sytuacji i ustalić strategię debugowania. W tym celu wykorzystujemy prompt dla Gemini 2.5 Pro, który integruje:

- **Dokument onboardingowy** (stworzony w poprzedniej lekcji)
- **Opis problemu** (w tym przypadku issue #9339 z repo excalidraw)
- **Strukturę wynikowego planu działania**

## Struktura Promptu dla Action Planu

Jesteś doświadczonym programistą, którego zadaniem jest stworzenie planu działania w celu rozwiązania problemu. Twoim celem jest przygotowanie kompleksowego, krok po kroku planu, który poprowadzi Cię przez proces rozwiązania tego problemu.

### Krok 1: Przegląd Informacji

1. **Project Onboarding Document:**
   ```markdown
   <project_onboarding_doc>
    {{onboarding.md}}
   </project_onboarding_doc>
   ```

2. **Issue Description:**
   ```markdown
   <issue_description>
   {{issue-description}} - opis issues, najlepiej wkleić tekst zamiast wstawiać tutaj link 
   </issue_description>
   ```

### Krok 2: Stworzenie Dokumentu Action Planu

Twoje zadanie polega na stworzeniu dokumentu w formacie Markdown, zawierającego następujące sekcje:

```markdown
# Action Plan for [Issue Name]

## Issue Description
[Briefly summarize the issue]

## Relevant Codebase Parts
[List and briefly describe the relevant parts of the codebase]

## Git Commit History Analysis
[Summarize key findings from the git commit history]

## Root Cause Hypothesis
[State and explain your hypothesis]

## Potential Contacts
[List individuals or teams to contact, with brief explanations]

## Investigation Questions
[List self-reflection questions and questions for others]

## Next Steps
[Provide a numbered list of actionable steps, including logging and debugging tasks]

## Additional Notes
[Any other relevant information or considerations]
```

### Instrukcje dla Modelu

Postępuj zgodnie z poniższymi krokami:

<action_plan_development>
1. **Identyfikacja istotnych części kodu:**  
   Na podstawie opisu problemu i dokumentu onboardingowego, określ, które części kodu są najbardziej związane z problemem. Wypisz numerowane części kodu wraz z krótkim uzasadnieniem.
</action_plan_development>

<perform_action>
2. **Analiza historii commitów Git:**  
   Dla zidentyfikowanych modułów/pliku, przeanalizuj historię commitów. Użyj poniższego polecenia:
   ```
   git --no-pager log --pretty=format:"Commit: %H%nAuthor: %an <%ae>%nDate: %ad%nSubject: %s%n%n" --date=iso -n 10 -- [file-path]
   ```
</perform_action>

<action_plan_development>
3. **Hipoteza dotycząca przyczyny:**  
   Na podstawie zgromadzonych informacji, wypisz potencjalne przyczyny problemu. Wybierz najbardziej prawdopodobną oraz wyjaśnij swoje uzasadnienie.

4. **Identyfikacja potencjalnych kontaktów:**  
   Wypisz nazwy lub role wymienione w dokumentach, które mogą być pomocne przy konsultacjach. Dla każdego kontaktu krótko uzasadnij, dlaczego warto się z nim skontaktować.

5. **Pytania do dalszej analizy:**  
   Wygeneruj listę pytań, które pomogą lepiej zbadać i zrozumieć problem. Każde pytanie numeruj.

6. **Konkretne następne kroki:**  
   Wypisz kolejne kroki, które pomogą rozwiązać problem, w tym konkretne zadania związane z logowaniem i debugowaniem. Każdy krok numeruj i dodaj krótkie uzasadnienie.
</action_plan_development>

## Finalizacja

Po zakończeniu analizy, stwórz nowy dokument Markdown o nazwie:

```
.ai/{issue-name}-action-plan.md
```

W finalnej wersji dokumentu powinny się znaleźć tylko następujące sekcje:
- **Issue Description**
- **Relevant Codebase Parts**
- **Git Commit History Analysis**
- **Root Cause Hypothesis**
- **Potential Contacts**
- **Investigation Questions**
- **Next Steps**
- **Additional Notes**

Wynikowy dokument ma zawierać tylko te sekcje oraz nie powinien zawierać dodatkowych opisów czy szczegółowego opisu wykonanych kroków.

---

Prompt zawiera instrukcje dla modelu, aby przeprowadził analizę w następujących etapach:

- Identyfikacja istotnych części kodu
- Analiza historii commitów Git
- Hipotezy dotyczące przyczyny problemu
- Identyfikacja potencjalnych osób do kontaktu
- Pytania do dalszej analizy
- Konkretne następne kroki

Taki plan działania jest nieoceniony, ponieważ:
 - dentyfikuje kluczowe części kodu do zbadania
 - Formułuje konkretne hipotezy dotyczące przyczyny problemu
 - Wskazuje osoby, które mogą pomóc
 - Zawiera listę pytań pomocniczych
 - Definiuje praktyczne kroki do debugowania, w tym dodanie logów