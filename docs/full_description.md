Okay, here is a detailed technical description of the project based on the provided file structure and code, focusing on the Next.js frontend (in `src/`) and the Express backend (in `backend/`).

**Overall Project Overview**

This project is a full-stack personal portfolio website. It allows showcasing skills, projects, professional experience, and personal information ("About Me"). It features a public-facing frontend built with Next.js (React) and a private admin interface for content management. The backend is an Express.js API that serves data stored in a MongoDB database. Authentication for the admin section is handled via JWT (JSON Web Tokens).

**Backend (Express in `backend/`)**

The backend is a RESTful API built using Node.js and the Express framework, written in TypeScript.

1.  **Core Framework & Setup (`app.ts`)**
    *   **Framework:** Express.js.
    *   **Language:** TypeScript, compiled to JavaScript for execution.
    *   **Entry Point:** `backend/src/app.ts` initializes the Express application.
    *   **Middleware:**
        *   `express.json()`: Parses incoming JSON request bodies.
        *   `cors`: Enables Cross-Origin Resource Sharing. Configured to allow requests from `https://fluttersystems.com` when `isOnline` is true, otherwise allows all origins (`*`). Handles standard methods (GET, POST, PUT, DELETE, OPTIONS) and allows `Content-Type` and `Authorization` headers.
        *   `dotenv`: Loads environment variables from a `.env` file (managed by `backend/src/scripts/setupEnv.ts`).
    *   **Routing:** API routes are modularized and imported from the `routes/` directory. A base route (`/portfolio`) can be prepended based on the `isOnline` flag.
    *   **Error Handling:**
        *   Handles 404 errors for undefined routes using `app.all('*', ...)`.
        *   A global error handler middleware catches errors, standardizes the response format (`status`, `message`, optional `stack` in development), and uses the custom `AppError` class (`utils/errorHandler.ts`).
        *   `catchAsync` utility (`utils/errorHandler.ts`) wraps asynchronous route handlers to pass errors to the global handler automatically.
    *   **Database Connection:** Connects to MongoDB using Mongoose via `connectDB` (`config/database.ts`) upon application startup.
    *   **Server:** Starts the Express server, listening on the port specified by `process.env.PORT` (defaulting to 5000). Includes graceful shutdown handling for `SIGTERM` and `SIGINT`.
    *   **Static Files & SPA Fallback:** Configured to serve static files (likely the built frontend) from a `dist` directory when `isOnline` is true and includes a fallback route (`app.get('*', ...)`) to serve `index.html` for client-side routing. *Note: There's a potential conflict as `app.listen` is called twice.*

2.  **Database (`config/database.ts`, `models/`)**
    *   **ODM:** Mongoose is used as the Object Data Mapper for MongoDB.
    *   **Connection:** `connectDB` establishes the connection using the `MONGODB_URI` environment variable. Includes basic error handling on connection failure.
    *   **Models:** Mongoose schemas define the structure and validation rules for the application's data entities:
        *   `AboutMe.ts`: Stores personal information (name, title, bio, contact, social links, image). Includes fields for both `imageUrl` (URL) and `imageData` (Base64 string). Uses `findOneAndUpdate` with `upsert: true` in the controller as typically only one document exists.
        *   `Project.ts`: Represents portfolio projects (title, description, technologies, image, links, date). Also supports `imageUrl` and `imageData`. Includes a `pre('save')` hook to ensure at least one image source is provided.
        *   `Skill.ts`: Defines skills with name, category (`frontend`, `backend`, `tools`, `other`), proficiency (1-5), and an optional icon string.
        *   `Experience.ts`: Represents work or professional experiences (title, company, timeframe, description, order for sorting).
    *   **Validation:** Schemas include type definitions, `required` constraints, `trim`, `enum`, `min`/`max` validators, and email format matching (`AboutMeSchema`).

3.  **Routing & Controllers (`routes/`, `controllers/`)**
    *   **Structure:** Routes are organized by resource (about, auth, experience, project, skill). Each route file defines endpoints and associates them with controller functions.
    *   **Controllers:** Contain the business logic for handling requests. They interact with Mongoose models to perform CRUD operations. Use `catchAsync` for handling asynchronous operations.
    *   **Validation:** `express-validator` (`body()`, `validationResult`) is used in some routes (e.g., `aboutRoutes`, `projectRoutes`, `skillRoutes`) to validate request bodies before they reach the controller logic.
    *   **Specific Routes:**
        *   `/api/auth`: Handles admin login (`/login`).
        *   `/api/about`: GET (public), PUT (admin only) for the single AboutMe document.
        *   `/api/projects`: GET all (public), POST (admin only), GET/:id (public), PATCH/:id (admin only), DELETE/:id (admin only).
        *   `/api/skills`: GET all (public), POST (admin only), GET/:id (public), PATCH/:id (admin only), DELETE/:id (admin only).
        *   `/api/experiences`: GET all (public), POST (admin only), GET/:id (public), PUT/:id (admin only), DELETE/:id (admin only).

4.  **Authentication & Authorization (`controllers/authController.ts`, `middleware/authMiddleware.ts`)**
    *   **Strategy:** Simple role-based access control (Admin only).
    *   **Login:** `authController.login` compares provided username/password against environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`).
    *   **Token:** If credentials match, it generates a JWT signed with `JWT_SECRET` (env variable), containing an `isAdmin: true` payload, with a 24-hour expiry.
    *   **Middleware:** `authMiddleware.adminAuth` protects admin-only routes. It extracts the JWT from the `Authorization: Bearer <token>` header, verifies it using `jwt.verify` and the `JWT_SECRET`. If valid, it attaches `isAdmin: true` to the `req` object; otherwise, it throws an `AppError` (401).

5.  **Scripts (`scripts/`)**
    *   `setupEnv.ts`: Generates a default `.env` file if one doesn't exist.
    *   `initDb.ts` / `initializeDb.ts`: Scripts to populate the database with initial/sample data for AboutMe, Projects, and Experiences if the collections are empty. Useful for setting up a new environment.
    *   `resetAboutCollection.ts`: Script to specifically drop and re-initialize the `AboutMe` collection, possibly used during schema changes.

**Frontend (Next.js/React in `src/`)**

The frontend is built using Next.js (App Router) with React and TypeScript, styled with Tailwind CSS.

1.  **Core Framework & Structure**
    *   **Framework:** Next.js 13+ using the App Router.
    *   **Language:** TypeScript (`.tsx` files).
    *   **Structure:** Follows the App Router convention:
        *   `app/`: Contains layouts (`layout.tsx`) and pages (`page.tsx` within subdirectories).
        *   `components/`: Reusable React components.
        *   `lib/`: Utility functions, particularly for authentication (`auth.ts`).
        *   `services/`: API interaction logic (`api.ts`).
        *   `types/`: TypeScript type definitions shared across the app.
        *   `utils/`: General utility functions (e.g., `imageUtils.ts`).
        *   `data/`: Fallback data (`fallback.ts`).
    *   **Routing:** Handled by Next.js based on the directory structure within `app/`. Client-side navigation uses `<Link>` from `next/link`.

2.  **UI Components (`components/`)**
    *   **Presentational Components:** `AboutSection`, `ProjectCard`, `SkillsGrid`, `ExperienceSection` are responsible for displaying data fetched from the API.
    *   **Navigation:** `Navigation.tsx` provides the main site navigation links. It dynamically checks admin status using `lib/auth.ts` to show/hide admin links and the logout button.
    *   **Admin Components:** `AdminHeader`, `AdminAboutManager`, `AdminExperienceManager`, `AdminProjectsManager`, `AdminSkillsManager` provide the UI and logic for CRUD operations within the admin dashboard (`/admin` page). These components typically include forms and interact with the API via `services/api.ts`.
    *   **Styling:** Tailwind CSS utility classes are used extensively for styling (e.g., `dark:bg-gray-900`, `rounded-lg`, `shadow-lg`, `py-12`, `px-4`). The `globals.css` file likely contains base Tailwind directives. Dark mode support is implemented (`dark:` prefix).
    *   **Markdown Rendering:** `react-markdown` is used in components like `AboutPage`, `AdminAboutManager`, `ExperienceSection`, and `AdminExperienceManager` to render Markdown content fetched from the backend (e.g., bio, descriptions).

3.  **Pages (`app/`)**
    *   **Server Components:** The main home page (`app/page.tsx`) is likely a Server Component, fetching initial data (`projects`, `skills`, `about`, `experiences`) directly on the server using `api.ts`.
    *   **Client Components:** Most other pages (`about`, `skills`, `projects`, `experiences`, `admin`, `admin/login`) are marked with `'use client'` because they rely on hooks (`useState`, `useEffect`, `useRouter`, `useSearchParams`), handle user interactions, manage state, and perform client-side data fetching/mutation.
    *   **Admin Pages:**
        *   `/admin/login`: Provides a form for admin login, using `lib/auth.ts` to authenticate and redirect.
        *   `/admin`: The main admin dashboard. It fetches all manageable data, uses URL parameters (`?tab=...`) for tab navigation between different management sections (Skills, Projects, Experiences, About), and renders the corresponding `Admin*Manager` components. It checks for admin status and redirects if the user is not authenticated.

4.  **State Management**
    *   Primarily uses React's built-in hooks: `useState` for managing component-level state (form data, loading status, editing state) and `useEffect` for side effects like fetching data on component mount or reacting to changes.

5.  **API Interaction (`services/api.ts`)**
    *   Centralizes all communication with the backend Express API.
    *   Defines async functions for each API endpoint (e.g., `getProjects`, `createSkill`, `updateAbout`, `deleteExperience`).
    *   Uses `fetch` to make HTTP requests.
    *   Includes a `fetchWithFallback` helper function that attempts to fetch from the API but returns predefined fallback data (from `data/fallback.ts`) if the request fails or times out, providing some resilience.
    *   Handles passing the JWT token in the `Authorization` header for protected API calls.
    *   Uses the `NEXT_PUBLIC_API_URL` environment variable for the backend base URL.

6.  **Authentication Handling (`lib/auth.ts`)**
    *   Provides client-side functions for:
        *   `login`: Sends credentials to the backend `/api/auth/login` endpoint, stores the received JWT in `localStorage`.
        *   `logout`: Removes the JWT from `localStorage`.
        *   `getAuthToken`: Retrieves the token from `localStorage`.
        *   `isAdmin`: Checks if a token exists in `localStorage`.
    *   Uses `window.dispatchEvent(new Event('storage'))` on login/logout, potentially to help synchronize auth state across different parts of the application or browser tabs, although components primarily rely on re-checking `isAdmin()` via `useEffect`.

7.  **Image Handling (`utils/imageUtils.ts`)**
    *   Provides client-side utilities for handling image uploads in admin forms:
        *   `fileToBase64`: Converts `File` objects to Base64 strings for preview and sending to the backend (`imageData` field).
        *   `validateImage`: Checks file type and size before processing.
        *   `resizeImage`: Uses HTML `canvas` to resize images client-side to specified dimensions and quality, reducing payload size.
        *   `compressImageToMaxSize`: Attempts to compress an image iteratively by reducing quality and dimensions until it's below a target size (in KB).

**Data Flow**

1.  **Public View:**
    *   User navigates to a page (e.g., `/projects`).
    *   The Next.js frontend component (client or server) calls the corresponding function in `services/api.ts` (e.g., `api.getProjects()`).
    *   `api.ts` makes a GET request to the backend Express API (`/api/projects`).
    *   The backend route (`projectRoutes`) maps the request to the `getAllProjects` controller.
    *   The controller interacts with the `Project` Mongoose model to fetch data from MongoDB.
    *   The controller sends a JSON response containing the projects back to the frontend.
    *   The frontend component receives the data, updates its state (if a client component), and renders the UI (e.g., using `ProjectCard` components). Fallback data is used if the API call fails.
2.  **Admin Action (e.g., Update Skill):**
    *   Admin navigates to `/admin?tab=skills`.
    *   The `AdminPage` component fetches skills via `api.getSkills()` and renders `AdminSkillsManager`.
    *   Admin clicks "Edit" on a skill, populating the edit form within `AdminSkillsManager`.
    *   Admin modifies the skill details and clicks "Save".
    *   The `handleSubmitEdit` function in `AdminSkillsManager` is triggered.
    *   It calls `api.updateSkill(id, updatedData, token)`, retrieving the token via `getAuthToken()`.
    *   `api.ts` makes a PATCH request to `/api/skills/:id` on the backend, including the token in the `Authorization` header.
    *   The backend route (`skillRoutes`) verifies the token using `adminAuth` middleware.
    *   If authorized, the request proceeds to the `updateSkill` controller.
    *   The controller validates the data (if applicable), updates the skill in MongoDB via the `Skill` model.
    *   The controller sends back the updated skill data as JSON.
    *   The frontend `AdminSkillsManager` receives the response. On success, it might clear the editing state and calls the `onUpdate` prop, which triggers a data refresh in the parent `AdminPage`.

This detailed description covers the key technical aspects of both the frontend and backend based on the provided code snippets.

```json
{
  "backend/src/app.ts": {
    "imports": [
      {"source": "express", "what": ["Request", "Response", "NextFunction", "default as express"]},
      {"source": "cors", "what": ["default as cors"]},
      {"source": "path", "what": ["* as path"]},
      {"source": "dotenv", "what": ["config"]},
      {"source": "./config/database", "what": ["connectDB"]},
      {"source": "./routes/projectRoutes", "what": ["default as projectRoutes"]},
      {"source": "./routes/skillRoutes", "what": ["default as skillRoutes"]},
      {"source": "./routes/aboutRoutes", "what": ["default as aboutRoutes"]},
      {"source": "./routes/authRoutes", "what": ["default as authRoutes"]},
      {"source": "./routes/experienceRoutes", "what": ["default as experienceRoutes"]},
      {"source": "./utils/errorHandler", "what": ["AppError"]}
    ],
    "defines": {
      "variables": ["app", "port", "isOnline", "base_route", "server"],
      "functions": ["gracefulShutdown"]
    },
    "calls": [
      {"target": "config", "source": "dotenv"},
      {"target": "express", "source": "express"},
      {"target": "app.use", "source": "express"},
      {"target": "express.json", "source": "express"},
      {"target": "cors", "source": "cors"},
      {"target": "app.all", "source": "express"},
      {"target": "app.get", "source": "express"},
      {"target": "AppError", "source": "./utils/errorHandler"},
      {"target": "res.status().json", "source": "express"},
      {"target": "connectDB", "source": "./config/database"},
      {"target": "app.listen", "source": "express"},
      {"target": "console.log", "source": "node_builtin"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "process.exit", "source": "node_builtin"},
      {"target": "process.on", "source": "node_builtin"},
      {"target": "server.close", "source": "node_builtin"},
      {"target": "path.join", "source": "path"},
      {"target": "express.static", "source": "express"},
      {"target": "res.sendFile", "source": "express"}
    ],
    "uses": {
      "interfaces": ["Request", "Response", "NextFunction"],
      "classes": ["AppError"]
    }
  },
  "backend/src/config/database.ts": {
    "imports": [
      {"source": "mongoose", "what": ["default as mongoose"]}
    ],
    "defines": {
      "functions": ["connectDB"]
    },
    "calls": [
      {"target": "mongoose.connect", "source": "mongoose"},
      {"target": "console.log", "source": "node_builtin"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "process.exit", "source": "node_builtin"}
    ],
    "uses": {}
  },
  "backend/src/controllers/aboutController.ts": {
    "imports": [
      {"source": "express", "what": ["Request", "Response", "NextFunction"]},
      {"source": "express-validator", "what": ["validationResult"]},
      {"source": "../models/AboutMe", "what": ["default as AboutMe", "IAboutMe"]},
      {"source": "../utils/errorHandler", "what": ["AppError", "catchAsync"]}
    ],
    "defines": {
      "functions": ["getAboutMe", "updateAboutMe"]
    },
    "calls": [
      {"target": "catchAsync", "source": "../utils/errorHandler"},
      {"target": "AboutMe.findOne", "source": "../models/AboutMe"},
      {"target": "AppError", "source": "../utils/errorHandler"},
      {"target": "next", "source": "express"},
      {"target": "res.status().json", "source": "express"},
      {"target": "validationResult", "source": "express-validator"},
      {"target": "errors.isEmpty", "source": "express-validator"},
      {"target": "errors.array", "source": "express-validator"},
      {"target": "AboutMe.findOneAndUpdate", "source": "../models/AboutMe"}
    ],
    "uses": {
      "models": ["AboutMe"],
      "interfaces": ["Request", "Response", "NextFunction", "IAboutMe"],
      "classes": ["AppError"]
    }
  },
  "backend/src/controllers/authController.ts": {
    "imports": [
      {"source": "express", "what": ["Request", "Response", "NextFunction"]},
      {"source": "jsonwebtoken", "what": ["default as jwt"]},
      {"source": "../utils/errorHandler", "what": ["AppError", "catchAsync"]}
    ],
    "defines": {
      "functions": ["login"]
    },
    "calls": [
      {"target": "catchAsync", "source": "../utils/errorHandler"},
      {"target": "jwt.sign", "source": "jsonwebtoken"},
      {"target": "res.status().json", "source": "express"},
      {"target": "AppError", "source": "../utils/errorHandler"},
      {"target": "next", "source": "express"}
    ],
    "uses": {
      "interfaces": ["Request", "Response", "NextFunction"],
      "classes": ["AppError"]
    }
  },
  "backend/src/controllers/experienceController.ts": {
    "imports": [
      {"source": "express", "what": ["Request", "Response"]},
      {"source": "../models/Experience", "what": ["default as Experience"]},
      {"source": "../middleware/authMiddleware", "what": ["AuthRequest"]}
    ],
    "defines": {
      "functions": ["getExperiences", "getExperience", "createExperience", "updateExperience", "deleteExperience"]
    },
    "calls": [
      {"target": "Experience.find", "source": "../models/Experience"},
      {"target": "Experience.sort", "source": "../models/Experience"},
      {"target": "res.status().json", "source": "express"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "Experience.findById", "source": "../models/Experience"},
      {"target": "Experience", "source": "../models/Experience"},
      {"target": "experience.save", "source": "../models/Experience"},
      {"target": "Experience.findByIdAndUpdate", "source": "../models/Experience"},
      {"target": "Experience.findByIdAndDelete", "source": "../models/Experience"}
    ],
    "uses": {
      "models": ["Experience"],
      "interfaces": ["Request", "Response", "AuthRequest"]
    }
  },
  "backend/src/controllers/projectController.ts": {
    "imports": [
      {"source": "express", "what": ["Request", "Response", "NextFunction"]},
      {"source": "express-validator", "what": ["validationResult"]},
      {"source": "../models/Project", "what": ["default as Project", "IProject"]},
      {"source": "../utils/errorHandler", "what": ["AppError", "catchAsync"]}
    ],
    "defines": {
      "functions": ["getAllProjects", "getProject", "createProject", "updateProject", "deleteProject"]
    },
    "calls": [
      {"target": "catchAsync", "source": "../utils/errorHandler"},
      {"target": "Project.find", "source": "../models/Project"},
      {"target": "Project.sort", "source": "../models/Project"},
      {"target": "res.status().json", "source": "express"},
      {"target": "Project.findById", "source": "../models/Project"},
      {"target": "AppError", "source": "../utils/errorHandler"},
      {"target": "next", "source": "express"},
      {"target": "validationResult", "source": "express-validator"},
      {"target": "errors.isEmpty", "source": "express-validator"},
      {"target": "errors.array", "source": "express-validator"},
      {"target": "Project.create", "source": "../models/Project"},
      {"target": "Project.findByIdAndUpdate", "source": "../models/Project"},
      {"target": "Project.findByIdAndDelete", "source": "../models/Project"}
    ],
    "uses": {
      "models": ["Project"],
      "interfaces": ["Request", "Response", "NextFunction", "IProject"],
      "classes": ["AppError"]
    }
  },
  "backend/src/controllers/skillController.ts": {
    "imports": [
      {"source": "express", "what": ["Request", "Response", "NextFunction"]},
      {"source": "express-validator", "what": ["validationResult"]},
      {"source": "../models/Skill", "what": ["default as Skill", "ISkill"]},
      {"source": "../utils/errorHandler", "what": ["AppError", "catchAsync"]}
    ],
    "defines": {
      "functions": ["getAllSkills", "getSkill", "createSkill", "updateSkill", "deleteSkill"]
    },
    "calls": [
      {"target": "catchAsync", "source": "../utils/errorHandler"},
      {"target": "Skill.find", "source": "../models/Skill"},
      {"target": "res.status().json", "source": "express"},
      {"target": "Skill.findById", "source": "../models/Skill"},
      {"target": "AppError", "source": "../utils/errorHandler"},
      {"target": "next", "source": "express"},
      {"target": "validationResult", "source": "express-validator"},
      {"target": "errors.isEmpty", "source": "express-validator"},
      {"target": "errors.array", "source": "express-validator"},
      {"target": "Skill.create", "source": "../models/Skill"},
      {"target": "Skill.findByIdAndUpdate", "source": "../models/Skill"},
      {"target": "Skill.findByIdAndDelete", "source": "../models/Skill"},
      {"target": "res.status().send", "source": "express"}
    ],
    "uses": {
      "models": ["Skill"],
      "interfaces": ["Request", "Response", "NextFunction", "ISkill"],
      "classes": ["AppError"]
    }
  },
  "backend/src/middleware/authMiddleware.ts": {
    "imports": [
      {"source": "express", "what": ["Request", "Response", "NextFunction"]},
      {"source": "../utils/errorHandler", "what": ["AppError"]},
      {"source": "jsonwebtoken", "what": ["default as jwt"]}
    ],
    "defines": {
      "interfaces": ["AuthRequest"],
      "functions": ["adminAuth"]
    },
    "calls": [
      {"target": "req.headers.authorization.split", "source": "node_builtin"},
      {"target": "AppError", "source": "../utils/errorHandler"},
      {"target": "jwt.verify", "source": "jsonwebtoken"},
      {"target": "next", "source": "express"}
    ],
    "uses": {
      "interfaces": ["Request", "Response", "NextFunction"],
      "classes": ["AppError"]
    }
  },
  "backend/src/models/About.ts": {
    "imports": [
      {"source": "mongoose", "what": ["Schema", "model", "Document"]}
    ],
    "defines": {
      "interfaces": ["IAbout"],
      "variables": ["AboutSchema"],
      "models": ["About"]
    },
    "calls": [
      {"target": "new Schema", "source": "mongoose"},
      {"target": "model", "source": "mongoose"}
    ],
    "uses": {}
  },
  "backend/src/models/AboutMe.ts": {
    "imports": [
      {"source": "mongoose", "what": ["Schema", "model", "Document"]}
    ],
    "defines": {
      "interfaces": ["IAboutMe"],
      "variables": ["AboutMeSchema"],
      "models": ["AboutMe"]
    },
    "calls": [
      {"target": "new Schema", "source": "mongoose"},
      {"target": "model", "source": "mongoose"}
    ],
    "uses": {}
  },
  "backend/src/models/Experience.ts": {
    "imports": [
      {"source": "mongoose", "what": ["default as mongoose", "Document", "Schema"]}
    ],
    "defines": {
      "interfaces": ["IExperience"],
      "variables": ["experienceSchema"],
      "models": ["Experience"]
    },
    "calls": [
      {"target": "new Schema", "source": "mongoose"},
      {"target": "mongoose.model", "source": "mongoose"}
    ],
    "uses": {}
  },
  "backend/src/models/Project.ts": {
    "imports": [
      {"source": "mongoose", "what": ["Schema", "model", "Document"]}
    ],
    "defines": {
      "interfaces": ["IProject"],
      "variables": ["ProjectSchema"],
      "models": ["Project"]
    },
    "calls": [
      {"target": "new Schema", "source": "mongoose"},
      {"target": "ProjectSchema.pre", "source": "mongoose"},
      {"target": "new Error", "source": "node_builtin"},
      {"target": "next", "source": "mongoose"},
      {"target": "model", "source": "mongoose"}
    ],
    "uses": {}
  },
  "backend/src/models/Skill.ts": {
    "imports": [
      {"source": "mongoose", "what": ["Schema", "model", "Document"]}
    ],
    "defines": {
      "interfaces": ["ISkill"],
      "variables": ["SkillSchema"],
      "models": ["Skill"]
    },
    "calls": [
      {"target": "new Schema", "source": "mongoose"},
      {"target": "model", "source": "mongoose"}
    ],
    "uses": {}
  },
  "backend/src/routes/aboutRoutes.ts": {
    "imports": [
      {"source": "express", "what": ["Router"]},
      {"source": "express-validator", "what": ["body"]},
      {"source": "../controllers/aboutController", "what": ["getAboutMe", "updateAboutMe"]},
      {"source": "../middleware/authMiddleware", "what": ["adminAuth"]}
    ],
    "defines": {
      "variables": ["router", "aboutValidation"]
    },
    "calls": [
      {"target": "Router", "source": "express"},
      {"target": "body", "source": "express-validator"},
      {"target": "trim", "source": "express-validator"},
      {"target": "notEmpty", "source": "express-validator"},
      {"target": "withMessage", "source": "express-validator"},
      {"target": "isEmail", "source": "express-validator"},
      {"target": "optional", "source": "express-validator"},
      {"target": "isURL", "source": "express-validator"},
      {"target": "router.route", "source": "express"},
      {"target": "get", "source": "express"},
      {"target": "put", "source": "express"}
    ],
    "uses": {
      "functions": ["getAboutMe", "updateAboutMe", "adminAuth"]
    }
  },
  "backend/src/routes/authRoutes.ts": {
    "imports": [
      {"source": "express", "what": ["default as express"]},
      {"source": "../controllers/authController", "what": ["login"]}
    ],
    "defines": {
      "variables": ["router"]
    },
    "calls": [
      {"target": "express.Router", "source": "express"},
      {"target": "router.post", "source": "express"}
    ],
    "uses": {
      "functions": ["login"]
    }
  },
  "backend/src/routes/experienceRoutes.ts": {
    "imports": [
      {"source": "express", "what": ["default as express"]},
      {"source": "../controllers/experienceController", "what": ["getExperiences", "getExperience", "createExperience", "updateExperience", "deleteExperience"]},
      {"source": "../middleware/authMiddleware", "what": ["adminAuth"]}
    ],
    "defines": {
      "variables": ["router"]
    },
    "calls": [
      {"target": "express.Router", "source": "express"},
      {"target": "router.get", "source": "express"},
      {"target": "router.post", "source": "express"},
      {"target": "router.put", "source": "express"},
      {"target": "router.delete", "source": "express"}
    ],
    "uses": {
      "functions": ["getExperiences", "getExperience", "createExperience", "updateExperience", "deleteExperience", "adminAuth"]
    }
  },
  "backend/src/routes/projectRoutes.ts": {
    "imports": [
      {"source": "express", "what": ["Router"]},
      {"source": "express-validator", "what": ["body"]},
      {"source": "../controllers/projectController", "what": ["getAllProjects", "getProject", "createProject", "updateProject", "deleteProject"]},
      {"source": "../middleware/authMiddleware", "what": ["adminAuth"]}
    ],
    "defines": {
      "variables": ["router", "projectValidation", "updateProjectValidation"]
    },
    "calls": [
      {"target": "Router", "source": "express"},
      {"target": "body", "source": "express-validator"},
      {"target": "trim", "source": "express-validator"},
      {"target": "notEmpty", "source": "express-validator"},
      {"target": "withMessage", "source": "express-validator"},
      {"target": "isArray", "source": "express-validator"},
      {"target": "custom", "source": "express-validator"},
      {"target": "new Error", "source": "node_builtin"},
      {"target": "optional", "source": "express-validator"},
      {"target": "router.route", "source": "express"},
      {"target": "get", "source": "express"},
      {"target": "post", "source": "express"},
      {"target": "patch", "source": "express"},
      {"target": "delete", "source": "express"}
    ],
    "uses": {
      "functions": ["getAllProjects", "getProject", "createProject", "updateProject", "deleteProject", "adminAuth"]
    }
  },
  "backend/src/routes/skillRoutes.ts": {
    "imports": [
      {"source": "express", "what": ["Router"]},
      {"source": "express-validator", "what": ["body"]},
      {"source": "../controllers/skillController", "what": ["getAllSkills", "getSkill", "createSkill", "updateSkill", "deleteSkill"]},
      {"source": "../middleware/authMiddleware", "what": ["adminAuth"]}
    ],
    "defines": {
      "variables": ["router", "skillValidation"]
    },
    "calls": [
      {"target": "Router", "source": "express"},
      {"target": "body", "source": "express-validator"},
      {"target": "trim", "source": "express-validator"},
      {"target": "notEmpty", "source": "express-validator"},
      {"target": "withMessage", "source": "express-validator"},
      {"target": "isIn", "source": "express-validator"},
      {"target": "isInt", "source": "express-validator"},
      {"target": "router.route", "source": "express"},
      {"target": "get", "source": "express"},
      {"target": "post", "source": "express"},
      {"target": "patch", "source": "express"},
      {"target": "delete", "source": "express"}
    ],
    "uses": {
      "functions": ["getAllSkills", "getSkill", "createSkill", "updateSkill", "deleteSkill", "adminAuth"]
    }
  },
  "backend/src/scripts/initDb.ts": {
    "imports": [
      {"source": "mongoose", "what": ["default as mongoose"]},
      {"source": "../models/AboutMe", "what": ["default as AboutMe"]},
      {"source": "dotenv", "what": ["default as dotenv"]}
    ],
    "defines": {
      "functions": ["initializeDb"]
    },
    "calls": [
      {"target": "dotenv.config", "source": "dotenv"},
      {"target": "mongoose.connect", "source": "mongoose"},
      {"target": "console.log", "source": "node_builtin"},
      {"target": "AboutMe.findOne", "source": "../models/AboutMe"},
      {"target": "AboutMe.create", "source": "../models/AboutMe"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "mongoose.disconnect", "source": "mongoose"},
      {"target": "initializeDb", "source": "internal"}
    ],
    "uses": {
      "models": ["AboutMe"]
    }
  },
  "backend/src/scripts/initializeDb.ts": {
    "imports": [
      {"source": "../config/database", "what": ["connectDB"]},
      {"source": "../models/Project", "what": ["default as Project"]},
      {"source": "../models/AboutMe", "what": ["default as AboutMe"]},
      {"source": "../models/Experience", "what": ["default as Experience"]},
      {"source": "dotenv", "what": ["config"]}
    ],
    "defines": {
      "functions": ["initializeDb"]
    },
    "calls": [
      {"target": "config", "source": "dotenv"},
      {"target": "connectDB", "source": "../config/database"},
      {"target": "console.log", "source": "node_builtin"},
      {"target": "Project.countDocuments", "source": "../models/Project"},
      {"target": "Project.create", "source": "../models/Project"},
      {"target": "Experience.countDocuments", "source": "../models/Experience"},
      {"target": "Experience.insertMany", "source": "../models/Experience"},
      {"target": "AboutMe.countDocuments", "source": "../models/AboutMe"},
      {"target": "AboutMe.create", "source": "../models/AboutMe"},
      {"target": "process.exit", "source": "node_builtin"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "initializeDb", "source": "internal"}
    ],
    "uses": {
      "models": ["Project", "AboutMe", "Experience"]
    }
  },
  "backend/src/scripts/resetAboutCollection.ts": {
    "imports": [
      {"source": "../config/database", "what": ["connectDB"]},
      {"source": "../models/AboutMe", "what": ["default as AboutMe"]},
      {"source": "dotenv", "what": ["config"]}
    ],
    "defines": {
      "functions": ["resetAboutCollection"]
    },
    "calls": [
      {"target": "config", "source": "dotenv"},
      {"target": "connectDB", "source": "../config/database"},
      {"target": "console.log", "source": "node_builtin"},
      {"target": "AboutMe.collection.drop", "source": "../models/AboutMe"},
      {"target": "AboutMe.create", "source": "../models/AboutMe"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "process.exit", "source": "node_builtin"},
      {"target": "resetAboutCollection", "source": "internal"}
    ],
    "uses": {
      "models": ["AboutMe"]
    }
  },
  "backend/src/scripts/setupEnv.ts": {
    "imports": [
      {"source": "fs", "what": ["default as fs"]},
      {"source": "path", "what": ["default as path"]},
      {"source": "dotenv", "what": ["default as dotenv"]}
    ],
    "defines": {
      "variables": ["envPath", "envContent"]
    },
    "calls": [
      {"target": "dotenv.config", "source": "dotenv"},
      {"target": "path.join", "source": "path"},
      {"target": "fs.writeFileSync", "source": "fs"},
      {"target": "console.log", "source": "node_builtin"},
      {"target": "console.error", "source": "node_builtin"}
    ],
    "uses": {}
  },
  "backend/src/utils/errorHandler.ts": {
    "imports": [],
    "defines": {
      "classes": ["AppError"],
      "functions": ["catchAsync"]
    },
    "calls": [
      {"target": "super", "source": "node_builtin"},
      {"target": "Error.captureStackTrace", "source": "node_builtin"},
      {"target": "fn().catch", "source": "internal"}
    ],
    "uses": {
      "classes": ["Error"]
    }
  },
  "src/app/about/page.tsx": {
    "imports": [
      {"source": "react", "what": ["useState", "useEffect", "useRef"]},
      {"source": "@/lib/auth", "what": ["isAdmin", "getAuthToken"]},
      {"source": "@/services/api", "what": ["api"]},
      {"source": "@/types", "what": ["AboutMe"]},
      {"source": "@/utils/imageUtils", "what": ["fileToBase64", "validateImage", "resizeImage"]},
      {"source": "react-markdown", "what": ["default as ReactMarkdown"]}
    ],
    "defines": {
      "components": ["AboutPage"]
    },
    "calls": [
      {"target": "useState", "source": "react"},
      {"target": "useEffect", "source": "react"},
      {"target": "useRef", "source": "react"},
      {"target": "isAdmin", "source": "@/lib/auth"},
      {"target": "fetchAbout", "source": "internal"},
      {"target": "setLoading", "source": "react"},
      {"target": "api.getAbout", "source": "@/services/api"},
      {"target": "setAbout", "source": "react"},
      {"target": "setImagePreview", "source": "react"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "setEditedAbout", "source": "react"},
      {"target": "setIsEditing", "source": "react"},
      {"target": "setSelectedImage", "source": "react"},
      {"target": "fileInputRef.current.value", "source": "react"},
      {"target": "validateImage", "source": "@/utils/imageUtils"},
      {"target": "alert", "source": "browser"},
      {"target": "fileToBase64", "source": "@/utils/imageUtils"},
      {"target": "resizeImage", "source": "@/utils/imageUtils"},
      {"target": "handleSubmit", "source": "internal"},
      {"target": "e.preventDefault", "source": "browser"},
      {"target": "setIsSubmitting", "source": "react"},
      {"target": "getAuthToken", "source": "@/lib/auth"},
      {"target": "api.updateAbout", "source": "@/services/api"},
      {"target": "setShowPreview", "source": "react"},
      {"target": "ReactMarkdown", "source": "react-markdown"}
    ],
    "uses": {
      "types": ["AboutMe"],
      "interfaces": ["React.ChangeEvent", "React.FormEvent", "HTMLInputElement"],
      "components": ["ReactMarkdown"]
    }
  },
  "src/app/admin/login/page.tsx": {
    "imports": [
      {"source": "react", "what": ["useState"]},
      {"source": "next/navigation", "what": ["useRouter"]},
      {"source": "@/lib/auth", "what": ["login"]}
    ],
    "defines": {
      "components": ["AdminLogin"]
    },
    "calls": [
      {"target": "useState", "source": "react"},
      {"target": "useRouter", "source": "next/navigation"},
      {"target": "handleSubmit", "source": "internal"},
      {"target": "e.preventDefault", "source": "browser"},
      {"target": "login", "source": "@/lib/auth"},
      {"target": "router.push", "source": "next/navigation"},
      {"target": "router.refresh", "source": "next/navigation"},
      {"target": "setError", "source": "react"},
      {"target": "setUsername", "source": "react"},
      {"target": "setPassword", "source": "react"}
    ],
    "uses": {
      "interfaces": ["React.FormEvent"]
    }
  },
  "src/app/admin/page.tsx": {
    "imports": [
      {"source": "react", "what": ["useState", "useEffect"]},
      {"source": "next/navigation", "what": ["useRouter", "useSearchParams"]},
      {"source": "@/lib/auth", "what": ["isAdmin"]},
      {"source": "@/services/api", "what": ["api"]},
      {"source": "@/types", "what": ["Project", "Skill", "AboutMe", "Experience"]},
      {"source": "@/components/AdminSkillsManager", "what": ["default as AdminSkillsManager"]},
      {"source": "@/components/AdminProjectsManager", "what": ["default as AdminProjectsManager"]},
      {"source": "@/components/AdminAboutManager", "what": ["default as AdminAboutManager"]},
      {"source": "@/components/AdminExperienceManager", "what": ["default as AdminExperienceManager"]}
    ],
    "defines": {
      "components": ["AdminPage"]
    },
    "calls": [
      {"target": "useRouter", "source": "next/navigation"},
      {"target": "useSearchParams", "source": "next/navigation"},
      {"target": "useState", "source": "react"},
      {"target": "useEffect", "source": "react"},
      {"target": "isAdmin", "source": "@/lib/auth"},
      {"target": "router.push", "source": "next/navigation"},
      {"target": "searchParams.get", "source": "next/navigation"},
      {"target": "setActiveTab", "source": "react"},
      {"target": "fetchData", "source": "internal"},
      {"target": "Promise.all", "source": "node_builtin"},
      {"target": "api.getSkills", "source": "@/services/api"},
      {"target": "api.getProjects", "source": "@/services/api"},
      {"target": "api.getAbout", "source": "@/services/api"},
      {"target": "api.getExperiences", "source": "@/services/api"},
      {"target": "console.log", "source": "node_builtin"},
      {"target": "setSkills", "source": "react"},
      {"target": "setProjects", "source": "react"},
      {"target": "setAbout", "source": "react"},
      {"target": "setExperiences", "source": "react"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "setLoading", "source": "react"},
      {"target": "handleRefreshData", "source": "internal"}
    ],
    "uses": {
      "types": ["Project", "Skill", "AboutMe", "Experience"],
      "components": ["AdminSkillsManager", "AdminProjectsManager", "AdminAboutManager", "AdminExperienceManager"]
    }
  },
  "src/app/experiences/page.tsx": {
    "imports": [
      {"source": "react", "what": ["useState", "useEffect", "useCallback"]},
      {"source": "@/components/ExperienceSection", "what": ["default as ExperienceSection"]},
      {"source": "@/services/api", "what": ["api"]},
      {"source": "@/types", "what": ["Experience"]}
    ],
    "defines": {
      "components": ["ExperiencesPage"]
    },
    "calls": [
      {"target": "useState", "source": "react"},
      {"target": "useEffect", "source": "react"},
      {"target": "fetchExperiences", "source": "internal"},
      {"target": "api.getExperiences", "source": "@/services/api"},
      {"target": "setExperiences", "source": "react"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "setLoading", "source": "react"},
      {"target": "useCallback", "source": "react"},
      {"target": "console.log", "source": "node_builtin"}
    ],
    "uses": {
      "types": ["Experience"],
      "components": ["ExperienceSection"]
    }
  },
  "src/app/layout.tsx": {
    "imports": [
      {"source": "next", "what": ["Metadata"]},
      {"source": "next/font/google", "what": ["Geist", "Geist_Mono"]},
      {"source": "@/components/Navigation", "what": ["default as Navigation"]},
      {"source": "./globals.css", "what": []}
    ],
    "defines": {
      "variables": ["geistSans", "geistMono", "metadata"],
      "components": ["RootLayout"]
    },
    "calls": [
      {"target": "Geist", "source": "next/font/google"},
      {"target": "Geist_Mono", "source": "next/font/google"}
    ],
    "uses": {
      "types": ["Metadata", "React.ReactNode"],
      "components": ["Navigation"]
    }
  },
  "src/app/page.tsx": {
    "imports": [
      {"source": "@/components/AboutSection", "what": ["default as AboutSection"]},
      {"source": "@/components/ProjectCard", "what": ["default as ProjectCard"]},
      {"source": "@/components/SkillsGrid", "what": ["default as SkillsGrid"]},
      {"source": "@/components/ExperienceSection", "what": ["default as ExperienceSection"]},
      {"source": "@/services/api", "what": ["api"]}
    ],
    "defines": {
      "components": ["Home"]
    },
    "calls": [
      {"target": "Promise.all", "source": "node_builtin"},
      {"target": "api.getProjects", "source": "@/services/api"},
      {"target": "api.getSkills", "source": "@/services/api"},
      {"target": "api.getAbout", "source": "@/services/api"},
      {"target": "api.getExperiences", "source": "@/services/api"},
      {"target": "projects.map", "source": "node_builtin"}
    ],
    "uses": {
      "components": ["AboutSection", "ProjectCard", "SkillsGrid", "ExperienceSection"]
    }
  },
  "src/app/projects/page.tsx": {
    "imports": [
      {"source": "react", "what": ["useState", "useEffect", "useRef"]},
      {"source": "@/lib/auth", "what": ["isAdmin", "getAuthToken"]},
      {"source": "@/services/api", "what": ["api"]},
      {"source": "@/types", "what": ["Project"]},
      {"source": "next/image", "what": ["default as Image"]},
      {"source": "@/utils/imageUtils", "what": ["fileToBase64", "validateImage", "compressImageToMaxSize"]}
    ],
    "defines": {
      "components": ["ProjectsPage"]
    },
    "calls": [
      {"target": "useState", "source": "react"},
      {"target": "useEffect", "source": "react"},
      {"target": "useRef", "source": "react"},
      {"target": "isAdmin", "source": "@/lib/auth"},
      {"target": "setIsAdminUser", "source": "react"},
      {"target": "fetchProjects", "source": "internal"},
      {"target": "setLoading", "source": "react"},
      {"target": "api.getProjects", "source": "@/services/api"},
      {"target": "setProjects", "source": "react"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "resetForm", "source": "internal"},
      {"target": "setFormData", "source": "react"},
      {"target": "setIsCreating", "source": "react"},
      {"target": "setEditingId", "source": "react"},
      {"target": "setSelectedImage", "source": "react"},
      {"target": "setImagePreview", "source": "react"},
      {"target": "setTechInput", "source": "react"},
      {"target": "fileInputRef.current.value", "source": "react"},
      {"target": "handleCreateNew", "source": "internal"},
      {"target": "handleEdit", "source": "internal"},
      {"target": "handleImageSelect", "source": "internal"},
      {"target": "validateImage", "source": "@/utils/imageUtils"},
      {"target": "alert", "source": "browser"},
      {"target": "fileToBase64", "source": "@/utils/imageUtils"},
      {"target": "compressImageToMaxSize", "source": "@/utils/imageUtils"},
      {"target": "handleTechKeyPress", "source": "internal"},
      {"target": "e.preventDefault", "source": "browser"},
      {"target": "techInput.trim", "source": "node_builtin"},
      {"target": "removeTech", "source": "internal"},
      {"target": "handleSubmit", "source": "internal"},
      {"target": "setIsSubmitting", "source": "react"},
      {"target": "getAuthToken", "source": "@/lib/auth"},
      {"target": "api.createProject", "source": "@/services/api"},
      {"target": "Date.toISOString", "source": "node_builtin"},
      {"target": "projects.find", "source": "node_builtin"},
      {"target": "api.updateProject", "source": "@/services/api"},
      {"target": "projects.map", "source": "node_builtin"},
      {"target": "handleDelete", "source": "internal"},
      {"target": "confirm", "source": "browser"},
      {"target": "api.deleteProject", "source": "@/services/api"},
      {"target": "projects.filter", "source": "node_builtin"}
    ],
    "uses": {
      "types": ["Project"],
      "interfaces": ["React.ChangeEvent", "React.KeyboardEvent", "React.FormEvent", "HTMLInputElement"],
      "components": ["Image"]
    }
  },
  "src/app/skills/page.tsx": {
    "imports": [
      {"source": "react", "what": ["useState", "useEffect"]},
      {"source": "@/lib/auth", "what": ["isAdmin", "getAuthToken"]},
      {"source": "@/services/api", "what": ["api"]},
      {"source": "@/types", "what": ["Skill"]}
    ],
    "defines": {
      "variables": ["CATEGORY_LABELS"],
      "components": ["SkillsPage"]
    },
    "calls": [
      {"target": "useState", "source": "react"},
      {"target": "useEffect", "source": "react"},
      {"target": "isAdmin", "source": "@/lib/auth"},
      {"target": "setIsAdminUser", "source": "react"},
      {"target": "fetchSkills", "source": "internal"},
      {"target": "setLoading", "source": "react"},
      {"target": "api.getSkills", "source": "@/services/api"},
      {"target": "setSkills", "source": "react"},
      {"target": "setError", "source": "react"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "resetForm", "source": "internal"},
      {"target": "setFormData", "source": "react"},
      {"target": "setIsCreating", "source": "react"},
      {"target": "setEditingId", "source": "react"},
      {"target": "handleCreateNew", "source": "internal"},
      {"target": "handleEdit", "source": "internal"},
      {"target": "handleSubmit", "source": "internal"},
      {"target": "e.preventDefault", "source": "browser"},
      {"target": "setIsSubmitting", "source": "react"},
      {"target": "getAuthToken", "source": "@/lib/auth"},
      {"target": "alert", "source": "browser"},
      {"target": "api.createSkill", "source": "@/services/api"},
      {"target": "api.updateSkill", "source": "@/services/api"},
      {"target": "handleDelete", "source": "internal"},
      {"target": "window.confirm", "source": "browser"},
      {"target": "api.deleteSkill", "source": "@/services/api"},
      {"target": "handleCancel", "source": "internal"},
      {"target": "handleInputChange", "source": "internal"},
      {"target": "parseInt", "source": "node_builtin"},
      {"target": "skills.reduce", "source": "node_builtin"},
      {"target": "Object.entries", "source": "node_builtin"},
      {"target": "map", "source": "node_builtin"}, // Used implicitly on Object.entries result and categorySkills
      {"target": "Object.keys", "source": "node_builtin"}
    ],
    "uses": {
      "types": ["Skill"],
      "interfaces": ["React.ChangeEvent", "React.FormEvent", "HTMLInputElement", "HTMLSelectElement"]
    }
  },
  "src/components/AboutSection.tsx": {
    "imports": [
      {"source": "@/types", "what": ["AboutMe"]},
      {"source": "next/link", "what": ["default as Link"]}
    ],
    "defines": {
      "components": ["AboutSection"]
    },
    "calls": [],
    "uses": {
      "types": ["AboutMe"],
      "components": ["Link"]
    }
  },
  "src/components/AdminAboutManager.tsx": {
    "imports": [
      {"source": "react", "what": ["useState", "useRef"]},
      {"source": "@/lib/auth", "what": ["getAuthToken"]},
      {"source": "@/types", "what": ["AboutMe"]},
      {"source": "@/services/api", "what": ["api"]},
      {"source": "@/utils/imageUtils", "what": ["fileToBase64", "validateImage", "resizeImage"]}
    ],
    "defines": {
      "components": ["AdminAboutManager"]
    },
    "calls": [
      {"target": "useState", "source": "react"},
      {"target": "useRef", "source": "react"},
      {"target": "handleImageSelect", "source": "internal"},
      {"target": "validateImage", "source": "@/utils/imageUtils"},
      {"target": "alert", "source": "browser"},
      {"target": "setSelectedImage", "source": "react"},
      {"target": "fileToBase64", "source": "@/utils/imageUtils"},
      {"target": "resizeImage", "source": "@/utils/imageUtils"},
      {"target": "setImagePreview", "source": "react"},
      {"target": "handleSubmit", "source": "internal"},
      {"target": "e.preventDefault", "source": "browser"},
      {"target": "setIsSubmitting", "source": "react"},
      {"target": "api.updateAbout", "source": "@/services/api"},
      {"target": "getAuthToken", "source": "@/lib/auth"},
      {"target": "onUpdate", "source": "props"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "setEditedAbout", "source": "react"}
    ],
    "uses": {
      "types": ["AboutMe"],
      "interfaces": ["AdminAboutManagerProps", "React.ChangeEvent", "React.FormEvent", "HTMLInputElement"]
    }
  },
  "src/components/AdminExperienceManager.tsx": {
    "imports": [
      {"source": "react", "what": ["useState"]},
      {"source": "@/lib/auth", "what": ["getAuthToken"]},
      {"source": "@/types", "what": ["Experience"]},
      {"source": "@/services/api", "what": ["api"]}
    ],
    "defines": {
      "components": ["AdminExperienceManager"]
    },
    "calls": [
      {"target": "useState", "source": "react"},
      {"target": "console.log", "source": "node_builtin"},
      {"target": "resetForm", "source": "internal"},
      {"target": "setFormData", "source": "react"},
      {"target": "setIsCreating", "source": "react"},
      {"target": "setEditingId", "source": "react"},
      {"target": "handleCreateNew", "source": "internal"},
      {"target": "handleEdit", "source": "internal"},
      {"target": "handleSubmit", "source": "internal"},
      {"target": "e.preventDefault", "source": "browser"},
      {"target": "setIsSubmitting", "source": "react"},
      {"target": "getAuthToken", "source": "@/lib/auth"},
      {"target": "alert", "source": "browser"},
      {"target": "api.createExperience", "source": "@/services/api"},
      {"target": "api.updateExperience", "source": "@/services/api"},
      {"target": "onUpdate", "source": "props"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "handleDelete", "source": "internal"},
      {"target": "confirm", "source": "browser"},
      {"target": "api.deleteExperience", "source": "@/services/api"},
      {"target": "experiences.sort", "source": "node_builtin"},
      {"target": "experiences.map", "source": "node_builtin"},
      {"target": "parseInt", "source": "node_builtin"}
    ],
    "uses": {
      "types": ["Experience"],
      "interfaces": ["AdminExperienceManagerProps", "React.FormEvent"]
    }
  },
  "src/components/AdminHeader.tsx": {
    "imports": [
      {"source": "next/navigation", "what": ["useRouter"]},
      {"source": "@/lib/auth", "what": ["isAdmin", "logout"]}
    ],
    "defines": {
      "components": ["AdminHeader"]
    },
    "calls": [
      {"target": "useRouter", "source": "next/navigation"},
      {"target": "isAdmin", "source": "@/lib/auth"},
      {"target": "handleLogout", "source": "internal"},
      {"target": "logout", "source": "@/lib/auth"},
      {"target": "router.refresh", "source": "next/navigation"}
    ],
    "uses": {}
  },
  "src/components/AdminProjectsManager.tsx": {
    "imports": [
      {"source": "react", "what": ["useState", "useRef"]},
      {"source": "@/lib/auth", "what": ["getAuthToken"]},
      {"source": "@/types", "what": ["Project"]},
      {"source": "@/services/api", "what": ["api"]},
      {"source": "@/utils/imageUtils", "what": ["fileToBase64", "validateImage", "resizeImage"]}
    ],
    "defines": {
      "components": ["AdminProjectsManager"]
    },
    "calls": [
      {"target": "useState", "source": "react"},
      {"target": "useRef", "source": "react"},
      {"target": "handleImageSelect", "source": "internal"},
      {"target": "validateImage", "source": "@/utils/imageUtils"},
      {"target": "alert", "source": "browser"},
      {"target": "setSelectedImage", "source": "react"},
      {"target": "fileToBase64", "source": "@/utils/imageUtils"},
      {"target": "resizeImage", "source": "@/utils/imageUtils"},
      {"target": "setImagePreview", "source": "react"},
      {"target": "handleTechKeyPress", "source": "internal"},
      {"target": "e.preventDefault", "source": "browser"},
      {"target": "techInput.trim", "source": "node_builtin"},
      {"target": "setNewProject", "source": "react"},
      {"target": "setEditingProject", "source": "react"},
      {"target": "setTechInput", "source": "react"},
      {"target": "removeTech", "source": "internal"},
      {"target": "handleEdit", "source": "internal"},
      {"target": "handleDelete", "source": "internal"},
      {"target": "confirm", "source": "browser"},
      {"target": "setIsSubmitting", "source": "react"},
      {"target": "api.deleteProject", "source": "@/services/api"},
      {"target": "getAuthToken", "source": "@/lib/auth"},
      {"target": "onUpdate", "source": "props"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "handleSubmitEdit", "source": "internal"},
      {"target": "api.updateProject", "source": "@/services/api"},
      {"target": "handleSubmitNew", "source": "internal"},
      {"target": "api.createProject", "source": "@/services/api"},
      {"target": "Date.toISOString", "source": "node_builtin"},
      {"target": "fileInputRef.current.value", "source": "react"},
      {"target": "projects.map", "source": "node_builtin"}
    ],
    "uses": {
      "types": ["Project"],
      "interfaces": ["AdminProjectsManagerProps", "React.ChangeEvent", "React.KeyboardEvent", "React.FormEvent", "HTMLInputElement"]
    }
  },
  "src/components/AdminSkillsManager.tsx": {
    "imports": [
      {"source": "react", "what": ["useState"]},
      {"source": "@/lib/auth", "what": ["getAuthToken"]},
      {"source": "@/types/skill", "what": ["Skill"]}
    ],
    "defines": {
      "components": ["AdminSkillsManager"]
    },
    "calls": [
      {"target": "useState", "source": "react"},
      {"target": "handleEdit", "source": "internal"},
      {"target": "setEditingSkill", "source": "react"},
      {"target": "handleDelete", "source": "internal"},
      {"target": "confirm", "source": "browser"},
      {"target": "setIsSubmitting", "source": "react"},
      {"target": "fetch", "source": "browser"}, // Direct fetch usage
      {"target": "getAuthToken", "source": "@/lib/auth"},
      {"target": "response.ok", "source": "browser"},
      {"target": "new Error", "source": "node_builtin"},
      {"target": "onUpdate", "source": "props"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "alert", "source": "browser"},
      {"target": "handleSubmitEdit", "source": "internal"},
      {"target": "e.preventDefault", "source": "browser"},
      {"target": "JSON.stringify", "source": "node_builtin"},
      {"target": "handleSubmitNew", "source": "internal"},
      {"target": "response.json", "source": "browser"},
      {"target": "console.log", "source": "node_builtin"},
      {"target": "setNewSkill", "source": "react"},
      {"target": "skills.map", "source": "node_builtin"},
      {"target": "parseInt", "source": "node_builtin"}
    ],
    "uses": {
      "types": ["Skill"], // From src/types/skill.ts
      "interfaces": ["AdminSkillsManagerProps", "React.FormEvent"]
    }
  },
  "src/components/ExperienceSection.tsx": {
    "imports": [
      {"source": "react", "what": ["useEffect", "useState"]},
      {"source": "@/types", "what": ["Experience"]},
      {"source": "@/services/api", "what": ["api"]},
      {"source": "@/lib/auth", "what": ["getAuthToken"]},
      {"source": "react-markdown", "what": ["default as ReactMarkdown"]}
    ],
    "defines": {
      "components": ["ExperienceSection"]
    },
    "calls": [
      {"target": "useState", "source": "react"},
      {"target": "useEffect", "source": "react"},
      {"target": "getAuthToken", "source": "@/lib/auth"},
      {"target": "setIsAdmin", "source": "react"},
      {"target": "setLoading", "source": "react"},
      {"target": "fetchExperiences", "source": "internal"},
      {"target": "api.getExperiences", "source": "@/services/api"},
      {"target": "setExperiences", "source": "react"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "resetForm", "source": "internal"},
      {"target": "setFormData", "source": "react"},
      {"target": "setIsCreating", "source": "react"},
      {"target": "setEditingId", "source": "react"},
      {"target": "handleCreateNew", "source": "internal"},
      {"target": "handleEdit", "source": "internal"},
      {"target": "handleSubmit", "source": "internal"},
      {"target": "e.preventDefault", "source": "browser"},
      {"target": "setIsSubmitting", "source": "react"},
      {"target": "alert", "source": "browser"},
      {"target": "api.createExperience", "source": "@/services/api"},
      {"target": "console.log", "source": "node_builtin"},
      {"target": "api.updateExperience", "source": "@/services/api"},
      {"target": "setTimeout", "source": "node_builtin"},
      {"target": "notifyParentOfChanges", "source": "internal"},
      {"target": "handleDelete", "source": "internal"},
      {"target": "confirm", "source": "browser"},
      {"target": "api.deleteExperience", "source": "@/services/api"},
      {"target": "experiences.filter", "source": "node_builtin"}, // Used in handleDelete and map
      {"target": "experiences.sort", "source": "node_builtin"},
      {"target": "experiences.map", "source": "node_builtin"},
      {"target": "setShowPreview", "source": "react"},
      {"target": "ReactMarkdown", "source": "react-markdown"},
      {"target": "parseInt", "source": "node_builtin"}
    ],
    "uses": {
      "types": ["Experience"],
      "interfaces": ["ExperienceSectionProps", "React.FormEvent"],
      "components": ["ReactMarkdown"]
    }
  },
  "src/components/Navigation.tsx": {
    "imports": [
      {"source": "react", "what": ["useState", "useEffect"]},
      {"source": "next/link", "what": ["default as Link"]},
      {"source": "next/navigation", "what": ["usePathname", "useSearchParams", "useRouter"]},
      {"source": "@/lib/auth", "what": ["isAdmin", "logout"]}
    ],
    "defines": {
      "components": ["Navigation"],
      "variables": ["navItems"]
    },
    "calls": [
      {"target": "usePathname", "source": "next/navigation"},
      {"target": "useSearchParams", "source": "next/navigation"},
      {"target": "useRouter", "source": "next/navigation"},
      {"target": "useState", "source": "react"},
      {"target": "useEffect", "source": "react"},
      {"target": "checkAdminStatus", "source": "internal"},
      {"target": "isAdmin", "source": "@/lib/auth"},
      {"target": "setIsAdminUser", "source": "react"},
      {"target": "window.addEventListener", "source": "browser"},
      {"target": "window.removeEventListener", "source": "browser"},
      {"target": "handleLogout", "source": "internal"},
      {"target": "logout", "source": "@/lib/auth"},
      {"target": "router.refresh", "source": "next/navigation"},
      {"target": "navItems.map", "source": "node_builtin"}
    ],
    "uses": {
      "components": ["Link"]
    }
  },
  "src/components/ProjectCard.tsx": {
    "imports": [
      {"source": "@/types", "what": ["Project"]},
      {"source": "next/image", "what": ["default as Image"]}
    ],
    "defines": {
      "components": ["ProjectCard"]
    },
    "calls": [
      {"target": "project.technologies.map", "source": "node_builtin"}
    ],
    "uses": {
      "types": ["Project"],
      "interfaces": ["ProjectCardProps"],
      "components": ["Image"]
    }
  },
  "src/components/SkillsGrid.tsx": {
    "imports": [
      {"source": "@/lib/auth", "what": ["isAdmin"]},
      {"source": "@/types", "what": ["Skill"]},
      {"source": "./AdminSkillsManager", "what": ["default as AdminSkillsManager"]}
    ],
    "defines": {
      "variables": ["CATEGORY_LABELS", "categories"],
      "components": ["SkillsGrid"]
    },
    "calls": [
      {"target": "isAdmin", "source": "@/lib/auth"},
      {"target": "categories.map", "source": "node_builtin"},
      {"target": "skills.filter", "source": "node_builtin"},
      {"target": "categorySkills.map", "source": "node_builtin"}
    ],
    "uses": {
      "types": ["Skill"],
      "interfaces": ["SkillsGridProps"],
      "components": ["AdminSkillsManager"]
    }
  },
  "src/data/fallback.ts": {
    "imports": [
      {"source": "../types", "what": ["AboutMe", "Project", "Skill", "Experience"]}
    ],
    "defines": {
      "variables": ["fallbackProjects", "fallbackSkills", "fallbackExperiences", "fallbackAboutMe"]
    },
    "calls": [],
    "uses": {
      "types": ["Project", "Skill", "Experience", "AboutMe"]
    }
  },
  "src/lib/auth.ts": {
    "imports": [],
    "defines": {
      "functions": ["login", "logout", "getAuthToken", "isAdmin"]
    },
    "calls": [
      {"target": "fetch", "source": "browser"},
      {"target": "JSON.stringify", "source": "node_builtin"},
      {"target": "response.ok", "source": "browser"},
      {"target": "new Error", "source": "node_builtin"},
      {"target": "response.json", "source": "browser"},
      {"target": "localStorage.setItem", "source": "browser"},
      {"target": "window.dispatchEvent", "source": "browser"},
      {"target": "new Event", "source": "browser"},
      {"target": "localStorage.removeItem", "source": "browser"},
      {"target": "localStorage.getItem", "source": "browser"}
    ],
    "uses": {}
  },
  "src/services/api.ts": {
    "imports": [
      {"source": "../types", "what": ["AboutMe", "Project", "Skill", "Experience"]},
      {"source": "../data/fallback", "what": ["fallbackAboutMe", "fallbackProjects", "fallbackSkills", "fallbackExperiences"]}
    ],
    "defines": {
      "variables": ["API_BASE_URL", "api"],
      "functions": ["fetchWithFallback", "getProject", "createProject", "updateProject", "deleteProject", "getSkill", "createSkill", "updateSkill", "deleteSkill", "getAbout", "updateAbout", "getExperiences", "getExperience", "createExperience", "updateExperience", "deleteExperience"]
    },
    "calls": [
      {"target": "fetch", "source": "browser"},
      {"target": "new AbortController", "source": "browser"},
      {"target": "setTimeout", "source": "node_builtin"},
      {"target": "controller.abort", "source": "browser"},
      {"target": "clearTimeout", "source": "node_builtin"},
      {"target": "response.ok", "source": "browser"},
      {"target": "console.error", "source": "node_builtin"},
      {"target": "new Error", "source": "node_builtin"},
      {"target": "response.json", "source": "browser"},
      {"target": "console.warn", "source": "node_builtin"},
      {"target": "JSON.stringify", "source": "node_builtin"},
      {"target": "new URL", "source": "node_builtin"},
      {"target": "url.toString", "source": "node_builtin"},
      {"target": "console.log", "source": "node_builtin"},
      {"target": "fetchWithFallback", "source": "internal"} // Called by exported functions
    ],
    "uses": {
      "types": ["AboutMe", "Project", "Skill", "Experience"],
      "variables": ["fallbackAboutMe", "fallbackProjects", "fallbackSkills", "fallbackExperiences"]
    }
  },
  "src/types/index.ts": {
    "imports": [],
    "defines": {
      "interfaces": ["Project", "Skill", "AboutMe", "Experience"]
    },
    "calls": [],
    "uses": {}
  },
  "src/types/skill.ts": {
    "imports": [],
    "defines": {
      "interfaces": ["Skill"]
    },
    "calls": [],
    "uses": {}
  },
  "src/utils/imageUtils.ts": {
    "imports": [],
    "defines": {
      "functions": ["fileToBase64", "validateImage", "resizeImage", "compressImageToMaxSize", "getBase64SizeKB"]
    },
    "calls": [
      {"target": "new Promise", "source": "node_builtin"},
      {"target": "new FileReader", "source": "browser"},
      {"target": "reader.readAsDataURL", "source": "browser"},
      {"target": "file.type.startsWith", "source": "node_builtin"},
      {"target": "new Image", "source": "browser"},
      {"target": "Math.round", "source": "node_builtin"},
      {"target": "document.createElement", "source": "browser"},
      {"target": "canvas.getContext", "source": "browser"},
      {"target": "ctx.drawImage", "source": "browser"},
      {"target": "canvas.toDataURL", "source": "browser"},
      {"target": "new Error", "source": "node_builtin"},
      {"target": "resizeImage", "source": "internal"}, // Called by compressImageToMaxSize
      {"target": "getBase64SizeKB", "source": "internal"}, // Called by compressImageToMaxSize
      {"target": "base64String.split", "source": "node_builtin"},
      {"target": "console.log", "source": "node_builtin"}
    ],
    "uses": {
      "interfaces": ["File"]
    }
  }
}
```

This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

<directory_structure>
backend/src/app.ts
backend/src/config/database.ts
backend/src/controllers/aboutController.ts
backend/src/controllers/authController.ts
backend/src/controllers/experienceController.ts
backend/src/controllers/projectController.ts
backend/src/controllers/skillController.ts
backend/src/middleware/authMiddleware.ts
backend/src/models/About.ts
backend/src/models/AboutMe.ts
backend/src/models/Experience.ts
backend/src/models/Project.ts
backend/src/models/Skill.ts
backend/src/routes/aboutRoutes.ts
backend/src/routes/authRoutes.ts
backend/src/routes/experienceRoutes.ts
backend/src/routes/projectRoutes.ts
backend/src/routes/skillRoutes.ts
backend/src/scripts/initDb.ts
backend/src/scripts/initializeDb.ts
backend/src/scripts/resetAboutCollection.ts
backend/src/scripts/setupEnv.ts
backend/src/utils/errorHandler.ts
src/app/about/page.tsx
src/app/admin/login/page.tsx
src/app/admin/page.tsx
src/app/experiences/page.tsx
src/app/layout.tsx
src/app/page.tsx
src/app/projects/page.tsx
src/app/skills/page.tsx
src/components/AboutSection.tsx
src/components/AdminAboutManager.tsx
src/components/AdminExperienceManager.tsx
src/components/AdminHeader.tsx
src/components/AdminProjectsManager.tsx
src/components/AdminSkillsManager.tsx
src/components/ExperienceSection.tsx
src/components/Navigation.tsx
src/components/ProjectCard.tsx
src/components/SkillsGrid.tsx
src/data/fallback.ts
src/lib/auth.ts
src/services/api.ts
src/types/index.ts
src/types/skill.ts
src/utils/imageUtils.ts
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="backend/src/app.ts">
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as path from 'path';
import { config } from 'dotenv';
import { connectDB } from './config/database';
import projectRoutes from './routes/projectRoutes';
import skillRoutes from './routes/skillRoutes';
import aboutRoutes from './routes/aboutRoutes';
import authRoutes from './routes/authRoutes';
import experienceRoutes from './routes/experienceRoutes';
import { AppError } from './utils/errorHandler';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 5000;

const isOnline = false;

// Middleware
app.use(express.json());
app.use(cors({
  origin: isOnline ? 'https://fluttersystems.com' : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


var base_route = '';

if (isOnline)
  base_route = '/portfolio';

// Routes
app.use(base_route + '/api/auth', authRoutes);
app.use(base_route + '/api/projects', projectRoutes);
app.use(base_route + '/api/skills', skillRoutes);
app.use(base_route + '/api/about', aboutRoutes);
app.use(base_route + '/api/experiences', experienceRoutes);

// Handle 404 errors
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

let server: any;

// Connect to MongoDB and start server
connectDB().then(() => {
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Closing server...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Handle termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Serve static files
app.use("/portfolio", express.static(path.join(__dirname, "dist")));
  
// Fallback route to serve index.html for any unmatched GET request
app.get('*', (req: Request, res: Response) => {
  console.log(__dirname);
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Start the server
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});
</file>

<file path="backend/src/config/database.ts">
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Exit process with failure
    process.exit(1);
  }
};
</file>

<file path="backend/src/controllers/aboutController.ts">
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import AboutMe, { IAboutMe } from '../models/AboutMe';
import { AppError, catchAsync } from '../utils/errorHandler';

// Get about info (always returns the first document as there should only be one)
export const getAboutMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const about = await AboutMe.findOne();
  
  if (!about) {
    return next(new AppError('About information not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: about,
  });
});

// Create or update about info
export const updateAboutMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  // Use findOneAndUpdate with upsert to create if doesn't exist
  const about = await AboutMe.findOneAndUpdate(
    {},
    req.body,
    {
      new: true,
      runValidators: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: about,
  });
});
</file>

<file path="backend/src/controllers/authController.ts">
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, catchAsync } from '../utils/errorHandler';

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;
  
  // Compare with environment variables for admin credentials
  if (username === process.env.ADMIN_USERNAME && 
      password === process.env.ADMIN_PASSWORD) {
    
    const token = jwt.sign(
      { isAdmin: true },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      status: 'success',
      token
    });
  } else {
    return next(new AppError('Invalid credentials', 401));
  }
});
</file>

<file path="backend/src/controllers/experienceController.ts">
import { Request, Response } from 'express';
import Experience from '../models/Experience';
import { adminAuth, AuthRequest } from '../middleware/authMiddleware';

// Get all experiences
export const getExperiences = async (req: Request, res: Response): Promise<void> => {
  try {
    const experiences = await Experience.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ message: 'Failed to fetch experiences' });
  }
};

// Get a single experience by ID
export const getExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const experience = await Experience.findById(id);
    
    if (!experience) {
      res.status(404).json({ message: 'Experience not found' });
      return;
    }
    
    res.status(200).json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ message: 'Failed to fetch experience' });
  }
};

// Create a new experience (admin only)
export const createExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Admin auth is checked in the middleware
    if (!req.isAdmin) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }

    const { title, company, timeframe, description, order } = req.body;
    
    const experience = new Experience({
      title,
      company,
      timeframe,
      description,
      order: order || 0,
    });
    
    const savedExperience = await experience.save();
    res.status(201).json(savedExperience);
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({ message: 'Failed to create experience' });
  }
};

// Update an experience (admin only)
export const updateExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Admin auth is checked in the middleware
    if (!req.isAdmin) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;
    
    const experience = await Experience.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!experience) {
      res.status(404).json({ message: 'Experience not found' });
      return;
    }
    
    res.status(200).json(experience);
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ message: 'Failed to update experience' });
  }
};

// Delete an experience (admin only)
export const deleteExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Admin auth is checked in the middleware
    if (!req.isAdmin) {
      res.status(403).json({ message: 'Unauthorized access' });
      return;
    }
    
    const { id } = req.params;
    const deletedExperience = await Experience.findByIdAndDelete(id);
    
    if (!deletedExperience) {
      res.status(404).json({ message: 'Experience not found' });
      return;
    }
    
    res.status(200).json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ message: 'Failed to delete experience' });
  }
};
</file>

<file path="backend/src/controllers/projectController.ts">
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Project, { IProject } from '../models/Project';
import { AppError, catchAsync } from '../utils/errorHandler';

// Get all projects
export const getAllProjects = catchAsync(async (req: Request, res: Response) => {
  const projects = await Project.find().sort({ date: -1 });
  res.status(200).json({
    status: 'success',
    data: projects,
  });
});

// Get single project
export const getProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: project,
  });
});

// Create project
export const createProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const project = await Project.create(req.body);
  res.status(201).json({
    status: 'success',
    data: project,
  });
});

// Update project
export const updateProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: project,
  });
});

// Delete project
export const deleteProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
</file>

<file path="backend/src/controllers/skillController.ts">
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Skill, { ISkill } from '../models/Skill';
import { AppError, catchAsync } from '../utils/errorHandler';

// Get all skills
export const getAllSkills = catchAsync(async (req: Request, res: Response) => {
  const skills = await Skill.find();
  res.status(200).json(skills);
});

// Get single skill
export const getSkill = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const skill = await Skill.findById(req.params.id);
  
  if (!skill) {
    return next(new AppError('Skill not found', 404));
  }

  res.status(200).json(skill);
});

// Create skill
export const createSkill = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const skill = await Skill.create(req.body);
  res.status(201).json(skill);
});

// Update skill
export const updateSkill = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const skill = await Skill.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!skill) {
    return next(new AppError('Skill not found', 404));
  }

  res.status(200).json(skill);
});

// Delete skill
export const deleteSkill = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const skill = await Skill.findByIdAndDelete(req.params.id);

  if (!skill) {
    return next(new AppError('Skill not found', 404));
  }

  res.status(204).send();
});
</file>

<file path="backend/src/middleware/authMiddleware.ts">
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  isAdmin?: boolean;
}

export const adminAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('No authentication token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.isAdmin = true;
    next();
  } catch (error) {
    next(new AppError('Not authorized as admin', 401));
  }
};
</file>

<file path="backend/src/models/About.ts">
import { Schema, model, Document } from 'mongoose';

export interface IAbout extends Document {
  name: string;
  title: string;
  bio: string;
  location: string;
  phone?: string;
  email: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

const AboutSchema = new Schema<IAbout>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
  },
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
  },
}, {
  timestamps: true,
});

export default model<IAbout>('About', AboutSchema);
</file>

<file path="backend/src/models/AboutMe.ts">
import { Schema, model, Document } from 'mongoose';

export interface IAboutMe extends Document {
  name: string;
  title: string;
  bio: string;
  location: string;
  phone?: string;
  email: string;
  imageUrl?: string;
  imageData?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

const AboutMeSchema = new Schema<IAboutMe>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  imageUrl: {
    type: String,
  },
  imageData: {
    type: String,
  },
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
  },
}, {
  timestamps: true,
});

export default model<IAboutMe>('AboutMe', AboutMeSchema);
</file>

<file path="backend/src/models/Experience.ts">
import mongoose, { Document, Schema } from 'mongoose';

export interface IExperience extends Document {
  title: string;
  company: string;
  timeframe: string;
  description: string;
  order?: number;
}

const experienceSchema = new Schema<IExperience>(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    timeframe: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IExperience>('Experience', experienceSchema);
</file>

<file path="backend/src/models/Project.ts">
import { Schema, model, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  imageData?: string;
  githubUrl?: string;
  liveUrl?: string;
  date: string;
}

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  technologies: {
    type: [String],
    required: [true, 'Technologies are required'],
  },
  imageUrl: {
    type: String,
  },
  imageData: {
    type: String,
  },
  githubUrl: {
    type: String,
    trim: true,
  },
  liveUrl: {
    type: String,
    trim: true,
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
  },
}, {
  timestamps: true,
});

// Ensure that either imageUrl or imageData is provided
ProjectSchema.pre('save', function(next) {
  if (!this.imageUrl && !this.imageData) {
    const err = new Error('Either imageUrl or imageData must be provided');
    return next(err);
  }
  next();
});

export default model<IProject>('Project', ProjectSchema);
</file>

<file path="backend/src/models/Skill.ts">
import { Schema, model, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: 'frontend' | 'backend' | 'tools' | 'other';
  proficiency: number;
  icon?: string;
}

const SkillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['frontend', 'backend', 'tools', 'other'],
  },
  proficiency: {
    type: Number,
    required: [true, 'Proficiency is required'],
    min: [1, 'Proficiency must be between 1 and 5'],
    max: [5, 'Proficiency must be between 1 and 5'],
  },
  icon: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default model<ISkill>('Skill', SkillSchema);
</file>

<file path="backend/src/routes/aboutRoutes.ts">
import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAboutMe,
  updateAboutMe,
} from '../controllers/aboutController';
import { adminAuth } from '../middleware/authMiddleware';

const router = Router();

const aboutValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('bio').trim().notEmpty().withMessage('Bio is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('socialLinks.github').optional().isURL().withMessage('Invalid GitHub URL'),
  body('socialLinks.linkedin').optional().isURL().withMessage('Invalid LinkedIn URL'),
  body('socialLinks.twitter').optional().isURL().withMessage('Invalid Twitter URL'),
];

router
  .route('/')
  .get(getAboutMe)
  .put(adminAuth, aboutValidation, updateAboutMe);

export default router;
</file>

<file path="backend/src/routes/authRoutes.ts">
import express from 'express';
import { login } from '../controllers/authController';

const router = express.Router();

router.post('/login', login);

export default router;
</file>

<file path="backend/src/routes/experienceRoutes.ts">
import express from 'express';
import { 
  getExperiences, 
  getExperience, 
  createExperience, 
  updateExperience, 
  deleteExperience 
} from '../controllers/experienceController';
import { adminAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getExperiences);
router.get('/:id', getExperience);

// Protected routes (admin only)
router.post('/', adminAuth, createExperience);
router.put('/:id', adminAuth, updateExperience);
router.delete('/:id', adminAuth, deleteExperience);

export default router;
</file>

<file path="backend/src/routes/projectRoutes.ts">
import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { adminAuth } from '../middleware/authMiddleware';

const router = Router();

const projectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('technologies').isArray().withMessage('Technologies must be an array'),
  body().custom((value) => {
    if (!value.imageUrl && !value.imageData) {
      throw new Error('Either imageUrl or imageData must be provided');
    }
    return true;
  }),
  body('date').trim().notEmpty().withMessage('Date is required'),
];

const updateProjectValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('technologies').optional().isArray().withMessage('Technologies must be an array'),
  body().custom((value) => {
    // For updates, we only validate if either field is present
    if (value.imageUrl === '' || value.imageData === '') {
      throw new Error('Image URL or data cannot be empty if provided');
    }
    return true;
  }),
  body('date').optional().trim().notEmpty().withMessage('Date cannot be empty'),
];

router
  .route('/')
  .get(getAllProjects)
  .post(adminAuth, projectValidation, createProject);

router
  .route('/:id')
  .get(getProject)
  .patch(adminAuth, updateProjectValidation, updateProject)
  .delete(adminAuth, deleteProject);

export default router;
</file>

<file path="backend/src/routes/skillRoutes.ts">
import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skillController';
import { adminAuth } from '../middleware/authMiddleware';

const router = Router();

const skillValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category')
    .isIn(['frontend', 'backend', 'tools', 'other'])
    .withMessage('Invalid category'),
  body('proficiency')
    .isInt({ min: 1, max: 5 })
    .withMessage('Proficiency must be between 1 and 5'),
];

router
  .route('/')
  .get(getAllSkills)
  .post(adminAuth, skillValidation, createSkill);

router
  .route('/:id')
  .get(getSkill)
  .patch(adminAuth, skillValidation, updateSkill)
  .delete(adminAuth, deleteSkill);

export default router;
</file>

<file path="backend/src/scripts/initDb.ts">
import mongoose from 'mongoose';
import AboutMe from '../models/AboutMe';
import dotenv from 'dotenv';

dotenv.config();

const initializeDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio');
    console.log('Connected to MongoDB');

    // Check if about data exists
    const existingAbout = await AboutMe.findOne();
    if (!existingAbout) {
      // Create initial about data
      const aboutData = {
        name: 'Your Name',
        title: 'Full Stack Developer',
        bio: 'A passionate developer with experience in modern web technologies',
        location: 'Your Location',
        email: 'your.email@example.com',
        socialLinks: {
          github: 'https://github.com/yourusername',
          linkedin: 'https://linkedin.com/in/yourusername',
          twitter: 'https://twitter.com/yourusername'
        }
      };

      const about = await AboutMe.create(aboutData);
      console.log('Created initial about data:', about);
    } else {
      console.log('About data already exists:', existingAbout);
    }

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

initializeDb();
</file>

<file path="backend/src/scripts/initializeDb.ts">
import { connectDB } from '../config/database';
import Project from '../models/Project';
import AboutMe from '../models/AboutMe';
import Experience from '../models/Experience';
import { config } from 'dotenv';

// Load environment variables
config();

const initializeDb = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB...');

    // Initialize Projects if empty
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      const sampleProject = {
        title: 'Portfolio Website',
        description: 'A personal portfolio website built with Next.js and Express',
        technologies: ['Next.js', 'Express', 'TypeScript', 'MongoDB'],
        imageUrl: 'https://via.placeholder.com/800x600',
        githubUrl: 'https://github.com/yourusername/portfolio',
        liveUrl: 'https://your-portfolio.com',
        date: '2025-03',
      };

      await Project.create(sampleProject);
      console.log('Sample project created');
    } else {
      console.log('Projects collection already initialized');
    }

    // Initialize Experiences if empty
    const experienceCount = await Experience.countDocuments();
    if (experienceCount === 0) {
      const sampleExperiences = [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Innovations Inc.',
          timeframe: 'January 2022 - Present',
          description: 'Leading the development of cloud-based solutions using React, Node.js, and AWS. Mentoring junior developers and implementing CI/CD pipelines.',
          order: 1
        },
        {
          title: 'Full Stack Developer',
          company: 'Digital Solutions Ltd.',
          timeframe: 'March 2019 - December 2021',
          description: 'Developed and maintained web applications using the MERN stack. Collaborated with design and product teams to deliver high-quality software solutions.',
          order: 2
        },
        {
          title: 'Frontend Developer',
          company: 'Creative Web Agency',
          timeframe: 'June 2017 - February 2019',
          description: 'Created responsive and interactive user interfaces using React and CSS frameworks. Worked closely with UX designers to implement pixel-perfect designs.',
          order: 3
        }
      ];

      await Experience.insertMany(sampleExperiences);
      console.log('Sample experiences created');
    } else {
      console.log('Experiences collection already initialized');
    }

    // Initialize AboutMe if empty
    const aboutCount = await AboutMe.countDocuments();
    if (aboutCount === 0) {
      const sampleAbout = {
        name: 'Your Name',
        title: 'Full Stack Developer',
        bio: 'A passionate developer with experience in web development',
        location: 'Your Location',
        phone: '+1 (123) 456-7890',
        email: 'your.email@example.com',
        socialLinks: {
          github: 'https://github.com/yourusername',
          linkedin: 'https://linkedin.com/in/yourusername',
          twitter: 'https://twitter.com/yourusername'
        }
      };

      await AboutMe.create(sampleAbout);
      console.log('About information created');
    } else {
      console.log('AboutMe collection already initialized');
    }

    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDb();
</file>

<file path="backend/src/scripts/resetAboutCollection.ts">
import { connectDB } from '../config/database';
import AboutMe from '../models/AboutMe';
import { config } from 'dotenv';

// Load environment variables
config();

async function resetAboutCollection() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB...');

    // Drop the AboutMe collection
    await AboutMe.collection.drop();
    console.log('AboutMe collection dropped successfully');

    // Initialize AboutMe with new schema including phone field
    const sampleAbout = {
      name: 'Your Name',
      title: 'Full Stack Developer',
      bio: 'A passionate developer with experience in web development',
      location: 'Your Location',
      phone: '+1 (123) 456-7890',
      email: 'your.email@example.com',
      socialLinks: {
        github: 'https://github.com/yourusername',
        linkedin: 'https://linkedin.com/in/yourusername',
        twitter: 'https://twitter.com/yourusername'
      }
    };

    await AboutMe.create(sampleAbout);
    console.log('AboutMe collection reinitialized with phone field');

  } catch (error) {
    console.error('Error resetting AboutMe collection:', error);
  } finally {
    process.exit();
  }
}

resetAboutCollection();
</file>

<file path="backend/src/scripts/setupEnv.ts">
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load existing .env if it exists
dotenv.config();

const envPath = path.join(__dirname, '../../.env');

const envContent = `PORT=5000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=your-super-secret-key-change-this
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log('Successfully created/updated .env file');
  
  // Reload environment variables
  dotenv.config();
  
  console.log('Environment variables set:');
  console.log('PORT:', process.env.PORT);
  console.log('ADMIN_USERNAME:', process.env.ADMIN_USERNAME);
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
} catch (error) {
  console.error('Error creating .env file:', error);
}
</file>

<file path="backend/src/utils/errorHandler.ts">
export class AppError extends Error {
  statusCode: number;
  status: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const catchAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
};
</file>

<file path="src/app/about/page.tsx">
'use client';

import { useState, useEffect, useRef } from 'react';
import { isAdmin, getAuthToken } from '@/lib/auth';
import { api } from '@/services/api';
import { AboutMe } from '@/types';
import { fileToBase64, validateImage, resizeImage } from '@/utils/imageUtils';
import ReactMarkdown from 'react-markdown';

export default function AboutPage() {
  const [about, setAbout] = useState<AboutMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editedAbout, setEditedAbout] = useState<AboutMe | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const aboutData = await api.getAbout();
      setAbout(aboutData);
      if (aboutData) {
        setImagePreview(aboutData.imageData || aboutData.imageUrl || '');
      }
    } catch (error) {
      console.error('Error fetching about information:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  useEffect(() => {
    if (about) {
      setEditedAbout(about);
    }
  }, [about]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedAbout(about);
    setSelectedImage(null);
    setImagePreview(about?.imageData || about?.imageUrl || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    setSelectedImage(file);
    const base64 = await fileToBase64(file);
    const resized = await resizeImage(base64);
    setImagePreview(resized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedAbout) return;

    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      const updatedAbout = { ...editedAbout };
      
      if (selectedImage) {
        const base64 = await fileToBase64(selectedImage);
        const resized = await resizeImage(base64);
        updatedAbout.imageData = resized;
        updatedAbout.imageUrl = undefined;
      }
      
      await api.updateAbout(updatedAbout, token);
      setAbout(updatedAbout);
      setIsEditing(false);
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating about information:', error);
      alert('Failed to update about information');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !about) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {isEditing && isAdminUser && editedAbout ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit About Information</h1>
              <button
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editedAbout.name}
                  onChange={(e) => setEditedAbout({ ...editedAbout, name: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editedAbout.title}
                  onChange={(e) => setEditedAbout({ ...editedAbout, title: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Profile Image
                </label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={isSubmitting}
                      ref={fileInputRef}
                    />
                  </label>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedImage ? selectedImage.name : 'No file chosen'}
                  </span>
                </div>
                {imagePreview && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-48 h-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio <span className="text-xs text-gray-500">(Supports Markdown)</span>
                </label>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      You can use **bold**, *italic*, - bullet lists, and other Markdown formatting
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      {showPreview ? 'Edit' : 'Preview'}
                    </button>
                  </div>
                  
                  {showPreview ? (
                    <div className="p-3 border rounded dark:bg-gray-800 dark:border-gray-700 prose dark:prose-invert max-w-none min-h-[8rem]">
                      <ReactMarkdown>{editedAbout.bio}</ReactMarkdown>
                    </div>
                  ) : (
                    <textarea
                      value={editedAbout.bio}
                      onChange={(e) => setEditedAbout({ ...editedAbout, bio: e.target.value })}
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                      rows={4}
                      required
                      disabled={isSubmitting}
                    ></textarea>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editedAbout.location}
                  onChange={(e) => setEditedAbout({ ...editedAbout, location: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editedAbout.phone || ''}
                  onChange={(e) => setEditedAbout({ ...editedAbout, phone: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="+1 (123) 456-7890"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editedAbout.email}
                  onChange={(e) => setEditedAbout({ ...editedAbout, email: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800 dark:text-white">Social Links</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={editedAbout.socialLinks.github}
                    onChange={(e) => setEditedAbout({
                      ...editedAbout,
                      socialLinks: { ...editedAbout.socialLinks, github: e.target.value }
                    })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="https://github.com/yourusername"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={editedAbout.socialLinks.linkedin}
                    onChange={(e) => setEditedAbout({
                      ...editedAbout,
                      socialLinks: { ...editedAbout.socialLinks, linkedin: e.target.value }
                    })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="https://linkedin.com/in/yourusername"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={editedAbout.socialLinks.twitter}
                    onChange={(e) => setEditedAbout({
                      ...editedAbout,
                      socialLinks: { ...editedAbout.socialLinks, twitter: e.target.value }
                    })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    placeholder="https://twitter.com/yourusername"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex justify-between items-center mb-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{about.name}</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-400">{about.title}</p>
                </div>
                
                {isAdminUser && (
                  <button
                    onClick={handleEdit}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Edit
                  </button>
                )}
              </div>
              
              {/* Display profile image */}
              {(about.imageData || about.imageUrl) && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={about.imageData || about.imageUrl} 
                    alt={about.name}
                    className="w-48 h-auto rounded-lg shadow-md"
                  />
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">About Me</h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>{about.bio}</ReactMarkdown>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h2>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Location:</span> {about.location}
                    </p>
                    {about.phone && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Phone:</span>{' '}
                        <a href={`tel:${about.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {about.phone}
                        </a>
                      </p>
                    )}
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Email:</span>{' '}
                      <a href={`mailto:${about.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {about.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Social Links</h2>
                  <div className="flex space-x-4">
                    {about.socialLinks.github && (
                      <a
                        href={about.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        GitHub
                      </a>
                    )}
                    {about.socialLinks.linkedin && (
                      <a
                        href={about.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        LinkedIn
                      </a>
                    )}
                    {about.socialLinks.twitter && (
                      <a
                        href={about.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        Twitter
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
</file>

<file path="src/app/admin/login/page.tsx">
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      router.push('/'); // Redirect to home after login
      router.refresh(); // Refresh the page to update admin state
    } catch (err) {
      if (err instanceof Error) {
        setError('Invalid credentials'); // Use the actual error message
      } else {
        setError('Something went wrong'); // Fallback if it's not an Error
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
</file>

<file path="src/app/admin/page.tsx">
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { api } from '@/services/api';
import { Project, Skill, AboutMe, Experience } from '@/types';
import AdminSkillsManager from '@/components/AdminSkillsManager';
import AdminProjectsManager from '@/components/AdminProjectsManager';
import AdminAboutManager from '@/components/AdminAboutManager';
import AdminExperienceManager from '@/components/AdminExperienceManager';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'about' | 'experiences'>('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [about, setAbout] = useState<AboutMe | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      router.push('/');
      return;
    }

    // Set active tab based on URL parameter
    if (tabParam === 'projects' || tabParam === 'about' || tabParam === 'skills' || tabParam === 'experiences') {
      setActiveTab(tabParam);
    }

    const fetchData = async () => {
      try {
        const [skillsData, projectsData, aboutData, experiencesData] = await Promise.all([
          api.getSkills(),
          api.getProjects(),
          api.getAbout(),
          api.getExperiences()
        ]);

        console.log('Fetched experiences:', experiencesData);
        console.log('Current active tab:', activeTab);

        setSkills(skillsData);
        setProjects(projectsData);
        setAbout(aboutData);
        setExperiences(experiencesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, tabParam, activeTab]);

  const handleRefreshData = async () => {
    try {
      setLoading(true);
      const [projectsData, skillsData, aboutData, experiencesData] = await Promise.all([
        api.getProjects(),
        api.getSkills(),
        api.getAbout(),
        api.getExperiences()
      ]);

      setSkills(skillsData);
      setProjects(projectsData);
      setAbout(aboutData);
      setExperiences(experiencesData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin()) {
    return null;
  }

  if (loading || !about) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your portfolio content</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {(['skills', 'projects', 'experiences', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* About Information Summary (shown only when About tab is active) */}
        {activeTab === 'about' && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{about.name}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{about.title}</p>
              
              {/* Display profile image */}
              {(about.imageData || about.imageUrl) && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={about.imageData || about.imageUrl} 
                    alt={about.name} 
                    className="w-48 h-auto rounded-lg shadow-md" 
                  />
                </div>
              )}
              
              <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                {about.bio.length > 150 ? `${about.bio.substring(0, 150)}...` : about.bio}
              </p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'skills' && (
            <AdminSkillsManager skills={skills} onUpdate={handleRefreshData} />
          )}
          {activeTab === 'projects' && (
            <AdminProjectsManager projects={projects} onUpdate={handleRefreshData} />
          )}
          {activeTab === 'experiences' && (
            <>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-4 mb-4 rounded-md">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Debug info: Active tab is &apos;experiences&apos;. Experience data length: {experiences.length}
                </p>
              </div>
              <AdminExperienceManager experiences={experiences} onUpdate={handleRefreshData} />
            </>
          )}
          {activeTab === 'about' && (
            <AdminAboutManager about={about} onUpdate={handleRefreshData} />
          )}
        </div>
      </div>
    </div>
  );
}
</file>

<file path="src/app/experiences/page.tsx">
'use client';

import { useState, useEffect, useCallback } from 'react';
import ExperienceSection from '@/components/ExperienceSection';
import { api } from '@/services/api';
import { Experience } from '@/types';

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const data = await api.getExperiences();
        setExperiences(data);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const handleExperienceUpdate = useCallback((updatedExperiences: Experience[]) => {
    console.log('Parent received updated experiences:', updatedExperiences.length);
    setExperiences(updatedExperiences);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
          Professional Experience
        </h1>

        {loading ? (
          <div className="text-center py-10">Loading experiences...</div>
        ) : (
          <ExperienceSection 
            experiences={experiences} 
            showAdminControls={true} 
            onExperienceUpdate={handleExperienceUpdate}
          />
        )}
      </div>
    </main>
  );
}
</file>

<file path="src/app/layout.tsx">
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "@/components/Navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio showcasing my projects and skills",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 dark:bg-gray-900`}
      >
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
</file>

<file path="src/app/page.tsx">
import AboutSection from '@/components/AboutSection';
import ProjectCard from '@/components/ProjectCard';
import SkillsGrid from '@/components/SkillsGrid';
import ExperienceSection from '@/components/ExperienceSection';
import { api } from '@/services/api';

export default async function Home() {
  // Fetch all data in parallel
  const [projects, skills, about, experiences] = await Promise.all([
    api.getProjects(),
    api.getSkills(),
    api.getAbout(),
    api.getExperiences(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-20">
        {/* About Section */}
        <AboutSection about={about} />

        {/* Projects Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </section>

        {/* Experience Section */}
        <ExperienceSection experiences={experiences} />
        {/* Skills Section */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Skills</h2>
          <SkillsGrid skills={skills} />
        </section>
      </div>
    </main>
  );
}
</file>

<file path="src/app/projects/page.tsx">
'use client';

import { useState, useEffect, useRef } from 'react';
import { isAdmin, getAuthToken } from '@/lib/auth';
import { api } from '@/services/api';
import { Project } from '@/types';
import Image from 'next/image';
import { fileToBase64, validateImage, compressImageToMaxSize } from '@/utils/imageUtils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    liveUrl: '',
    githubUrl: '',
    technologies: [],
    featured: false
  });

  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await api.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      liveUrl: '',
      githubUrl: '',
      technologies: [],
      featured: false
    });
    setIsCreating(false);
    setEditingId(null);
    setSelectedImage(null);
    setImagePreview('');
    setTechInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingId(null);
    resetForm();
  };
  
  const handleEdit = (project: Project) => {
    setIsCreating(false);
    setEditingId(project._id);
    setFormData({
      title: project.title,
      description: project.description,
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      technologies: project.technologies,
      featured: project.featured || false
    });
    setImagePreview(project.imageData || project.imageUrl || '');
  };
  
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    setSelectedImage(file);
    const base64 = await fileToBase64(file);
    const compressed = await compressImageToMaxSize(base64, 300); // Limit to 300KB
    setImagePreview(compressed);
  };

  const handleTechKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTech = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies?.filter((_, i) => i !== index) || []
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      if (isCreating) {
        if (!selectedImage) {
          alert('Please select an image for the project');
          setIsSubmitting(false);
          return;
        }
        
        const base64 = await fileToBase64(selectedImage);
        const compressed = await compressImageToMaxSize(base64, 300); // Limit to 300KB
        
        const projectToCreate = {
          ...formData,
          imageData: compressed,
          date: new Date().toISOString().split('T')[0]
        };

        const newProject = await api.createProject(projectToCreate as Omit<Project, '_id'>, token);
        setProjects([...projects, newProject]);
      } else if (editingId) {
        const updatedProject = { ...formData } as Project;
        updatedProject._id = editingId;
        
        if (selectedImage) {
          const base64 = await fileToBase64(selectedImage);
          const compressed = await compressImageToMaxSize(base64, 300); // Limit to 300KB
          updatedProject.imageData = compressed;
          updatedProject.imageUrl = undefined;
        } else if (imagePreview) {
          // Keep existing image if no new one was selected
          const existingProject = projects.find(p => p._id === editingId);
          if (existingProject) {
            updatedProject.imageData = existingProject.imageData;
            updatedProject.imageUrl = existingProject.imageUrl;
          }
        }

        const updated = await api.updateProject(editingId, updatedProject, token);
        setProjects(projects.map(project => project._id === editingId ? updated : project));
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      await api.deleteProject(id, token);
      setProjects(projects.filter(project => project._id !== id));
      
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
              Here are some of the projects I&apos;ve worked on
            </p>
          </div>
          
          {isAdminUser && !isCreating && !editingId && (
            <button
              onClick={handleCreateNew}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Add New Project
            </button>
          )}
        </div>
        
        {/* Project Form for Admin */}
        {isAdminUser && (isCreating || editingId) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isCreating ? 'Add New Project' : 'Edit Project'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Image
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    disabled={isSubmitting}
                  >
                    Browse for image...
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedImage ? selectedImage.name : imagePreview ? 'Current image selected' : 'No image selected'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isSubmitting}
                  ref={fileInputRef}
                />
                {imagePreview && (
                  <div className="mt-2 relative h-40 w-full">
                    <Image
                      src={imagePreview}
                      alt="Project preview"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Live URL
                </label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="https://github.com/username/repo"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Technologies (press Enter after each)
                </label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyPress}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="React, Next.js, etc."
                  disabled={isSubmitting}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.technologies?.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(index)}
                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Featured Project
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Project'}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No projects found.</p>
            {isAdminUser && !isCreating && (
              <button
                onClick={handleCreateNew}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mt-4"
              >
                Add Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative pb-[56.25%] bg-gray-50 dark:bg-gray-900 mt-4">
                  <Image
                    src={project.imageData || project.imageUrl || '/placeholder-project.svg'}
                    alt={project.title}
                    fill
                    className="object-contain p-2"
                    priority={false}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {project.description}
                  </p>
                  
                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                    
                    {/* Admin Controls */}
                    {isAdminUser && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
</file>

<file path="src/app/skills/page.tsx">
'use client';

import { useState, useEffect } from 'react';
import { isAdmin, getAuthToken } from '@/lib/auth';
import { api } from '@/services/api';
import { Skill } from '@/types';

const CATEGORY_LABELS = {
  frontend: 'Frontend Development',
  backend: 'Backend Development',
  tools: 'Development Tools',
  other: 'Other Skills'
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Skill, '_id'>>({
    name: '',
    category: 'frontend',
    proficiency: 1,
    icon: ''
  });

  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const skillsData = await api.getSkills();
      setSkills(skillsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError('Error loading skills');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'frontend',
      proficiency: 1,
      icon: ''
    });
    setIsCreating(false);
    setEditingId(null);
  };
  
  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      name: '',
      category: 'frontend',
      proficiency: 1,
      icon: ''
    });
  };
  
  const handleEdit = (skill: Skill) => {
    setIsCreating(false);
    setEditingId(skill._id);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      icon: skill.icon || ''
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      if (isCreating) {
        await api.createSkill(formData, token);
      } else if (editingId) {
        await api.updateSkill(editingId, formData, token);
      }
      
      fetchSkills();
      resetForm();
    } catch (error) {
      console.error('Error saving skill:', error);
      alert('Failed to save skill');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      await api.deleteSkill(id, token);
      fetchSkills();
      
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Failed to delete skill');
    }
  };
  
  const handleCancel = () => {
    resetForm();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'proficiency' ? parseInt(value, 10) : value
    }));
  };
  
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skills</h1>
          
          {isAdminUser && !isCreating && !editingId && (
            <button
              onClick={handleCreateNew}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Add New Skill
            </button>
          )}
        </div>
        
        {error && (
          <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {(isCreating || editingId) && isAdminUser && (
          <div className="mb-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {isCreating ? 'Add New Skill' : 'Edit Skill'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                >
                  <option value="frontend">Frontend Development</option>
                  <option value="backend">Backend Development</option>
                  <option value="tools">Development Tools</option>
                  <option value="other">Other Skills</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Proficiency (1-5)
                </label>
                <input
                  type="number"
                  name="proficiency"
                  min="1"
                  max="5"
                  value={formData.proficiency}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icon (optional)
                </label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="Icon name or class"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="space-y-8">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                </h2>
              </div>
              
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {categorySkills.map(skill => (
                  <li key={skill._id} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{skill.name}</h3>
                        <div className="mt-1 flex items-center">
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded-full ${
                                  i < skill.proficiency
                                    ? 'bg-blue-500'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {isAdminUser && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(skill)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(skill._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {Object.keys(groupedSkills).length === 0 && !loading && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
              <p className="text-gray-700 dark:text-gray-300">No skills found. Add some skills to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
</file>

<file path="src/components/AboutSection.tsx">
import type { AboutMe } from '@/types';
import Link from 'next/link';

export default function AboutSection({ about }: { about: AboutMe }) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">{about.name}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">{about.title}</p>
          
          {/* Image under title */}
          {(about.imageData || about.imageUrl) && (
            <div className="mt-4 flex justify-center">
              <img
                src={about.imageData || about.imageUrl}
                alt={about.name}
                className="max-w-xs h-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
            {about.bio}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{about.location}</span>
          </div>
          {about.phone && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${about.phone}`} className="hover:text-blue-600">
                {about.phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href={`mailto:${about.email}`} className="hover:text-blue-600">
              {about.email}
            </a>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-8">
          {about.socialLinks.github && (
            <Link
              href={about.socialLinks.github}
              target="_blank"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
            >
              GitHub
            </Link>
          )}
          {about.socialLinks.linkedin && (
            <Link
              href={about.socialLinks.linkedin}
              target="_blank"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
            >
              LinkedIn
            </Link>
          )}
          {about.socialLinks.twitter && (
            <Link
              href={about.socialLinks.twitter}
              target="_blank"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300"
            >
              Twitter
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
</file>

<file path="src/components/AdminAboutManager.tsx">
'use client';

import { useState, useRef } from 'react';
import { getAuthToken } from '@/lib/auth';
import { AboutMe } from '@/types';
import { api } from '@/services/api';
import { fileToBase64, validateImage, resizeImage } from '@/utils/imageUtils';

interface AdminAboutManagerProps {
  about: AboutMe;
  onUpdate: () => void;
}

export default function AdminAboutManager({ about, onUpdate }: AdminAboutManagerProps) {
  const [editedAbout, setEditedAbout] = useState<AboutMe>(about);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(about.imageData || about.imageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    setSelectedImage(file);
    const base64 = await fileToBase64(file);
    const resized = await resizeImage(base64);
    setImagePreview(resized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const updatedAbout = { ...editedAbout };
      
      if (selectedImage) {
        const base64 = await fileToBase64(selectedImage);
        const resized = await resizeImage(base64);
        updatedAbout.imageData = resized;
        updatedAbout.imageUrl = undefined;
      }
      
      await api.updateAbout(updatedAbout, getAuthToken() || '');
      await onUpdate();
    } catch (error) {
      console.error('Error updating about information:', error);
      alert('Failed to update about information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Edit About Information</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            value={editedAbout.name}
            onChange={(e) => setEditedAbout({ ...editedAbout, name: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={editedAbout.title}
            onChange={(e) => setEditedAbout({ ...editedAbout, title: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Profile Image
          </label>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100
                       dark:file:bg-blue-900 dark:file:text-blue-200"
              disabled={isSubmitting}
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs h-auto rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            value={editedAbout.bio}
            onChange={(e) => setEditedAbout({ ...editedAbout, bio: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
            rows={4}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            value={editedAbout.location}
            onChange={(e) => setEditedAbout({ ...editedAbout, location: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={editedAbout.email}
            onChange={(e) => setEditedAbout({ ...editedAbout, email: e.target.value })}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white">Social Links</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GitHub
            </label>
            <input
              type="url"
              value={editedAbout.socialLinks.github}
              onChange={(e) => setEditedAbout({
                ...editedAbout,
                socialLinks: { ...editedAbout.socialLinks, github: e.target.value }
              })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              placeholder="https://github.com/yourusername"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              value={editedAbout.socialLinks.linkedin}
              onChange={(e) => setEditedAbout({
                ...editedAbout,
                socialLinks: { ...editedAbout.socialLinks, linkedin: e.target.value }
              })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              placeholder="https://linkedin.com/in/yourusername"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Twitter
            </label>
            <input
              type="url"
              value={editedAbout.socialLinks.twitter}
              onChange={(e) => setEditedAbout({
                ...editedAbout,
                socialLinks: { ...editedAbout.socialLinks, twitter: e.target.value }
              })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              placeholder="https://twitter.com/yourusername"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <button
          type="submit"
          className={`w-full ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white py-2 px-4 rounded transition-colors`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
</file>

<file path="src/components/AdminExperienceManager.tsx">
'use client';

import { useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { Experience } from '@/types';
import { api } from '@/services/api';

interface AdminExperienceManagerProps {
  experiences: Experience[];
  onUpdate: () => void;
}

export default function AdminExperienceManager({ experiences, onUpdate }: AdminExperienceManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  console.log('AdminExperienceManager rendered with experiences:', experiences);
  
  const [formData, setFormData] = useState<Omit<Experience, '_id'>>({
    title: '',
    company: '',
    timeframe: '',
    description: '',
    order: 0
  });
  
  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      timeframe: '',
      description: '',
      order: 0
    });
    setIsCreating(false);
    setEditingId(null);
  };
  
  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      title: '',
      company: '',
      timeframe: '',
      description: '',
      order: experiences.length + 1
    });
  };
  
  const handleEdit = (experience: Experience) => {
    setIsCreating(false);
    setEditingId(experience._id);
    setFormData({
      title: experience.title,
      company: experience.company,
      timeframe: experience.timeframe,
      description: experience.description,
      order: experience.order || 0
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      if (isCreating) {
        await api.createExperience(formData, token);
      } else if (editingId) {
        await api.updateExperience(editingId, formData, token);
      }
      
      resetForm();
      await onUpdate();
    } catch (error) {
      console.error('Error saving experience:', error);
      alert('Failed to save experience');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      await api.deleteExperience(id, token);
      await onUpdate();
      
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete experience');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manage Experiences</h3>
        {!isCreating && !editingId && (
          <button
            onClick={handleCreateNew}
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Add New Experience
          </button>
        )}
      </div>
      
      {/* Experience Form */}
      {(isCreating || editingId) && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {isCreating ? 'Add New Experience' : 'Edit Experience'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timeframe
              </label>
              <input
                type="text"
                value={formData.timeframe}
                onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                placeholder="e.g., January 2022 - Present"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Order (Lower numbers shown first)
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                min={0}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Experience'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Experience List */}
      <div className="space-y-4">
        {experiences.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No experiences found. Click &quot;Add New Experience&quot; to create one.
            </p>
            {!isCreating && !editingId && (
              <button
                onClick={handleCreateNew}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Add New Experience
              </button>
            )}
          </div>
        ) : (
          experiences
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((experience) => (
              <div 
                key={experience._id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {experience.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {experience.company} • {experience.timeframe}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(experience)}
                      disabled={isSubmitting}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(experience._id)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                  {experience.description}
                </p>
                
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  Order: {experience.order || 0}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
</file>

<file path="src/components/AdminHeader.tsx">
'use client';

import { useRouter } from 'next/navigation';
import { isAdmin, logout } from '@/lib/auth';

export default function AdminHeader() {
  const router = useRouter();
  const adminStatus = isAdmin();

  const handleLogout = () => {
    logout();
    router.refresh();
  };

  if (!adminStatus) return null;

  return (
    <div className="bg-indigo-600 text-white py-2 px-4 flex justify-between items-center">
      <span className="font-semibold">Admin Mode</span>
      <button
        onClick={handleLogout}
        className="text-sm bg-indigo-700 px-3 py-1 rounded hover:bg-indigo-800 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
</file>

<file path="src/components/AdminProjectsManager.tsx">
'use client';

import { useState, useRef } from 'react';
import { getAuthToken } from '@/lib/auth';
import { Project } from '@/types';
import { api } from '@/services/api';
import { fileToBase64, validateImage, resizeImage } from '@/utils/imageUtils';

interface AdminProjectsManagerProps {
  projects: Project[];
  onUpdate: () => void;
}

export default function AdminProjectsManager({ projects, onUpdate }: AdminProjectsManagerProps) {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    liveUrl: '',
    githubUrl: '',
    technologies: [],
    featured: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    setSelectedImage(file);
    const base64 = await fileToBase64(file);
    const resized = await resizeImage(base64);
    setImagePreview(resized);
  };

  const handleTechKeyPress = (e: React.KeyboardEvent, target: 'new' | 'edit') => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (target === 'new') {
        setNewProject(prev => ({
          ...prev,
          technologies: [...(prev.technologies || []), techInput.trim()]
        }));
      } else if (editingProject) {
        setEditingProject({
          ...editingProject,
          technologies: [...editingProject.technologies, techInput.trim()]
        });
      }
      setTechInput('');
    }
  };

  const removeTech = (index: number, target: 'new' | 'edit') => {
    if (target === 'new') {
      setNewProject(prev => ({
        ...prev,
        technologies: prev.technologies?.filter((_, i) => i !== index) || []
      }));
    } else if (editingProject) {
      setEditingProject({
        ...editingProject,
        technologies: editingProject.technologies.filter((_, i) => i !== index)
      });
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setImagePreview(project.imageData || project.imageUrl || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      setIsSubmitting(true);
      await api.deleteProject(id, getAuthToken() || '');
      await onUpdate();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      setIsSubmitting(true);
      const updatedProject = { ...editingProject };
      
      if (selectedImage) {
        const base64 = await fileToBase64(selectedImage);
        const resized = await resizeImage(base64);
        updatedProject.imageData = resized;
        updatedProject.imageUrl = undefined;
      }

      await api.updateProject(editingProject._id, updatedProject, getAuthToken() || '');
      setEditingProject(null);
      setSelectedImage(null);
      setImagePreview('');
      await onUpdate();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      alert('Please select an image for the project');
      return;
    }

    try {
      setIsSubmitting(true);
      const base64 = await fileToBase64(selectedImage);
      const resized = await resizeImage(base64);
      
      const projectToCreate = {
        ...newProject,
        imageData: resized,
        date: new Date().toISOString().split('T')[0]
      };

      await api.createProject(projectToCreate as Omit<Project, '_id'>, getAuthToken() || '');
      setNewProject({
        title: '',
        description: '',
        liveUrl: '',
        githubUrl: '',
        technologies: [],
        featured: false
      });
      setSelectedImage(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await onUpdate();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add New Project Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add New Project</h3>
        <form onSubmit={handleSubmitNew} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              rows={3}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Image
            </label>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100
                         dark:file:bg-blue-900 dark:file:text-blue-200"
                disabled={isSubmitting}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-xs h-auto rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Live URL
            </label>
            <input
              type="url"
              value={newProject.liveUrl}
              onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GitHub URL
            </label>
            <input
              type="url"
              value={newProject.githubUrl}
              onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Technologies (Press Enter to add)
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyPress={(e) => handleTechKeyPress(e, 'new')}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              placeholder="Enter a technology..."
              disabled={isSubmitting}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {newProject.technologies?.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(index, 'new')}
                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className={`w-full ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white py-2 px-4 rounded transition-colors`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>

      {/* Edit Project Form */}
      {editingProject && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Edit Project</h3>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editingProject.title}
                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={editingProject.description}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                rows={3}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Image
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-blue-50 file:text-blue-700
                           hover:file:bg-blue-100
                           dark:file:bg-blue-900 dark:file:text-blue-200"
                  disabled={isSubmitting}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs h-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Live URL
              </label>
              <input
                type="url"
                value={editingProject.liveUrl}
                onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={editingProject.githubUrl}
                onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Technologies (Press Enter to add)
              </label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => handleTechKeyPress(e, 'edit')}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                placeholder="Enter a technology..."
                disabled={isSubmitting}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {editingProject.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(index, 'edit')}
                      className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className={`flex-1 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white py-2 px-4 rounded transition-colors`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingProject(null);
                  setSelectedImage(null);
                  setImagePreview('');
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Project List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Existing Projects</h3>
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex justify-between items-center"
            >
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{project.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  disabled={isSubmitting}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  disabled={isSubmitting}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
</file>

<file path="src/components/AdminSkillsManager.tsx">
'use client';

import { useState } from 'react';
import { getAuthToken } from '@/lib/auth';
import { Skill } from '@/types/skill';

interface AdminSkillsManagerProps {
  skills: Skill[];
  onUpdate: () => void;
}

export default function AdminSkillsManager({ skills, onUpdate }: AdminSkillsManagerProps) {
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({
    name: '',
    category: 'frontend',
    proficiency: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete skill');
      await onUpdate();
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Failed to delete skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills/${editingSkill._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(editingSkill),
      });

      if (!response.ok) throw new Error('Failed to update skill');
      setEditingSkill(null);
      await onUpdate();
    } catch (error) {
      console.error('Error updating skill:', error);
      alert('Failed to update skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(newSkill),
      });

      if (!response.ok) throw new Error('Failed to create skill');
      const data = await response.json();
      console.log('New skill created:', data);
      setNewSkill({ name: '', category: 'frontend', proficiency: 1 });
      await onUpdate();
    } catch (error) {
      console.error('Error creating skill:', error);
      alert('Failed to create skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Add New Skill Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add New Skill</h3>
        <form onSubmit={handleSubmitNew} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="Skill name"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as Skill['category'] })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              disabled={isSubmitting}
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="tools">Tools</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proficiency (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={newSkill.proficiency}
              onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            className={`w-full ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white py-2 px-4 rounded transition-colors`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Skill'}
          </button>
        </form>
      </div>

      {/* Existing Skills List */}
      <div className="space-y-4">
        {skills.map((skill) => (
          <div key={skill._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            {editingSkill?._id === skill._id ? (
              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingSkill.category}
                    onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value as Skill['category'] })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    disabled={isSubmitting}
                  >
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="tools">Tools</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Proficiency (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editingSkill.proficiency}
                    onChange={(e) => setEditingSkill({ ...editingSkill, proficiency: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className={`flex-1 ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white py-2 px-4 rounded transition-colors`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSkill(null)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{skill.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Category: {skill.category} | Proficiency: {skill.proficiency}/5
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(skill)}
                    className={`px-3 py-1 ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white rounded transition-colors`}
                    disabled={isSubmitting}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(skill._id)}
                    className={`px-3 py-1 ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white rounded transition-colors`}
                    disabled={isSubmitting}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
</file>

<file path="src/components/ExperienceSection.tsx">
'use client';

import { useEffect, useState } from 'react';
import { Experience } from '@/types';
import { api } from '@/services/api';
import { getAuthToken } from '@/lib/auth';
//import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface ExperienceSectionProps {
  experiences?: Experience[];
  showAdminControls?: boolean;
  onExperienceUpdate?: (updatedExperiences: Experience[]) => void;
}

export default function ExperienceSection({ 
  experiences: initialExperiences,
  showAdminControls = false,
  onExperienceUpdate
}: ExperienceSectionProps) {
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences || []);
  const [loading, setLoading] = useState(!initialExperiences);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  //const pathname = usePathname();
  
  const [formData, setFormData] = useState<Omit<Experience, '_id'>>({
    title: '',
    company: '',
    timeframe: '',
    description: '',
    order: 0
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const token = getAuthToken();
    setIsAdmin(!!token);
    
    if (initialExperiences) {
      setExperiences(initialExperiences);
      setLoading(false);
      return;
    }
    
    const fetchExperiences = async () => {
      try {
        const data = await api.getExperiences();
        setExperiences(data);
      } catch (error) {
        console.error('Error fetching experiences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [initialExperiences]);

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      timeframe: '',
      description: '',
      order: 0
    });
    setIsCreating(false);
    setEditingId(null);
  };
  
  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      title: '',
      company: '',
      timeframe: '',
      description: '',
      order: experiences.length + 1
    });
  };
  
  const handleEdit = (experience: Experience) => {
    setIsCreating(false);
    setEditingId(experience._id);
    setFormData({
      title: experience.title,
      company: experience.company,
      timeframe: experience.timeframe,
      description: experience.description,
      order: experience.order || 0
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      if (isCreating) {
        const newExperience = await api.createExperience(formData, token);
        console.log('Created experience:', newExperience);
        // Update state with the new experience
        setExperiences(prevExperiences => [...prevExperiences, newExperience]);
      } else if (editingId) {
        const updatedExperience = await api.updateExperience(editingId, formData, token);
        console.log('Updated experience:', updatedExperience);
        // Update state by replacing the edited experience
        setExperiences(prevExperiences => 
          prevExperiences.map(exp => 
            exp._id === editingId ? updatedExperience : exp
          )
        );
      }
      
      // Notify parent after state update
      setTimeout(() => notifyParentOfChanges(), 0);
      
      resetForm();
    } catch (error) {
      console.error('Error saving experience:', error);
      alert('Failed to save experience');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      
      if (!token) {
        alert('You must be logged in to perform this action');
        return;
      }
      
      console.log('Attempting to delete experience with ID:', id);
      
      // Optimistically update the UI first
      setExperiences(prevExperiences => prevExperiences.filter(exp => exp._id !== id));
      
      // Then make the API call
      await api.deleteExperience(id, token);
      console.log('Successfully deleted experience with ID:', id);
      
      // Notify parent after state update
      setTimeout(() => notifyParentOfChanges(), 0);
      
      // Reset form if we were editing the deleted experience
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete experience. Please check the console for details.');
      
      // Refresh the experiences list to ensure UI is in sync with backend
      try {
        const refreshedExperiences = await api.getExperiences();
        setExperiences(refreshedExperiences);
      } catch (refreshError) {
        console.error('Error refreshing experiences:', refreshError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const notifyParentOfChanges = () => {
    if (onExperienceUpdate) {
      onExperienceUpdate(experiences);
    }
  };

  if (loading) {
    return (
      <div className="py-10">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mx-auto"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only show admin controls if explicitly enabled and user is admin
  const shouldShowAdminControls = showAdminControls && isAdmin;

  return (
    <section className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Experience
          </h2>
          
          {shouldShowAdminControls && !isCreating && !editingId && (
            <button
              onClick={handleCreateNew}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Add New Experience
            </button>
          )}
        </div>
        
        {/* Experience Form for Admin */}
        {shouldShowAdminControls && (isCreating || editingId) && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isCreating ? 'Add New Experience' : 'Edit Experience'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timeframe
                </label>
                <input
                  type="text"
                  value={formData.timeframe}
                  onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                  placeholder="e.g., Jan 2020 - Present"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-xs text-gray-500">(Supports Markdown)</span>
                </label>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      You can use **bold**, *italic*, - bullet lists, and other Markdown formatting
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      {showPreview ? 'Edit' : 'Preview'}
                    </button>
                  </div>
                  
                  {showPreview ? (
                    <div className="p-3 border rounded dark:bg-gray-800 dark:border-gray-700 prose dark:prose-invert max-w-none min-h-[8rem]">
                      <ReactMarkdown>{formData.description}</ReactMarkdown>
                    </div>
                  ) : (
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white h-32"
                      required
                      disabled={isSubmitting}
                    ></textarea>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Experience Timeline */}
        <div className="space-y-12">
          {experiences && experiences.length > 0 ? 
            experiences
              .filter(experience => experience && experience.title) // Filter out any invalid experiences
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((experience) => (
                <div key={experience._id} className="relative">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 mb-4 md:mb-0">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {experience.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {experience.company}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {experience.timeframe}
                      </p>
                      
                      {shouldShowAdminControls && (
                        <div className="mt-2 space-x-2">
                          <button
                            onClick={() => handleEdit(experience)}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                            disabled={isSubmitting}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(experience._id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            disabled={isSubmitting}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:w-2/3">
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{experience.description}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : <p>No experiences to display.</p>}
        </div>
      </div>
    </section>
  );
}
</file>

<file path="src/components/Navigation.tsx">
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { isAdmin, logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Check admin status on client-side whenever route changes
  useEffect(() => {
    const checkAdminStatus = () => {
      setIsAdminUser(isAdmin());
    };
    
    checkAdminStatus();
    
    // Add event listener for storage changes (for when token is added/removed)
    window.addEventListener('storage', checkAdminStatus);
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, [pathname, searchParams]);

  const handleLogout = () => {
    logout();
    setIsAdminUser(false);
    router.refresh();
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/skills', label: 'Skills' },
    { href: '/projects', label: 'Projects' },
    { href: '/experiences', label: 'Experiences' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                  pathname === item.href
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center">
            {isAdminUser && (
              <>
                <span className="mr-4 px-3 py-2 inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  Admin Panel
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
</file>

<file path="src/components/ProjectCard.tsx">
import { Project } from '@/types';
import Image from 'next/image';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  // Prioritize imageData (uploaded image) over imageUrl
  const imageSource = project.imageData || project.imageUrl || '/placeholder-project.svg';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative pb-[56.25%] bg-gray-50 dark:bg-gray-900 mt-4">
        <Image
          src={imageSource}
          alt={project.title}
          fill
          className="object-contain p-2"
          priority={false}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {project.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {project.description}
        </p>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {project.technologies.map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {tech}
            </span>
          ))}
        </div>
        
        <div className="flex space-x-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
</file>

<file path="src/components/SkillsGrid.tsx">
import { isAdmin } from '@/lib/auth';
import type { Skill } from '@/types';
import AdminSkillsManager from './AdminSkillsManager';

interface SkillsGridProps {
  skills: Skill[];
  onUpdate?: () => void;
}

const CATEGORY_LABELS = {
  frontend: 'Frontend Development',
  backend: 'Backend Development',
  tools: 'Development Tools',
  other: 'Other Skills'
} as const;

export default function SkillsGrid({ skills, onUpdate }: SkillsGridProps) {
  const categories = ['frontend', 'backend', 'tools', 'other'] as const;
  const adminStatus = isAdmin();

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category) => {
          const categorySkills = skills.filter((skill) => skill.category === category);
          if (categorySkills.length === 0) return null;

          return (
            <div key={category} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                {CATEGORY_LABELS[category]}
              </h3>
              <div className="space-y-6">
                {categorySkills.map((skill) => (
                  <div key={skill._id} className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {skill.name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {skill.proficiency}/5
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                        style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Controls */}
      {adminStatus && onUpdate && (
        <div className="mt-12 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Manage Skills
          </h2>
          <AdminSkillsManager skills={skills} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}
</file>

<file path="src/data/fallback.ts">
import { AboutMe, Project, Skill, Experience } from '../types';

export const fallbackProjects: Project[] = [
  {
    _id: '1',
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce platform built with Next.js, Node.js, and MongoDB',
    technologies: ['Next.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1000&h=600',
    githubUrl: 'https://github.com/username/ecommerce',
    liveUrl: 'https://ecommerce-demo.com',
    date: '2024-12',
    featured: true
  },
  {
    _id: '2',
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates',
    technologies: ['React', 'Express', 'Socket.io', 'PostgreSQL'],
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=1000&h=600',
    githubUrl: 'https://github.com/username/taskmanager',
    date: '2024-09',
    featured: false
  },
];

export const fallbackSkills: Skill[] = [
  {
    _id: '1',
    name: 'React',
    category: 'frontend',
    proficiency: 5,
    icon: 'react',
  },
  {
    _id: '2',
    name: 'Node.js',
    category: 'backend',
    proficiency: 4,
    icon: 'nodejs',
  },
  {
    _id: '3',
    name: 'MongoDB',
    category: 'backend',
    proficiency: 4,
    icon: 'mongodb',
  },
  {
    _id: '4',
    name: 'TypeScript',
    category: 'frontend',
    proficiency: 5,
    icon: 'typescript',
  },
];

export const fallbackExperiences: Experience[] = [
  {
    _id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Innovations Inc.',
    timeframe: 'January 2022 - Present',
    description: 'Leading the development of cloud-based solutions using React, Node.js, and AWS. Mentoring junior developers and implementing CI/CD pipelines.',
    order: 1
  },
  {
    _id: '2',
    title: 'Full Stack Developer',
    company: 'Digital Solutions Ltd.',
    timeframe: 'March 2019 - December 2021',
    description: 'Developed and maintained web applications using the MERN stack. Collaborated with design and product teams to deliver high-quality software solutions.',
    order: 2
  },
  {
    _id: '3',
    title: 'Frontend Developer',
    company: 'Creative Web Agency',
    timeframe: 'June 2017 - February 2019',
    description: 'Created responsive and interactive user interfaces using React and CSS frameworks. Worked closely with UX designers to implement pixel-perfect designs.',
    order: 3
  }
];

export const fallbackAboutMe: AboutMe = {
  _id: '1',
  name: 'John Doe',
  title: 'Full Stack Developer',
  bio: 'Passionate full-stack developer with 5 years of experience building web applications. Specialized in React, Node.js, and cloud technologies.',
  location: 'Stockholm, Sweden',
  phone: '+1 (123) 456-7890',
  email: 'contact@example.com',
  imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=400',
  socialLinks: {
    github: 'https://github.com/username',
    linkedin: 'https://linkedin.com/in/username',
    twitter: 'https://twitter.com/username',
  },
};
</file>

<file path="src/lib/auth.ts">
// Authentication utility functions
export const login = async (username: string, password: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminToken', data.token);
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  }
  return data;
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('adminToken');
};

export const isAdmin = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!getAuthToken();
};
</file>

<file path="src/services/api.ts">
import { AboutMe, Project, Skill, Experience } from '../types';
import { fallbackAboutMe, fallbackProjects, fallbackSkills, fallbackExperiences } from '../data/fallback';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function fetchWithFallback<T>(endpoint: string, fallbackData: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`API request failed for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.warn(`Failed to fetch ${endpoint}, using fallback data:`, error);
    return fallbackData;
  }
}

// Project API calls

const getProject = async (id: string): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`);
  if (!response.ok) throw new Error('Failed to fetch project');
  const data = await response.json();
  return data.data;
};

const createProject = async (project: Omit<Project, '_id'>, token: string): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create project');
  }
  
  const data = await response.json();
  return data.data;
};

const updateProject = async (id: string, project: Partial<Project>, token: string): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(project)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update project');
  }
  
  const data = await response.json();
  return data.data;
};

const deleteProject = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete project');
  }
};

// Skill API calls
const getSkill = async (id: string): Promise<Skill> => {
  const response = await fetch(`${API_BASE_URL}/api/skills/${id}`);
  if (!response.ok) throw new Error('Failed to fetch skill');
  const data = await response.json();
  return data.data;
};

const createSkill = async (skill: Omit<Skill, '_id'>, token: string): Promise<Skill> => {
  const response = await fetch(`${API_BASE_URL}/api/skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(skill)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create skill');
  }
  
  const data = await response.json();
  return data.data;
};

const updateSkill = async (id: string, skill: Partial<Skill>, token: string): Promise<Skill> => {
  const response = await fetch(`${API_BASE_URL}/api/skills/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(skill)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update skill');
  }
  
  const data = await response.json();
  return data.data;
};

const deleteSkill = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/skills/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete skill');
  }
};

// About API calls
const getAbout = async (): Promise<AboutMe> => {
  return fetchWithFallback<AboutMe>('/about', fallbackAboutMe);
};

const updateAbout = async (about: Partial<AboutMe>, token: string): Promise<AboutMe> => {
  const response = await fetch(`${API_BASE_URL}/api/about`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(about)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update about information');
  }
  
  const data = await response.json();
  return data.data;
};

// Experience API calls
const getExperiences = async (): Promise<Experience[]> => {
  return fetchWithFallback<Experience[]>('/experiences', fallbackExperiences);
};

const getExperience = async (id: string): Promise<Experience> => {
  return fetchWithFallback<Experience>(`/experiences/${id}`, fallbackExperiences[0]);
};

const createExperience = async (experience: Omit<Experience, '_id'>, token: string): Promise<Experience> => {
  const response = await fetch(`${API_BASE_URL}/api/experiences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(experience)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create experience');
  }
  
  const data = await response.json();
  return data;
};

const updateExperience = async (id: string, experience: Partial<Experience>, token: string): Promise<Experience> => {
  const response = await fetch(`${API_BASE_URL}/api/experiences/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(experience)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update experience');
  }
  
  const data = await response.json();
  return data;
};

const deleteExperience = async (id: string, token: string): Promise<void> => {
  console.log(`Attempting to delete experience with ID: ${id}`);
  console.log(`API URL: ${API_BASE_URL}/api/experiences/${id}`);
  
  try {
    // Make sure the URL is properly formatted
    const url = new URL(`${API_BASE_URL}/api/experiences/${id}`);
    
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Delete response status: ${response.status}`);
    
    if (!response.ok) {
      let errorMessage = `Failed to delete experience (Status: ${response.status})`;
      
      try {
        const errorData = await response.json();
        console.error('Delete experience error response:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        console.error('Error parsing error response:', jsonError);
      }
      
      throw new Error(errorMessage);
    }
    
    console.log('Experience deleted successfully');
  } catch (error) {
    console.error('Error in deleteExperience function:', error);
    throw error;
  }
};

export const api = {
  getProjects: () => fetchWithFallback<Project[]>('/projects', fallbackProjects),
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getSkills: () => fetchWithFallback<Skill[]>('/skills', fallbackSkills),
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
  getAbout,
  updateAbout,
  getExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience
};
</file>

<file path="src/types/index.ts">
// Type to ensure at least one image source is present
// type ImageSource = {
//   imageUrl: string;
//   imageData?: never;
// } | {
//   imageUrl?: never;
//   imageData: string;
// } | {
//   imageUrl: string;
//   imageData: string;
// };

export interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  imageData?: string;
  githubUrl?: string;
  liveUrl?: string;
  date: string;
  featured?: boolean;
}

export interface Skill {
  _id: string;
  name: string;
  category: 'frontend' | 'backend' | 'tools' | 'other';
  proficiency: number; // 1-5
  icon?: string;
}

export interface AboutMe {
  _id: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  phone?: string;
  email: string;
  imageUrl?: string;
  imageData?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface Experience {
  _id: string;
  title: string;
  company: string;
  timeframe: string;
  description: string;
  order?: number;
}
</file>

<file path="src/types/skill.ts">
export interface Skill {
  _id: string;
  name: string;
  category: 'frontend' | 'backend' | 'tools' | 'other';
  proficiency: number;
}
</file>

<file path="src/utils/imageUtils.ts">
/**
 * Converts a file to a base64 string
 * @param file The file to convert
 * @returns Promise that resolves to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Validates if a file is an image and within size limits
 * @param file The file to validate
 * @param maxSizeMB Maximum file size in MB
 * @returns Object with validation result and error message if any
 */
export const validateImage = (file: File, maxSizeMB = 5): { valid: boolean; message?: string } => {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return { valid: false, message: 'File must be an image' };
  }

  // Check file size (default max 5MB)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, message: `Image size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
};

/**
 * Resizes an image to a maximum width/height while maintaining aspect ratio
 * @param base64 The base64 string of the image
 * @param maxWidth Maximum width in pixels
 * @param maxHeight Maximum height in pixels
 * @param quality JPEG quality (0-1), lower values mean smaller file size
 * @returns Promise that resolves to a resized base64 string
 */
export const resizeImage = (
  base64: string, 
  maxWidth = 800, 
  maxHeight = 600,
  quality = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Use a lower quality setting to reduce file size
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Error loading image'));
  });
};

/**
 * Compresses an image to ensure it's below a certain file size limit
 * @param base64 The base64 string of the image
 * @param maxSizeKB Maximum file size in KB
 * @returns Promise that resolves to a compressed base64 string
 */
export const compressImageToMaxSize = async (
  base64: string,
  maxSizeKB = 500
): Promise<string> => {
  // Start with reasonable dimensions and quality
  let currentQuality = 0.7;
  let maxWidth = 800;
  let maxHeight = 600;
  let compressedImage = await resizeImage(base64, maxWidth, maxHeight, currentQuality);
  
  // Function to estimate base64 size in KB
  const getBase64SizeKB = (base64String: string): number => {
    // Remove data URL header (e.g., "data:image/jpeg;base64,")
    const base64Data = base64String.split(',')[1];
    // Base64 encodes 3 bytes into 4 characters
    const sizeInBytes = (base64Data.length * 3) / 4;
    return sizeInBytes / 1024;
  };
  
  let currentSizeKB = getBase64SizeKB(compressedImage);
  console.log(`Initial compressed size: ${currentSizeKB.toFixed(2)}KB`);
  
  // If the image is still too large, progressively reduce quality and dimensions
  let attempts = 0;
  const maxAttempts = 5; // Prevent infinite loops
  
  while (currentSizeKB > maxSizeKB && attempts < maxAttempts) {
    attempts++;
    
    // Reduce quality first
    if (currentQuality > 0.3) {
      currentQuality -= 0.1;
    } else {
      // If quality is already low, reduce dimensions
      maxWidth = Math.round(maxWidth * 0.8);
      maxHeight = Math.round(maxHeight * 0.8);
    }
    
    compressedImage = await resizeImage(base64, maxWidth, maxHeight, currentQuality);
    currentSizeKB = getBase64SizeKB(compressedImage);
    
    console.log(`Compression attempt ${attempts}: ${currentSizeKB.toFixed(2)}KB (Quality: ${currentQuality.toFixed(1)}, Dimensions: ${maxWidth}x${maxHeight})`);
  }
  
  return compressedImage;
};
</file>

</files>
