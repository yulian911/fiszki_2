Intelligent Flashcards
Project Description
Intelligent Flashcards is a web-based application designed to simplify the creation of educational flashcards using artificial intelligence (AI). The application addresses the challenges of time-consuming manual flashcard creation by generating flashcards (question-answer pairs) from pasted text. Users can review, edit, or manually create flashcards, organize them into decks, and benefit from a basic spaced repetition system (SRS) for effective learning. The app also includes essential user account features such as registration, login, and session management.

Tech Stack
Frontend: Next.js, React, TypeScript 5, Tailwind CSS 4, and Shadcn/ui for accessible UI components.
Backend: Supabase, offering PostgreSQL database and built-in authentication.
AI Integration: openrouter.ai which enables communication with multiple AI models (e.g., OpenAI, Anthropic, Google).
CI/CD & Hosting: Github Actions for CI/CD pipelines and DigitalOcean for hosting using Docker.
Getting Started Locally
Prerequisites
Node.js (LTS version recommended)
npm or yarn package manager
Installation
Clone the repository:
git clone <repository_url>
Navigate to the project directory:
cd fiszki
Install dependencies:
npm install
Start the development server:
npm run dev
Available Scripts
npm run dev: Runs the app in development mode with Next.js using turbopack.
npm run build: Builds the app for production.
npm run start: Starts the production server.
npm run lint: Lints the project using ESLint.
Project Scope
The MVP of Intelligent Flashcards includes the following functionalities:

AI-based Flashcard Generation: Users can paste text (up to a predefined limit) to generate flashcards via AI, which are presented as question-answer pairs.
Manual Flashcard Creation and Editing: Users can manually create and edit flashcards, including formatting options and tagging.
Deck Management: Organize flashcards into decks for better categorization and study.
Spaced Repetition System (SRS): A built-in SRS algorithm facilitates effective learning through scheduled review sessions.
User Account Management: Registration, login, and secure handling of user data, enabling personalized flashcard libraries and study sessions.
Project Status
This project is currently in the MVP stage and is under active development.

License
This project is licensed under the MIT License.
