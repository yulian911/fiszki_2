# Project Onboarding: Intelligent Flashcards

## Welcome

Welcome to the Intelligent Flashcards project! This document will guide you through the project's structure, key components, and development practices. Our goal is to simplify the creation of educational flashcards using AI, allowing users to generate, manage, and study flashcards efficiently.

## Project Overview & Structure

This is a modern full-stack application built with Next.js and Supabase. The project is in the MVP stage, with a current focus on establishing a solid CI/CD and deployment pipeline.

The repository is organized as follows:

- `app/`: Core application logic, including Next.js App Router pages and API routes.
- `components/`: Shared, reusable React components built with Shadcn/ui and Radix.
- `features/`: Feature-sliced modules containing specific business logic, state management, and services (like the AI generator).
- `lib/`: General utility functions.
- `supabase/`: Database migrations for the Supabase PostgreSQL database.
- `e2e/`: End-to-end tests written with Playwright.
- `__tests__/`: Unit and integration tests written with Jest and React Testing Library.
- `.github/workflows/`: CI/CD pipelines managed with GitHub Actions.

## Core Modules

### `AI Flashcard Generation`

- **Role:** This is the core feature of the application. It takes user-pasted text and uses an AI model to generate question-and-answer pairs for flashcards.
- **Key Files/Areas:**
  - `app/api/flashcards-suggestions/route.ts`: The API endpoint that receives the text to be processed.
  - `features/ai-generator/services/flashcardsSuggestionService.ts`: The service class that contains the main logic. It communicates with the AI service, processes the response, and caches the suggestions.
  - `features/ai-generator/services/suggestionsCache.ts`: An in-memory cache for handling suggestions before they are accepted or rejected by the user.
- **Recent Focus:** The underlying logic appears stable. Recent development has been focused on the surrounding infrastructure (CI/CD, Docker).

### `User Authentication & Database`

- **Role:** Manages user accounts, sessions, and all database interactions.
- **Key Files/Areas:**
  - `middleware.ts`: Handles route protection and session management using Supabase SSR.
  - `supabase/migrations/`: Contains the SQL files that define the database schema. All database changes should be managed through new migration files.
  - `utils/supabase/`: Supabase client helper functions for server and client components.
- **Recent Focus:** The initial schema is in place. As new features are added, this area will evolve.

### `CI/CD & Testing`

- **Role:** Ensures code quality and automates deployments.
- **Key Files/Areas:**
  - `.github/workflows/pull-request.yml`: Defines the checks that run on every PR, including linting, unit tests, and end-to-end tests.
  - `playwright.config.ts` & `jest.config.js`: Configuration for the testing frameworks.
  - `Dockerfile` & `.github/workflows/main.yml`: Configuration for building and deploying the application via Docker and Vercel.
- **Recent Focus:** This has been the main area of recent activity, with a lot of work on Dockerizing the application and setting up deployment workflows.

## Key Contributors

- **yulian911:** Appears to be the lead/sole developer, focusing heavily on infrastructure, CI/CD, and initial feature implementation.

## Overall Takeaways & Recent Focus

- The project has a solid technical foundation with a modern, popular tech stack.
- There is a strong emphasis on automated testing and CI/CD from the outset.
- The main recent focus has been on infrastructure (Docker, Vercel deployment), indicating a push towards a stable, deployable MVP.
- The core feature is the AI-powered flashcard generation, which is a key area of complexity.

## Potential Complexity/Areas to Note

- **AI Integration:** The `FlashcardsSuggestionService` relies on a specific prompt sent to OpenRouter.ai and expects a specific JSON format in return. This can be brittle and may require careful error handling and monitoring.
- **Spaced Repetition System (SRS):** This is a declared feature in the `README.md` but the implementation details were not found during this exploration. The logic for scheduling card reviews can be complex and will be important to understand.
- **Environment Setup:** The setup requires keys for multiple services (Supabase, OpenRouter). The process for setting up the Supabase database (running migrations) is not yet documented in the `README.md`.

## Questions for the Team

1.  What is the plan for handling Supabase database migrations for new developers? Should they use the Supabase CLI to run local migrations?
2.  Are there any guidelines or best practices for writing prompts for the AI service in `FlashcardsSuggestionService`?
3.  Where is the implementation for the Spaced Repetition System (SRS) logic located?
4.  What is the preferred workflow for adding new UI components? Should they always be based on Radix primitives?
5.  What is the strategy for monitoring the AI service integration for errors or unexpected responses?
6.  Are there plans to support other AI models through OpenRouter besides `gpt-3.5-turbo`?

## Next Steps

1.  Complete the **Development Environment Setup** below to get the project running locally.
2.  Explore the `features/ai-generator` module to fully understand the AI suggestion workflow.
3.  Run the test suites (`npm run test` and `npm run test:e2e`) to see how they work and what they cover.
4.  Review the database schema in the `supabase/migrations` directory to understand the data model.

## Development Environment Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd fiszki_v2
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Supabase:**
    - Create a new project on [Supabase](https://supabase.com/).
    - Get your project's `URL` and `anon key`.
    - (Instruction needed) Ask the team for instructions on how to run the existing database migrations from the `supabase/migrations` directory against your new Supabase project. You will likely need to use the [Supabase CLI](https://supabase.com/docs/guides/cli).
4.  **Set up OpenRouter:**
    - Create an account on [OpenRouter.ai](https://openrouter.ai/).
    - Get your API Key.
5.  **Create Environment File:**

    - Create a file named `.env.local` in the root of the project.
    - Add the following variables, replacing the placeholder values with your keys:

      ```
      NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
      NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
      OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY

      # Optional, for running e2e tests
      E2E_EMAIL=test@example.com
      E2E_PASSWORD=your-secure-password
      ```

6.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running at `http://localhost:3000`.

## Helpful Resources

- **Next.js:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **Supabase:** [https://supabase.com/docs](https://supabase.com/docs)
- **Tailwind CSS:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Playwright:** [https://playwright.dev/docs/intro](https://playwright.dev/docs/intro)
- **Radix UI:** [https://www.radix-ui.com/primitives/docs/overview/introduction](https://www.radix-ui.com/primitives/docs/overview/introduction)
- **Zustand:** [https://docs.pmnd.rs/zustand/getting-started/introduction](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **TanStack Query:** [https://tanstack.com/query/latest/docs/react/overview](https://tanstack.com/query/latest/docs/react/overview)
