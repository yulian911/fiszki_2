<conversation_summary>
<decisions>
1.  **Problem Definition:** The core problem is the time-consuming nature of manual flashcard creation, hindering the use of spaced repetition.
2.  **Target Audience:** Primary users include students (medicine, law, STEM), language learners, and professionals needing continuous learning, utilizing materials like notes, articles, and technical definitions.
3.  **Core Functionality (General):** The application will feature AI-powered flashcard generation from pasted text, manual flashcard creation, flashcard management (browse, edit, delete), user accounts for storage, and integration with a spaced repetition system.
4.  **AI Generation Expectations:** AI should generate concise, relevant, and varied flashcard formats (Q&A initially, potentially more later) from diverse inputs (prose, code, lists), understand context (ideally domain-specific), handle multiple languages, and allow user feedback/editing. "Acceptance" involves keeping/using the card.
5.  **Manual Creation Features:** Users require fields for front/back text, hints, basic formatting, and metadata like tags. More advanced features (images, math) are desired but potentially post-MVP.
6.  **Spaced Repetition:** Users expect integration with algorithms like SM-2 or Leitner, allowing daily reviews, self-assessment, progress tracking, and some customization. The exact implementation (external vs. internal simple) for MVP is pending.
7.  **User Accounts:** Will include basic registration (email/pass), potentially social login, profile settings, and flashcard synchronization across devices. Data storage includes user info, flashcards, and learning history.
8.  **Success Metrics:** Key metrics include the initial 75% AI acceptance and 75% AI usage rates, alongside standard KPIs like DAU/MAU, session duration, retention, and potentially a proxy for learning effectiveness via algorithm progress.
9.  **User Experience:** The focus is on a simple, minimalist, intuitive UI with clear separation between creation and learning modes, a central dashboard, and responsive design.
10. **Risk Mitigation:** Strategies include easy editing of AI cards, user feedback on AI quality, potential for basic import, and having a fallback simple repetition system.
11. **Future Directions:** Post-MVP considerations include a freemium model, sharing features, enhanced analytics, integrations, API, and gamification.

</decisions>

<matched_recommendations>
1.  **Define Persona:** Completed through user's detailed description of the target audience and their needs.
2.  **Specify Metrics:** Completed through user's definition of acceptance criteria and other KPIs.
3.  **Plan Feedback Mechanism:** Acknowledged as necessary by the user for AI quality improvement and risk mitigation.
4.  **Priorytetyzuj Prostotę UI/UX:** Aligns with the user's stated preference for a minimalist and intuitive interface.
5.  **MVP Scope Definition:** Crucial next step, highlighted by the unanswered questions regarding feature prioritization for the initial release.
6.  **Wybór Technologii AI:** Research needed based on defined MVP requirements (e.g., Q&A focus, language support).
7.  **Decyzja ws. Algorytmu Powtórek:** A key decision required for MVP (external integration vs. simple internal implementation).
8.  **Architektura pod Freemium:** Recommended to consider basic architecture implications even in MVP, aligning with future plans.
9.  **Testowanie Użyteczności:** Recommended for validating UX assumptions for core flows.

</matched_recommendations>

<prd_planning_summary>
**1. Introduction & Goals:**
*   **Problem:** Manual flashcard creation is inefficient.
*   **Goal:** Create a web application (MVP) that simplifies flashcard creation using AI and integrates with spaced repetition, making learning more efficient.
*   **Target Users:** Students, language learners, professionals.

**2. Functional Requirements (MVP Scope TBD - see Unresolved Issues):**
*   **AI Flashcard Generation:**
    *   Input: Pasted text (prose, code snippets, lists). Max length TBD (~500 chars mentioned, needs review).
    *   Output: Primarily Question/Answer format for MVP (TBC). Ability to handle different content types.
    *   Interaction: User can accept, edit, or discard generated cards. Mechanism for indicating low quality/requesting alternatives (MVP scope TBD). User feedback loop for quality.
*   **Manual Flashcard Creation:**
    *   Fields: Front text, back text, hints (TBC), tags.
    *   Formatting: Basic text formatting (bold, italic, lists). (Images, math support likely post-MVP).
*   **Flashcard Management:**
    *   View/Browse sets of flashcards.
    *   Edit existing flashcards (both AI-generated and manual).
    *   Delete flashcards.
*   **Spaced Repetition System:**
    *   Integration Choice: Either integrate with an existing external system (e.g., via API if available) OR implement a simple internal algorithm (e.g., Leitner boxes) for MVP (TBC).
    *   User Interaction: Initiate review sessions, self-rate card recall (e.g., 1-5 scale), view basic stats/backlog.
*   **User Accounts:**
    *   Authentication: Email/password registration (Social login TBC for MVP).
    *   Data Storage: User profile, flashcard data, learning progress/stats.
    *   Synchronization: Basic sync between devices (Real-time vs. on-demand TBC for MVP).

**3. Key User Stories/Flows (Examples):**
*   *AI Generation:* A user pastes text -> AI suggests flashcards -> User reviews/edits/accepts cards into a set.
*   *Manual Creation:* User opens creator -> Enters front/back text & tags -> Saves card to a set.
*   *Learning Session:* User logs in -> Starts daily review -> System presents due cards -> User rates recall -> System schedules next review.
*   *Management:* User views sets -> Selects a set -> Edits or deletes a specific card.

**4. Success Criteria & Measurement:**
*   **Primary:**
    *   >= 75% of AI-generated flashcards are accepted by users (tracked via edits/usage/retention).
    *   >= 75% of flashcards created overall utilize the AI generation feature.
*   **Secondary KPIs:**
    *   DAU/MAU.
    *   Average learning session duration.
    *   User retention rate (1, 7, 30 days).
    *   Number of flashcards created (AI vs. Manual).
    *   Proxy for learning effectiveness (e.g., user progress within the SRS algorithm).

**5. Non-Functional Requirements (Initial Thoughts):**
*   **Platform:** Web application first.
*   **UI/UX:** Minimalist, intuitive, responsive.
*   **Performance:** Reasonably fast AI generation and smooth learning sessions.
*   **Scalability:** Architecture should consider potential future freemium model and user growth.

</prd_planning_summary>

<unresolved_issues>
The following points require clarification to finalize the MVP scope before proceeding with the detailed PRD:
1.  **AI Formats (MVP):** Is basic Q&A generation sufficient for MVP, or are varied formats (fill-in-the-blanks, matching) essential from the start?
2.  **AI Context Handling (MVP):** Should users be able to specify the subject domain/context for the input text in MVP to improve AI relevance?
3.  **Low-Quality AI Handling (MVP):** What specific mechanism for handling low-quality AI results is needed in MVP (e.g., simple re-gen/edit vs. offering alternatives vs. basic preference learning)?
4.  **Manual Creation Features (MVP):** Are images, math formulas, or linking related cards strictly required for MVP, or can they be deferred?
5.  **Algorithm Integration (MVP):** Decision needed: Integrate with an external API (if feasible/reliable) OR build a simple internal SRS (like Leitner) for MVP? What does an "inspired" implementation mean for MVP?
6.  **Import Feature (MVP):** Should a basic import function (e.g., CSV) be included in the MVP scope for risk mitigation/user convenience, despite initial exclusion?
7.  **Social Logins (MVP):** Is social login (Google/Apple/Facebook) required for MVP, or is email/password sufficient initially?
8.  **Synchronization (MVP):** Is real-time sync essential for MVP, or is sync on login/on-demand acceptable?
9.  **Freemium Architecture (MVP):** Should the MVP's backend explicitly include mechanisms for tracking AI usage limits in preparation for a future freemium model?
10. **Learning Effectiveness Metric (MVP):** How should "learning effectiveness" be practically measured and presented to the user within the constraints of the MVP's SRS? Are basic algorithm stats sufficient?

</unresolved_issues>
</conversation_summary>