# DeepNotes – Full Stack Exercise for Ensolvers (by pschonffeldt)

A simple full-stack notes application built as a SPA with Next.js (frontend) and NestJS + Prisma + PostgreSQL (backend).

The app lets you:

- Create, edit, delete notes
- Archive / unarchive notes
- Create categories (tags)
- Assign categories to notes
- Filter notes by category (for both active and archived lists)

It is structured as two separate apps:

- backend/ – NestJS REST API + Prisma + PostgreSQL
- frontend/ – Next.js SPA consuming the REST API

---

## Phase 1 & Phase 2 Checklist

Phase 1 – Notes (mandatory)

- [x] Create notes (title + content)
- [x] Edit notes
- [x] Delete notes
- [x] Archive notes
- [x] Unarchive notes
- [x] List active notes
- [x] List archived notes
- [x] Data persisted in a relational DB via Prisma + PostgreSQL (no in-memory storage).

Phase 2 – Categories & filtering (extra points)

- [x] Create categories (tags)
- [x] Enforce unique category names (DB + backend validation)
- [x] Add/remove categories from notes (many-to-many)
- [x] Filter notes by category (active list)
- [x] Filter notes by category (archived list)

Architecture / other requirements

- [x] SPA architecture: frontend and backend are separate apps
- [x] Backend exposes a REST API
- [x] Backend is separated into layers:
  - Controllers
  - Services
  - Repositories using Prisma
- [x] Uses an ORM (Prisma) against PostgreSQL
- [x] Code hosted in a single repository with folders:
  - backend/
  - frontend/
- [x] One-command startup script (./run.sh) for Linux/macOS:
  - Sets up env files
  - Runs Prisma migrations
  - Starts backend + frontend
- [x] README with stack, versions and run instructions
- [x] Backend automated tests with Jest for:
  - App controller
  - Categories service
  - Notes service (with mocked repository)

---

## 1. Tech Stack & Versions

### Frontend

- Framework: Next.js 16 (App Router, app/ directory)
- Language: TypeScript
- UI: React + utility-class styling (Tailwind-like classes, no Tailwind runtime)
- Helpers: clsx for class name composition
- Dev server: next dev
- Package manager: npm

### Backend

- Framework: NestJS 11
- Language: TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Testing: Jest + @nestjs/testing
- Dev server: nest start --watch
- Package manager: npm

### Runtime

- Node.js: e.g. v20.x (check with node -v)
- npm: e.g. 10.x (check with npm -v)
- OS: Tested on macOS; should work on any Linux/macOS environment with Node + PostgreSQL.

---

## 2. Project Structure

note-challenge/
├── backend/ # NestJS + Prisma API (REST backend)
│ ├── prisma/
│ │ ├── schema.prisma # Data model (Note, Category, NoteCategory)
│ │ └── migrations/ # Prisma migrations for PostgreSQL
│ ├── src/
│ │ ├── app.controller.ts
│ │ ├── app.module.ts
│ │ ├── notes/ # Notes module
│ │ │ ├── notes.controller.ts
│ │ │ ├── notes.service.ts
│ │ │ └── notes.repository.ts
│ │ └── categories/ # Categories module
│ │ ├── categories.controller.ts
│ │ ├── categories.service.ts
│ │ └── dto/
│ │ └── create-category.dto.ts
│ ├── test/ # (Optional) e2e test config
│ └── package.json
│
├── frontend/ # Next.js SPA (App Router)
│ ├── app/
│ │ ├── page.tsx # Active notes view
│ │ ├── archived/
│ │ │ └── page.tsx # Archived notes view
│ │ ├── categories/
│ │ │ └── page.tsx # Category management view
│ │ ├── lib/
│ │ │ └── api.ts # REST API client (fetch wrapper)
│ │ └── components/
│ │ ├── alert.tsx # Shared alert banner (success/error)
│ │ ├── button.tsx # Shared <Button> component
│ │ └── button-link.tsx # <ButtonLink> wrapper around <Link>
│ └── package.json
│
├── run.sh # One-command bootstrap (backend + frontend)
└── README.md

---

## 3. How to Run the App Locally

### 3.1 One-command start (recommended)

From the project root (where run.sh lives):

```bash
./run.sh
```

What this script does:

- Ensures backend/.env exists

  - If it does not exist, it creates a template with a placeholder DATABASE_URL and exits with a message telling you to edit it.

- Ensures frontend/.env.local exists with
  NEXT_PUBLIC_API_URL="http://localhost:3001".
- Installs dependencies in backend/ and frontend/ (npm install).
- Runs Prisma migrations on the configured PostgreSQL database:

  - Uses npm run prisma:migrate:deploy from backend/package.json.

- Starts:

  - NestJS backend on http://localhost:3001
  - Next.js frontend on http://localhost:3000

### 3.2 First run note

If backend/.env didn’t exist, the script will create it with:

at env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/notes_app"

Edit backend/.env to set a valid DATABASE_URL for your PostgreSQL instance, then run ./run.sh again.

Once the script finishes, you can access:

- Frontend: http://localhost:3000
- Backend health check (optional): http://localhost:3001

---

### 3.3 Manual: Backend (NestJS API)

If you prefer to run pieces manually, you can:

1. Configure PostgreSQL and .env

Create a database, for example:

notes_app

Then in backend/.env:

at env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/notes_app"

2. Install dependencies

```bash
cd backend
npm install
```

3. Run Prisma migrations

```bash
npm run prisma:migrate:deploy
```

4. Start the backend

```bash
npm run start:dev
```

Backend is now available at:

http://localhost:3001

---

### 3.4 Manual: Frontend (Next.js)

1. Configure API base URL

Create frontend/.env.local:

```bash
cd frontend
touch .env.local
```

Add:

at env
NEXT_PUBLIC_API_URL="http://localhost:3001"

2. Install dependencies

```bash
npm install
```

3. Start the dev server

```bash
npm run dev
```

Frontend is now available at:

http://localhost:3000

---

## 4. System Overview & Architecture

This section explains how the system works end-to-end: data model, backend layers, frontend flow, and where each user story lives 🥰.

### 4.1 User Stories vs. Features

#### Phase 1 (Core notes)

As a user, I want to be able to create, edit, and delete notes.

- Backend:

  - POST /notes
  - PUT /notes/:id
  - DELETE /notes/:id

- Frontend:

  - Active Notes page (app/page.tsx):

    - “New note” form at the top.
    - Edit/delete buttons on each note.

As a user, I want to archive/unarchive notes.

- Backend:

  - PATCH /notes/:id/archive
  - PATCH /notes/:id/unarchive

- Frontend:

  - Active Notes page:

    - Archive button per note.

  - Archived page:

    - Unarchive button per note.

As a user, I want to list my active notes.

- Backend: GET /notes?archived=false
- Frontend: Active Notes page (/).

As a user, I want to list my archived notes.

- Backend: GET /notes?archived=true
- Frontend: Archived Notes page (/archived).

#### Phase 2 (Categories & filtering)

As a user, I want to be able to add/remove categories to notes.

- Backend:

  - Many-to-many via Prisma NoteCategory.
  - PATCH /notes/:id/categories with an array of category IDs.

- Frontend:

  - Active Notes page:

    - When creating a note, you can tick categories.
    - “Categories” button for each existing note opens a small category editor (checkbox list).

  - Archived Notes page:

    - Same category edit UI as active notes.

As a user, I want to be able to filter notes by category.

- Backend:

  - GET /notes?archived=false&categoryId=3
  - GET /notes?archived=true&categoryId=3

- Frontend:

  - Both Active and Archived pages:

    - Dropdown “Filter by category” that refetches notes with selected categoryId.

---

### 4.2 Data Model (Prisma schema)

Core entities:

- Note
- Category
- NoteCategory (join table)

Note

- id (Int, PK, autoincrement)
- title (String)
- content (String)
- archived (Boolean, default false)
- createdAt (DateTime, @default(now()))
- updatedAt (DateTime, @updatedAt)
- Relation: categories NoteCategory[]

Category

- id (Int, PK, autoincrement)
- name (String, @unique)
- Relation: notes NoteCategory[]

NoteCategory

- Composite PK [noteId, categoryId]
- Foreign keys:

  - noteId → Note.id
  - categoryId → Category.id

This allows:

- A note to have multiple categories.
- A category to belong to multiple notes.
- Enforced uniqueness of category names at DB level.

---

### 4.3 Backend Architecture (NestJS – components & interfaces)

The backend is organized as a set of components with clear provided/required interfaces, following a layered architecture:

- Controller layer – “HTTP API component”

  - Provided interface (ball / lollipop):
    - A REST/HTTP interface that the frontend can call:  
      GET /notes, POST /notes, PATCH /notes/:id/archive, etc.
    - This is the contract exposed to the outside world.
  - Required interface (socket):
    - An application-level service interface, e.g. NotesService and CategoriesService.
    - Controllers depend on these services and never talk directly to the database.

- Service layer – “application logic component”

  - Provided interface (ball):
    - Operations like createNote, findAllNotes, archiveNote, createCategory, updateCategory, etc.
    - Encapsulates business rules: validation, orchestration, error handling (e.g. throwing NotFoundException, mapping Prisma P2002 → ConflictException).
  - Required interface (socket):
    - A persistence interface, e.g. NotesRepository, CategoriesRepository (implemented via Prisma).
    - Services declare what they need from persistence (save, query, delete), but don’t know _how_ it’s implemented.

- Repository / Prisma layer – “persistence component”

  - Provided interface (ball):
    - Low-level data access operations:
      - findAll({ archived, categoryId })
      - create(noteData)
      - setArchived(id, archived)
      - delete(id)
      - setCategories(noteId, categoryIds[])
    - These methods are the concrete implementation of the “storage” interface required by services.
  - Required interface (socket):
    - Prisma Client (PrismaService), which knows how to talk to PostgreSQL.

Conceptually, you can see the stack like this:

[ Browser / Frontend ]
│
│ HTTP (provided by controllers)
▼
[ Controllers ] --requires--> [ Services ] --requires--> [ Repositories ] --requires--> [ Prisma / PostgreSQL ]
(provided: REST) (provided: app API) (provided: DB API) (provided: DB driver)

- Each layer only depends “downwards” on required interfaces (sockets).
- Each layer exposes a clean provided interface (ball) upward:

  - Frontend plugs into controller’s provided HTTP API.
  - Controllers plug into services.
  - Services plug into repositories.
  - Repositories plug into Prisma/PostgreSQL.

- This separation makes it easier to:
  - Swap implementations (e.g. change repository internals without touching controllers).
  - Unit-test services and repositories by mocking their required interfaces.
  - Reason about responsibilities: controllers = transport, services = business logic, repositories = persistence.

#### Notes module

- notes.controller.ts

  - POST /notes – create note
  - GET /notes – list notes (supports archived and categoryId query params)
  - GET /notes/:id – fetch a single note
  - PUT /notes/:id – update title/content
  - DELETE /notes/:id – delete note
  - PATCH /notes/:id/archive – mark note as archived
  - PATCH /notes/:id/unarchive – mark note as active
  - PATCH /notes/:id/categories – set categories for a note

- notes.service.ts

  - Methods like:

    - create(dto)
    - findAll(archived, categoryId?)
    - findOne(id)
    - setArchived(id, archived)
    - remove(id)

  - Ensures:

    - Notes exist before delete or archive/unarchive (throws NotFoundException otherwise).

  - Uses the repository for DB access.

- notes.repository.ts

  - Thin wrapper around Prisma, e.g.:

    - create({ title, content, archived })
    - findAll({ archived, categoryId? })
    - findOne(id)
    - setArchived(id, archived)
    - delete(id)
    - setCategories(noteId, categoryIds[])

#### Categories module

- categories.controller.ts

  - GET /categories – list all categories
  - POST /categories – create category
  - PATCH /categories/:id – update name
  - DELETE /categories/:id – delete category

- categories.service.ts

  - Handles creation and update with validation:

    - Catches Prisma P2002 (unique constraint) and throws ConflictException with:

      - "This category name is already in use. Categories must be unique."

  - Gives frontend meaningful HTTP 409 + message instead of generic errors.

- PrismaService

  - Shared wrapper around Prisma client, injected into services/repositories.

---

### 4.4 Frontend Architecture (Next.js SPA)

The frontend is a SPA using the Next.js App Router with three main pages:

1. Active Notes – / (app/page.tsx) - / Where we see the listed notes
2. Archived Notes – /archived (app/archived/page.tsx) - / Where we see the archived notes
3. Manage Categories – /categories (app/categories/page.tsx) - / Where we create and edit categories

All HTTP calls go through app/lib/api.ts.

#### app/lib/api.ts

Contains small fetch helpers, for example:

- fetchNotes(archived: boolean, categoryId?: number)
- createNote({ title, content })
- updateNote(id, { title, content })
- deleteNote(id)
- archiveNote(id)
- unarchiveNote(id)
- setNoteCategories(noteId, categoryIds: number[])
- fetchCategories()
- createCategory(name: string)
- updateCategory(id: number, name: string)
- deleteCategory(id: number)

It uses NEXT_PUBLIC_API_URL from .env.local so the base URL is not hard-coded.

#### Active Notes page (app/page.tsx)

Features:

- New note form

  - Title (input) + Content (textarea).
  - Category list with checkboxes to tag the note on creation.
  - “Save note” button:

    - Disabled while title or content is empty.

  - On submit:

    - Calls createNote.
    - If categories are selected, calls setNoteCategories with the new note ID.
    - Shows success/error banners via <Alert />.

- Active notes list

  - Each note:

    - Shows title and content.
    - Shows current categories as pills.
    - Has buttons:

      - Edit – inline editing of title/content.
      - Categories – opens category edit mode with checkboxes.
      - Archive – moves note to archived.
      - Delete – removes note permanently.

- Filter by category

  - Dropdown with:

    - “All categories”
    - Each category

  - When changed:

    - Triggers a new fetchNotes(false, categoryId?).

- Meta info

  - Small text showing how many active notes exist for the current filter.

#### Archived Notes page (app/archived/page.tsx)

Same structure as active notes, but:

- Uses fetchNotes(true, categoryId?).
- Actions per note:

  - Edit – inline.
  - Categories – edit categories.
  - Unarchive – sets archived=false and moves back to active list.
  - Delete – permanent delete.

- Shows:

  - “Showing X archived notes for this filter.”
  - Which updates X when changing the filter from "All categories" to other.

#### Categories page (app/categories/page.tsx)

Features:

- Add new category

  - Input + “Add category” button.
  - Button disabled if:

    - Input is empty or only spaces.

  - Validations:

    - Empty → "Add category" button is disabled
    - Empty (only spaces) → “Category name cannot be only spaces.”
    - Duplicate name → message from backend:

      - "This category name is already in use. Categories must be unique."

  - Uses <Alert /> for both error/success.

- Existing categories list

  - Shows each category with:

    - Name.
    - Edit → inline rename.
    - Delete.

  - Top-right:

    - “You have X categories.”

---

### 4.5 Shared UI Components

To keep styles consistent, some components have been created:

- components/button.tsx

  - Generic <Button> wrapper around <button>.
  - Uses shared buttonClasses and clsx to apply:

    - Base style (blue primary).
    - Variants for danger/warn/neutral, etc.

  - Used across all pages for actions like “Save note”, “Edit”, “Archive”, “Delete”, etc.

- components/button-link.tsx

  - Wraps Next.js <Link> but styled as a button.
  - Uses the same buttonClasses helper for a consistent look.
  - Used for navigation:

    - “View archived”
    - “View active”
    - “Manage categories”
    - “Back to notes”

- components/alert.tsx

  - Small banner component:

    - variant="success" → green.
    - variant="error" → red.

  - Accepts message string and hides when message is null/empty.
  - Used on active, archived and categories pages.

---

### 4.6 Error Handling & Validation

Backend

- Categories:

  - Category.name is @unique at DB level.
  - categories.service.ts catches Prisma P2002 and throws ConflictException.
  - The client sees a friendly error message and HTTP 409 status instead of generic “Internal server error”.

- Notes:

  - NotesService.findOne(id):

    - If note does not exist, throws NotFoundException("Note X not found").

  - remove, setArchived, etc. rely on findOne to avoid silent failures.

Frontend

- Prevent invalid input:

  - “Save note” disabled until both title and content have text.
  - “Add category” disabled when input is empty.
  - “Save” on category edit disabled if input is empty.

- Display clear feedback:

  - Error messages shown in red <Alert />.
  - Success messages in green <Alert /> (e.g. “Category created successfully.”).
  - Duplicate category name error is surfaced exactly from backend for clarity.

---

## 5. Testing

The backend uses Jest and Nest’s testing tools.
First time using it, can't wait to learn more about it.

### 5.1 Running tests

From backend/:

```bash
npm test
```

What this runs:

- src/app.controller.spec.ts

  - Basic test for the app controller / root route.

- src/categories.service.spec.ts

  - Tests category creation and update.
  - Verifies that duplicate names throw ConflictException and proper messages.

- src/notes/notes.service.spec.ts

  - Uses a mocked repository instead of the real Prisma client.
  - Tests:

    - create – passes { title, content }, expects repository to receive { title, content, archived: false }.
    - findAll – passes { archived, categoryId } filters.
    - setArchived – ensures findOne is called and then setArchived on the repository.
    - remove – ensures findOne is called before deleting.

Optional commands:

```bash
npm run test:watch # watch mode
npm run test:cov # coverage report
```

(only needed if you want to iterate on tests or see coverage.)

---

## 6. Useful Scripts

From the backend folder:

- npm run start:dev – start NestJS in watch mode.
- npm run prisma:migrate:deploy – apply Prisma migrations.
- npm test – run Jest unit tests.

From the frontend folder:

- npm run dev – start Next.js dev server.

From the project root:

- ./run.sh – one-command setup + start:

  - Prepares env files.
  - Runs migrations.
  - Starts backend + frontend.

---

## 7. Architecture Diagram & Screenshots

### 7.1 Logical / Component View

The main architecture diagram for this project lives at:

- docs/diagrams/deepnotes-architecture.png

It shows:

- Frontend (Next.js SPA)

  - Shared UI components: Alert, Button, ButtonLink
  - Page components: ActiveNotesPage, ArchivedPage, CategoriesPage
  - API Client (app/lib/api.ts) used by all pages to call the backend.

- Backend (NestJS API)
  - NotesModule with NotesController, NotesService, NotesRepository (Prisma)
  - CategoriesModule with CategoriesController, CategoriesService, CategoriesRepository (Prisma)
  - Shared PrismaService (prisma.service.ts)
  - PostgreSQL (notes_app) database accessed via Prisma Client.

Rendered in this README:

![DeepNotes – Logical & Component View](UPDATE WITH IMAGE URL, NEED TO GET IT FROM GITHUB ITSELF)

---

## 8. Notes & Possible Improvements

Potential future improvements beyond the exercise requirements:

- Authentication

  - Add login and per-user notes (each user sees only their own notes and categories).
  - I considered adding it this time, as I recentely implemented on my other project RecetApp, but decided not to do it this time.

- UX

  - Auto-hide success banners after a few seconds.
    - Usin a toas that pops from the top right of the screen and dissapears after X seconds.
  - Busy/loading states on buttons to prevent double-submits.
  - Keyboard shortcuts for saving notes or focusing the title/content.

- Features

  - Text search and pagination for large note collections.
  - Sort notes by last updated date, title, or creation date.

- Deployment
  - Hosted version (Render/Heroku/Fly.io/Vercel + managed Postgres).
  - Add the live URL to the README under a “Live Demo” section.

For this challenge, the app:

- Implements all Phase 1 requirements (notes + archive/unarchive + lists).
- Implements all Phase 2 requirements (categories, tag application, and filtering).
- Uses PostgreSQL + Prisma as a relational DB with ORM.
- Is structured as a real SPA + separate backend, using a REST API and service/repository layers.
- Provides a single-command startup (./run.sh) for Linux/macOS as requested.

---

## 9. API Overview

Base URL (local development):

http://localhost:3001

### Notes

#### GET /notes

List notes.

Query params:

- archived (required): "true" or "false"
- categoryId (optional): number

Examples:

- GET /notes?archived=false – all active notes
- GET /notes?archived=true&categoryId=3 – archived notes with category ID 3

#### POST /notes

Create a new note.

Request body:

json
{
"title": "My note",
"content": "Something important"
}

Response: created Note with id, timestamps, and archived: false.

#### GET /notes/:id

Get a single note by id.

- GET /notes/1

#### PUT /notes/:id

Update note title/content.

Request body:

json
{
"title": "Updated title",
"content": "Updated content"
}

#### DELETE /notes/:id

Delete a note permanently.

#### PATCH /notes/:id/archive

Mark a note as archived.

- PATCH /notes/1/archive

#### PATCH /notes/:id/unarchive

Mark a note as active.

- PATCH /notes/1/unarchive

#### PATCH /notes/:id/categories

Set the full list of categories for a note.

Request body:

json
{
"categoryIds": [1, 2, 3]
}

This replaces existing categories for the note.

---

### Categories

#### GET /categories

List all categories.

#### POST /categories

Create a new category.

Request body:

json
{
"name": "Work"
}

Possible responses:

- 201 Created with the new category.
- 409 Conflict with message:
  "This category name is already in use. Categories must be unique."

#### PATCH /categories/:id

Rename a category.

Request body:

json
{
"name": "Personal"
}

Same 409 Conflict behavior if the new name already exists.

#### DELETE /categories/:id

Delete a category.

---

## 10. Troubleshooting

### 10.1 Port already in use (3000 / 3001)

If you see errors like:

- EADDRINUSE: address already in use :::3001
- Or Next.js warning that port 3000 is in use

You can:

1. Stop existing processes

On macOS/Linux, from the project root:

```bash

# Check if something is listening on port 3000 or 3001

lsof -i :3000
lsof -i :3001
```

# Kill the process (replace PID with the number from lsof output)

kill -9 PID

Then:

```bash
./run.sh
```

2. Or simply close old terminal tabs where backend/frontend dev servers are still running.

---

### 10.2 Database connection issues

If Prisma cannot connect to PostgreSQL, check:

1. backend/.env has a valid DATABASE_URL:

   env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/notes_app"

2. PostgreSQL is running and the database exists:

   ```bash
   psql -l # list DBs
   createdb notes_app # if needed
   ```

3. Re-run migrations:

   ```bash
   cd backend
   npm run prisma:migrate:deploy
   ```

---

### 10.3 Frontend cannot reach backend

If the frontend shows errors fetching notes/categories:

1. Make sure backend is actually running on http://localhost:3001.
2. Confirm frontend/.env.local has:

   env
   NEXT_PUBLIC_API_URL="http://localhost:3001"

3. Restart the frontend dev server:

   ```bash
   cd frontend
   npm run dev
   ```

---

### 10.4 Jest test failures

If running npm test in backend/ fails:

- Make sure dependencies are installed:

  ```bash
  cd backend
  npm install
  ```

- Double-check Node version (Node 20+ recommended).
- If you add new services/modules, either:

  - Add tests for them, or
  - Update existing tests to reflect the new behavior.

All tests should pass with:

```bash
cd backend
npm test
```

---

## 11. Architecture

### 11.1 High-level system view

DeepNotes is a client–server system:

- Frontend: Next.js SPA (frontend/) running in the browser.
- Backend: NestJS REST API (backend/) exposing HTTP endpoints.
- Database: PostgreSQL, accessed through Prisma ORM.

The frontend talks to the backend only via HTTP/JSON; the backend is responsible for all persistence and business logic.

```mermaid
graph TD
  Browser[Next.js SPA<br/>(frontend)] -->|HTTP / JSON| API[REST API<br/>(NestJS backend)]

  subgraph Backend
    NC[NotesController] --> NS[NotesService]
    CC[CategoriesController] --> CS[CategoriesService]

    NS --> NR[NotesRepository<br/>(Prisma)]
    CS --> CR[CategoriesRepository<br/>(Prisma)]
  end

  NR --> DB[(PostgreSQL)]
  CR --> DB[(PostgreSQL)]
```

### 4.2 Backend layering (provided / required interfaces)

The backend is structured as a layered monolith with clear provided (ball) and required (socket) interfaces:

- Controller layer – HTTP interface (provided)

  - Files: notes.controller.ts, categories.controller.ts
  - Provides a REST API: GET /notes, POST /notes, PATCH /notes/:id/archive, GET /categories, etc.
  - Requires the application services (NotesService, CategoriesService) to execute use cases.

- Service layer – application logic (provided)

  - Files: notes.service.ts, categories.service.ts
  - Provides methods like create, findAll, setArchived, remove, createCategory, updateCategory.
  - Encapsulates business rules:
    - Enforcing archived=false on new notes.
    - Throwing NotFoundException when a note does not exist.
    - Mapping Prisma P2002 (unique constraint) to ConflictException with a user-friendly message.
  - Requires repository/persistence interfaces (e.g. NotesRepository, PrismaService) to read/write data.

- Repository / Prisma layer – persistence (provided)

  - Files: notes.repository.ts, prisma.service.ts, Prisma schema.
  - Provides low-level data operations:
    - findAll({ archived, categoryId })
    - create({ title, content, archived })
    - setArchived(id, archived)
    - delete(id)
    - setCategories(noteId, categoryIds[])
  - Requires Prisma Client, which knows how to interact with PostgreSQL.

[ Browser / Next.js SPA ]
│
▼ (HTTP / JSON)
[ Controllers (NestJS) ] ──requires──► [ Services ] ──requires──► [ Repositories / Prisma ] ──► [ PostgreSQL ]
(provided: REST) (provided: app API) (provided: DB API)

- The frontend only sees the REST API (controllers’ provided interface).
- Controllers depend on services, not on the database.
- Services depend on repositories/Prisma, not on SQL details.
- Repositories are the only place that know the actual data access and Prisma queries.

### 12. Contact

Built by Pablo Schonffeldt (pschonffeldt) as part of the Ensolvers recruitment challenge.

If you need any clarification about:

- Architecture decisions
- Trade-offs in the implementation
- How to extend this codebase

please feel free to reach out via the channels provided in the application.

Hope you like it 🤗
