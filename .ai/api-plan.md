# REST API Plan

## 1. Resources

- **Users** (`Users`)
- **Flashcards Sets** (`FlashcardsSet`)
- **Flashcards** (`Flashcards`)
- **Flashcards Set Shares** (`FlashcardsSet_Shares`)
- **Tags** (`Tags`)
- **Flashcards Tags** (`Flashcards_Tags`)
- **Sessions** (`Sessions`)

## 2. Endpoints

### 2.1 Authentication

#### Register User

- Method: POST
- URL: /sign-up
- Description: Create a new user account
- Request:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPass123!",
    "passwordConfirmation": "StrongPass123!"
  }
  ```
- Response (201 Created):
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "timestamp"
  }
  ```
- Errors:
  - 400 Bad Request (validation errors)
  - 409 Conflict (email already registered)

#### Login User

- Method: POST
- URL: /sign-in
- Description: Authenticate and obtain a JWT
- Request:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPass123!"
  }
  ```
- Response (200 OK):
  ```json
  {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
  ```
- Errors:
  - 400 Bad Request (missing fields)
  - 401 Unauthorized (invalid credentials)
  - 429 Too Many Requests (rate limit)

### 2.2 Flashcards Sets

#### List Flashcards Sets

- Method: GET
- URL: /flashcards-sets
- Description: Get paginated list of user's sets
- Query Params:
  - page (int, default=1)
  - limit (int, default=20)
  - sortBy (e.g. name, createdAt)
  - status (pending|accepted|rejected)
- Headers: Authorization
- Response (200 OK):
  ```json
  {
    "data": [
      { "id": "uuid", "name": "Set 1", "status": "accepted", ... }
    ],
    "meta": { "page": 1, "limit": 20, "total": 50 }
  }
  ```

#### Create Flashcards Set

- Method: POST
- URL: /flashcards-sets
- Description: Create a new empty set
- Request:
  ```json
  { "name": "Biology Terms" }
  ```
- Response (201 Created): new set object
- Errors: 400 Bad Request

#### Get Flashcards Set

- Method: GET
- URL: /flashcards-sets/{setId}
- Description: Retrieve details and cards in set
- Response: set object with embedded "flashcards" array
- Errors: 404 Not Found, 403 Forbidden

#### Update Flashcards Set

- Method: PUT
- URL: /flashcards-sets/{setId}
- Request:
  ```json
  { "name": "New Name", "status": "accepted" }
  ```
- Response: updated set object
- Errors: 400, 403, 404

#### Delete Flashcards Set

- Method: DELETE
- URL: /flashcards-sets/{setId}
- Description: Delete set and its cards
- Response: 204 No Content
- Errors: 403, 404

### 2.3 Flashcards

#### List Flashcards

- Method: GET
- URL: /flashcards
- Description: Paginated list of user's flashcards
- Query Params:
  - setId
  - source (ai-full|ai-edit|manual)
  - tags (comma-separated)
  - page, limit, sortBy
- Response: similar to sets

#### Create Flashcard (Manual)

- Method: POST
- URL: /flashcards
- Request:
  ```json
  {
    "flashcardsSetId": "uuid",
    "question": "What is ...?",
    "answer": "Definition...",
    "source": "manual",
    "tags": ["tag1", "tag2"],
    "hint": "Optional hint"
  }
  ```
- Response (201 Created): card object
- Errors: 400, 403

#### Get Flashcard

- Method: GET
- URL: /flashcards/{id}
- Response: card object
- Errors: 403, 404

#### Update Flashcard

- Method: PUT
- URL: /flashcards/{id}
- Request: same as create (excluding source modifications if needed)
- Response: updated card

#### Delete Flashcard

- Method: DELETE
- URL: /flashcards/{id}
- Response: 204 No Content

### 2.4 AI Flashcard Generation

#### Generate Suggestions

- Method: POST
- URL: /flashcards-suggestions
- Description: Submit text to AI for suggestion
- Request:
  ```json
  { "text": "Long text..." }
  ```
- Response (202 Accepted):
  ```json
  { "suggestions": [{ "id": "temp-id", "question": "...", "answer": "..." }] }
  ```

#### Accept Suggestion

- Method: POST
- URL: /flashcards-suggestions/{suggestionId}/accept
- Request:
  ```json
  { "flashcardsSetId": "uuid" }
  ```
- Response: created flashcard with source "ai-full" or "ai-edit"

#### Reject Suggestion

- Method: POST
- URL: /flashcards-suggestions/{suggestionId}/reject
- Response: 204 No Content

#### Edit Suggestion

- Method: PUT
- URL: /flashcards-suggestions/{suggestionId}
- Request:
  ```json
  { "question": "Edited?", "answer": "Edited?" }
  ```
- Response: updated suggestion

### 2.5 Tags

- CRUD endpoints similar to flashcards (GET /tags, POST /tags, etc.)
- Tags auto-created on card creation if not existing

### 2.6 Sessions (SRS)

#### Start Session

- Method: POST
- URL: /sessions
- Description: Begin a learning session
- Request:
  ```json
  { "flashcardsSetId": "uuid", "tags": ["tag1"], "limit": 20 }
  ```
- Response (201 Created):
  ```json
  { "sessionId": "uuid", "cards": [{ "id": "uuid", "question": "...?" }] }
  ```

#### Reveal Answer

- Client action; no separate endpoint

#### Evaluate Card

- Method: PATCH
- URL: /sessions/{sessionId}/cards/{cardId}/evaluate
- Request:

  ```json
  { "rating": "easy" }


  // or "hard", "medium"
  ```

- Response (200 OK): next card or session summary

#### End Session

- Method: DELETE
- URL: /sessions/{sessionId}
- Response: 204 No Content

#### Get Statistics

- Method: GET
- URL: /stats
- Description: Basic user progress metrics
- Response:
  ```json
  {
    "dueToday": 15,
    "totalCards": 120,
    "sessionsHistory": [{ "date": "...", "count": 20 }]
  }
  ```

## 3. Authentication and Authorization

- JWT via Supabase Auth
- All endpoints (except /auth/\*) require `Authorization: Bearer <token>`
- Row-level security (RLS) in Supabase ensures users access only own data and shared sets
- Rate limiting: 100 requests/min per user (adjustable)

## 4. Validation and Business Logic

- **Users**: email format validation; password min length 8; unique email
- **FlashcardsSet.status**: enum {pending, accepted, rejected}
- **Flashcards.source**: enum {ai-full, ai-edit, manual}
- **Flashcards.question/answer**: non-empty
- **Tags.name**: unique, max length 100
- **Sessions**: user can only start sessions on owned or shared sets
- AI suggestions: temporary until accepted/rejected
- Pagination defaults: page=1, limit=20, max limit=100
- Sorting fields must be indexed (e.g., created_at, name)
