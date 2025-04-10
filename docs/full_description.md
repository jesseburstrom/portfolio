Okay, here is a detailed technical description of the project based on the provided file structure and contents, focusing on the Express backend and the Next.js/React frontend (as indicated by the `src` directory structure and `.tsx` files, not Flutter).

**Project Overview**

This project is a full-stack personal portfolio website designed to showcase projects, skills, professional experience, and personal information. It consists of two main parts:

1.  **Backend:** A RESTful API built with Node.js and Express, using MongoDB (via Mongoose) for data persistence. It handles data management and authentication.
2.  **Frontend:** A dynamic web application built with Next.js (using the App Router) and React, styled with Tailwind CSS. It consumes the backend API to display portfolio content and provides an administrative interface for managing this content.

---

**Backend (Express in `backend` folder)**

The backend is responsible for serving data via a REST API and handling administrative authentication.

1.  **Core Framework & Setup (`app.ts`)**
    *   **Framework:** Express.js is the core web framework.
    *   **Middleware:**
        *   `express.json()`: Parses incoming JSON request bodies.
        *   `cors`: Enables Cross-Origin Resource Sharing, allowing the frontend (potentially running on a different domain/port during development) to interact with the API.
        *   **Custom Logging:** A simple middleware logs incoming requests (`method`, `url`, `timestamp`).
        *   **404 Handler:** Catches requests to undefined routes using `app.all('*', ...)`.
        *   **Global Error Handler:** A centralized middleware catches errors (operational or programming), standardizes the error response format (status, message, stack trace in development), and uses the `AppError` class.
    *   **Environment Variables:** `dotenv` is used to load configuration (port, database URI, admin credentials, JWT secret) from a `.env` file. `backend/src/scripts/setupEnv.ts` helps create a default `.env` file.
    *   **Database Connection:** `config/database.ts` handles the connection to MongoDB using Mongoose. The connection is established before the server starts listening.
    *   **Server Initialization:** The Express app listens on the port specified by `process.env.PORT` (defaulting to 5000).
    *   **Graceful Shutdown:** Handles `SIGTERM` and `SIGINT` signals to close the server and database connection properly.

2.  **API Structure & Routing (`routes/*`)**
    *   The API follows a RESTful pattern, with routes organized by resource type (auth, projects, skills, about, experiences).
    *   **Router:** `express.Router` is used to modularize route definitions.
    *   **Base Path:** All API routes are prefixed with `/api`.
    *   **Resource Routes:**
        *   `/api/auth`: Handles admin login (`authRoutes.ts`).
        *   `/api/projects`: CRUD operations for projects (`projectRoutes.ts`).
        *   `/api/skills`: CRUD operations for skills (`skillRoutes.ts`).
        *   `/api/about`: GET and PUT operations for the single "About Me" document (`aboutRoutes.ts`).
        *   `/api/experiences`: CRUD operations for work experiences (`experienceRoutes.ts`).
    *   **Validation:** `express-validator` is used in route definitions (e.g., `projectValidation`, `skillValidation`) to validate request bodies before they reach the controllers.

3.  **Controllers (`controllers/*`)**
    *   Contain the core logic for handling requests for each resource.
    *   Interact with Mongoose models to perform database operations.
    *   Use the `catchAsync` utility (`utils/errorHandler.ts`) to wrap asynchronous functions, ensuring errors are passed to the global error handler.
    *   Structure responses consistently (e.g., `{ status: 'success', data: ... }` or directly returning data/arrays).
    *   Handle specific logic like the `upsert` operation in `aboutController.ts` to ensure only one "About Me" document exists.

4.  **Data Models (`models/*`)**
    *   **ORM/ODM:** Mongoose is used as the Object Data Mapper (ODM) for MongoDB.
    *   **Schemas:** Define the structure and validation rules for each data collection:
        *   `AboutMe.ts`: Stores personal information, bio, contact details, social links, and optionally an `imageData` (base64 string) or `imageUrl`. Uses `setDefaultsOnInsert` and validation (required fields, email format).
        *   `Project.ts`: Defines project details, including title, description, technologies (array of strings), links, date, and `imageData`/`imageUrl`. Includes a `pre('save')` hook to ensure at least one image source is provided.
        *   `Skill.ts`: Defines skills with name, category (`enum`), proficiency (1-5 `min`/`max`), and an optional icon string.
        *   `Experience.ts`: Defines work experience entries with title, company, timeframe, description, and an `order` field for sorting.
    *   **Timestamps:** Most schemas include `timestamps: true` to automatically add `createdAt` and `updatedAt` fields.
    *   *Note: `About.ts` seems like an older or potentially unused version compared to `AboutMe.ts`.*

5.  **Authentication & Authorization (`authController.ts`, `authMiddleware.ts`)**
    *   **Strategy:** Uses JSON Web Tokens (JWT) for stateless authentication.
    *   **Login (`authController.login`):**
        *   Compares provided `username` and `password` against `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables.
        *   If credentials match, it signs a JWT containing `{ isAdmin: true }` using `jsonwebtoken` and the `JWT_SECRET` from `.env`.
        *   The token has an expiration time ('24h').
        *   Returns the token to the client upon successful login.
    *   **Middleware (`authMiddleware.adminAuth`):**
        *   Applied to protected routes (POST, PUT, PATCH, DELETE operations on portfolio content).
        *   Extracts the token from the `Authorization: Bearer <token>` header.
        *   Verifies the token using `jwt.verify` and the `JWT_SECRET`.
        *   If valid, sets `req.isAdmin = true` and calls `next()`.
        *   If invalid or missing, calls `next()` with an `AppError` (401 Unauthorized).

6.  **Error Handling (`utils/errorHandler.ts`)**
    *   **`AppError` Class:** Custom error class extending `Error`, adding `statusCode` and `status` ('fail' or 'error') properties for consistent error handling.
    *   **`catchAsync` Utility:** A higher-order function that wraps async route handlers, catching any rejected promises and passing the error to Express's `next` function, which directs it to the global error handler.

7.  **Database Scripts (`scripts/*`)**
    *   Utilities for database management:
        *   `initDb.ts` / `initializeDb.ts`: Scripts to populate the database with initial/sample data for AboutMe, Projects, and Experiences if the collections are empty.
        *   `resetAboutCollection.ts`: Specific script to drop and reinitialize the AboutMe collection (likely used during schema changes).
        *   `setupEnv.ts`: Creates a basic `.env` file with default values if one doesn't exist.

---

**Frontend (Next.js/React in `src` folder)**

The frontend is a modern web application built with Next.js, responsible for displaying the portfolio and providing an admin interface.

1.  **Core Framework & Setup**
    *   **Framework:** Next.js (version likely 13+ using the App Router).
    *   **Language:** TypeScript (`.tsx` files).
    *   **UI Library:** React.
    *   **Routing:** Next.js App Router (`src/app` directory). File-system based routing where folders define route segments and `page.tsx` files define the UI for that segment.
    *   **Layout:** `src/app/layout.tsx` defines the root layout, including HTML structure, body, fonts (`next/font/google`), and wraps children in the main `<Navigation>` component (using `Suspense` for potential loading states).
    *   **Styling:** Tailwind CSS is used for utility-first styling (inferred from class names like `dark:bg-gray-900`, `text-xl`, `py-12`, `grid`, etc.). Global styles are likely defined in `src/app/globals.css`.

2.  **Directory Structure**
    *   `src/app`: Core application routes and pages (App Router).
    *   `src/components`: Reusable React components (both display and interactive/admin components).
    *   `src/lib`: Utility functions, particularly authentication logic (`auth.ts`).
    *   `src/services`: API interaction layer (`api.ts`).
    *   `src/types`: TypeScript type definitions (`index.ts`, `skill.ts`).
    *   `src/utils`: General utility functions, especially for image handling (`imageUtils.ts`).
    *   `src/data`: Fallback data used by the API service (`fallback.ts`).

3.  **Component Structure (`components/*`)**
    *   **Display Components:** `AboutSection`, `ProjectCard`, `SkillsGrid`, `ExperienceSection`. These primarily receive data as props and render it. Some use `ReactMarkdown` to render Markdown content (e.g., Bio, Experience Description).
    *   **Navigation:** `Navigation.tsx` handles site navigation using `next/link`. It's a client component (`'use client'`) to check `isAdmin` status dynamically using `localStorage` via `lib/auth.ts` and update the UI accordingly (showing/hiding admin links/logout button).
    *   **Admin Components:**
        *   `AdminDashboard.tsx`: The main container for the admin section (`'use client'`). Manages tabs (Skills, Projects, Experiences, About), fetches all necessary data via `api.ts`, and renders the appropriate manager component based on the active tab. It uses `useRouter` and `useSearchParams` to sync the active tab with the URL query parameter (`?tab=...`).
        *   `Admin*Manager.tsx` (e.g., `AdminSkillsManager`, `AdminProjectsManager`, `AdminExperienceManager`, `AdminAboutManager`): Client components (`'use client'`) providing forms and lists for CRUD operations on specific data types. They manage local form state (`useState`), handle user input, interact with `api.ts` (using the auth token from `lib/auth.ts`), manage submission states (`isSubmitting`), and call the `onUpdate` prop (passed down from `AdminDashboard`) to refresh data after successful operations.
        *   `AdminHeader.tsx`: A simple client component showing an "Admin Mode" indicator and logout button if the user is an admin.

4.  **State Management**
    *   Primarily uses React's built-in hooks (`useState`, `useEffect`) within client components (`'use client'`) for managing local component state (form data, loading states, editing states, etc.).
    *   Global state seems minimal, relying on fetching data as needed or passing data down through props (e.g., from `AdminDashboard` to manager components). Admin status is managed via `localStorage` and checked dynamically in relevant components.

5.  **API Interaction (`services/api.ts`)**
    *   Centralizes all communication with the backend Express API.
    *   Uses `fetch` to make HTTP requests.
    *   Reads the backend URL from `process.env.NEXT_PUBLIC_API_URL`.
    *   Includes functions for each API endpoint (e.g., `getProjects`, `createSkill`, `updateAbout`, `deleteExperience`).
    *   Handles sending the JWT token in the `Authorization` header for protected routes.
    *   Implements a `fetchWithFallback` mechanism: Attempts to fetch from the API, but if the request fails (e.g., timeout, network error, non-OK response), it logs a warning and returns predefined fallback data from `src/data/fallback.ts`. This ensures the frontend can still display *some* content even if the backend is unavailable.
    *   Parses JSON responses and handles potential errors by throwing `Error` objects.

6.  **Authentication Handling (`lib/auth.ts`, `Navigation.tsx`, Admin Components)**
    *   **Login:** `AdminLogin` page (`src/app/admin/login/page.tsx`) collects credentials and calls `login` from `lib/auth.ts`.
    *   **Storage:** `lib/auth.ts` stores the JWT token received from the backend in `localStorage` (`adminToken`).
    *   **Status Check:** `isAdmin()` function checks for the presence of the token in `localStorage`. Client components like `Navigation` and admin pages/components use this to conditionally render UI elements or redirect (e.g., `AdminDashboard` redirects if `isAdmin()` is false).
    *   **Logout:** `logout()` function removes the token from `localStorage`.
    *   **Token Usage:** Admin components retrieve the token using `getAuthToken()` and pass it to `api.ts` functions that require authorization.
    *   **Event Listener:** `lib/auth.ts` dispatches a `storage` event on login/logout, and `Navigation.tsx` listens for this event to update its state immediately without requiring a full page refresh.

7.  **Image Handling (`utils/imageUtils.ts`, Admin Components, `ProjectCard`)**
    *   **Upload:** Admin components (e.g., `AdminProjectsManager`, `AdminAboutManager`) use an `<input type="file">`.
    *   **Client-Side Processing:** When a file is selected:
        *   `validateImage`: Checks if the file is an image and within size limits (e.g., < 5MB).
        *   `fileToBase64`: Converts the `File` object to a base64 string for preview and transmission.
        *   `resizeImage` / `compressImageToMaxSize`: Resizes the image (e.g., max 800x600) and compresses it (e.g., target < 300-500KB) using a `<canvas>` element, adjusting JPEG quality to meet size targets. This is done client-side *before* sending to the backend.
    *   **Preview:** The generated (resized/compressed) base64 string is used to display an image preview (`<img>` tag or `next/image`) in the admin form.
    *   **Storage:** The final compressed base64 string is stored in the `imageData` field of the relevant Mongoose model (Project, AboutMe) via the API.
    *   **Display:** Components like `ProjectCard` and `AboutSection` prioritize rendering `imageData` if present, otherwise falling back to `imageUrl` (if provided) or a placeholder. `next/image` is used for optimized image delivery.

8.  **Data Types (`types/*`)**
    *   TypeScript interfaces (`Project`, `Skill`, `AboutMe`, `Experience`) define the shape of the data used throughout the frontend, ensuring type safety. These generally mirror the Mongoose schemas on the backend.
    *   *Note: There's a slight redundancy with `Skill` defined in both `index.ts` and `skill.ts`.*

---

**Data Flow Summary**

1.  **Public View:** User visits a page (e.g., `/projects`). The Next.js server or client component fetches data from the backend Express API (`/api/projects`). The API retrieves data from MongoDB and returns it as JSON. The frontend React components render the data.
2.  **Admin Login:** User visits `/admin/login`, enters credentials. Frontend sends credentials to `/api/auth/login`. Backend validates against `.env` variables. If valid, backend returns a JWT. Frontend stores the JWT in `localStorage`.
3.  **Admin CRUD:** Admin navigates to `/admin`. The `AdminDashboard` checks for the token. Admin uses forms (e.g., in `AdminProjectsManager`). On submit:
    *   Frontend retrieves the JWT from `localStorage`.
    *   Frontend sends the request (POST/PATCH/DELETE) with form data (including potentially base64 `imageData`) and the token in the `Authorization` header to the corresponding backend API endpoint (e.g., `/api/projects/:id`).
    *   Backend middleware (`adminAuth`) verifies the JWT.
    *   Backend controller processes the request, interacts with MongoDB via Mongoose models, and returns a success/error response.
    *   Frontend receives the response, updates its state (calling `onUpdate` to refetch data), and provides user feedback.

```graph
FILE: backend/src/app.ts
  IMPORTS:
    - express -> [express, Request, Response, NextFunction]
    - cors
    - dotenv -> [config]
    - ./config/database -> [connectDB]
    - ./routes/projectRoutes -> [projectRoutes]
    - ./routes/skillRoutes -> [skillRoutes]
    - ./routes/aboutRoutes -> [aboutRoutes]
    - ./routes/authRoutes -> [authRoutes]
    - ./routes/experienceRoutes -> [experienceRoutes]
    - ./utils/errorHandler -> [AppError]
  VARIABLES:
    - app: from express()
    - port: from process.env.PORT
    - server
  FUNCTIONS:
    - <anonymous> (middleware): calls [console.log, next]
    - <anonymous> (404 handler): calls [next, new AppError]
    - <anonymous> (global error handler): calls [res.status, res.json]
    - gracefulShutdown: calls [console.log, server.close, process.exit]
  CALLS:
    - config()
    - express()
    - app.use(express.json())
    - app.use(cors())
    - app.use(<anonymous_middleware>)
    - app.use('/api/auth', authRoutes)
    - app.use('/api/projects', projectRoutes)
    - app.use('/api/skills', skillRoutes)
    - app.use('/api/about', aboutRoutes)
    - app.use('/api/experiences', experienceRoutes)
    - app.all('*', <anonymous_404_handler>)
    - app.use(<anonymous_error_handler>)
    - connectDB().then(...)
    - app.listen(port, <callback>)
    - console.log(...)
    - console.error(...)
    - process.exit(...)
    - process.on('SIGTERM', gracefulShutdown)
    - process.on('SIGINT', gracefulShutdown)
  INSTANTIATES:
    - AppError

FILE: backend/src/config/database.ts
  IMPORTS:
    - mongoose
  FUNCTIONS:
    - connectDB (async): calls [process.env.MONGODB_URI, mongoose.connect, console.log, console.error, process.exit]

FILE: backend/src/controllers/aboutController.ts
  IMPORTS:
    - express -> [Request, Response, NextFunction]
    - express-validator -> [validationResult]
    - ../models/AboutMe -> [AboutMe, IAboutMe]
    - ../utils/errorHandler -> [AppError, catchAsync]
  FUNCTIONS:
    - getAboutMe (async, wrapped by catchAsync): calls [AboutMe.findOne, next, new AppError, res.status, res.json]
    - updateAboutMe (async, wrapped by catchAsync): calls [validationResult, errors.isEmpty, next, new AppError, AboutMe.findOneAndUpdate, res.status, res.json]
  INSTANTIATES:
    - AppError
  USES_MONGOOSE_MODELS:
    - AboutMe: [findOne, findOneAndUpdate]

FILE: backend/src/controllers/authController.ts
  IMPORTS:
    - express -> [Request, Response, NextFunction]
    - jsonwebtoken -> [jwt]
    - ../utils/errorHandler -> [AppError, catchAsync]
  FUNCTIONS:
    - login (async, wrapped by catchAsync): calls [console.log, process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, jwt.sign, process.env.JWT_SECRET, res.status, res.json, next, new AppError]
  INSTANTIATES:
    - AppError

FILE: backend/src/controllers/experienceController.ts
  IMPORTS:
    - express -> [Request, Response]
    - ../models/Experience -> [Experience]
    - ../middleware/authMiddleware -> [adminAuth, AuthRequest]
  FUNCTIONS:
    - getExperiences (async): calls [Experience.find, sort, res.status, res.json, console.error]
    - getExperience (async): calls [Experience.findById, res.status, res.json, console.error]
    - createExperience (async): calls [res.status, res.json, new Experience, experience.save, console.error]
    - updateExperience (async): calls [res.status, res.json, Experience.findByIdAndUpdate, console.error]
    - deleteExperience (async): calls [res.status, res.json, Experience.findByIdAndDelete, console.error]
  INSTANTIATES:
    - Experience (Mongoose Model)
  USES_MONGOOSE_MODELS:
    - Experience: [find, findById, save, findByIdAndUpdate, findByIdAndDelete]

FILE: backend/src/controllers/projectController.ts
  IMPORTS:
    - express -> [Request, Response, NextFunction]
    - express-validator -> [validationResult]
    - ../models/Project -> [Project, IProject]
    - ../utils/errorHandler -> [AppError, catchAsync]
  FUNCTIONS:
    - getAllProjects (async, wrapped by catchAsync): calls [Project.find, sort, res.status, res.json]
    - getProject (async, wrapped by catchAsync): calls [Project.findById, next, new AppError, res.status, res.json]
    - createProject (async, wrapped by catchAsync): calls [validationResult, errors.isEmpty, next, new AppError, Project.create, res.status, res.json]
    - updateProject (async, wrapped by catchAsync): calls [validationResult, errors.isEmpty, next, new AppError, Project.findByIdAndUpdate, res.status, res.json]
    - deleteProject (async, wrapped by catchAsync): calls [Project.findByIdAndDelete, next, new AppError, res.status, res.json]
  INSTANTIATES:
    - AppError
  USES_MONGOOSE_MODELS:
    - Project: [find, findById, create, findByIdAndUpdate, findByIdAndDelete]

FILE: backend/src/controllers/skillController.ts
  IMPORTS:
    - express -> [Request, Response, NextFunction]
    - express-validator -> [validationResult]
    - ../models/Skill -> [Skill, ISkill]
    - ../utils/errorHandler -> [AppError, catchAsync]
  FUNCTIONS:
    - getAllSkills (async, wrapped by catchAsync): calls [Skill.find, res.status, res.json]
    - getSkill (async, wrapped by catchAsync): calls [Skill.findById, next, new AppError, res.status, res.json]
    - createSkill (async, wrapped by catchAsync): calls [validationResult, errors.isEmpty, next, new AppError, Skill.create, res.status, res.json]
    - updateSkill (async, wrapped by catchAsync): calls [validationResult, errors.isEmpty, next, new AppError, Skill.findByIdAndUpdate, res.status, res.json]
    - deleteSkill (async, wrapped by catchAsync): calls [Skill.findByIdAndDelete, next, new AppError, res.status, res.send]
  INSTANTIATES:
    - AppError
  USES_MONGOOSE_MODELS:
    - Skill: [find, findById, create, findByIdAndUpdate, findByIdAndDelete]

FILE: backend/src/middleware/authMiddleware.ts
  IMPORTS:
    - express -> [Request, Response, NextFunction]
    - ../utils/errorHandler -> [AppError]
    - jsonwebtoken -> [jwt]
  INTERFACES:
    - AuthRequest
  FUNCTIONS:
    - adminAuth: calls [req.headers.authorization, split, new AppError, jwt.verify, process.env.JWT_SECRET, next]
  INSTANTIATES:
    - AppError

FILE: backend/src/models/About.ts
  IMPORTS:
    - mongoose -> [Schema, model, Document]
  INTERFACES:
    - IAbout
  VARIABLES:
    - AboutSchema: from new Schema()
  MONGOOSE_MODELS:
    - About: from model('About', AboutSchema)

FILE: backend/src/models/AboutMe.ts
  IMPORTS:
    - mongoose -> [Schema, model, Document]
  INTERFACES:
    - IAboutMe
  VARIABLES:
    - AboutMeSchema: from new Schema()
  MONGOOSE_MODELS:
    - AboutMe: from model('AboutMe', AboutMeSchema)

FILE: backend/src/models/Experience.ts
  IMPORTS:
    - mongoose -> [mongoose, Document, Schema]
  INTERFACES:
    - IExperience
  VARIABLES:
    - experienceSchema: from new Schema()
  MONGOOSE_MODELS:
    - Experience: from mongoose.model('Experience', experienceSchema)

FILE: backend/src/models/Project.ts
  IMPORTS:
    - mongoose -> [Schema, model, Document]
  INTERFACES:
    - IProject
  VARIABLES:
    - ProjectSchema: from new Schema()
  SCHEMA_HOOKS:
    - ProjectSchema.pre('save', <anonymous_hook>): calls [next, new Error]
  MONGOOSE_MODELS:
    - Project: from model('Project', ProjectSchema)

FILE: backend/src/models/Skill.ts
  IMPORTS:
    - mongoose -> [Schema, model, Document]
  INTERFACES:
    - ISkill
  VARIABLES:
    - SkillSchema: from new Schema()
  MONGOOSE_MODELS:
    - Skill: from model('Skill', SkillSchema)

FILE: backend/src/routes/aboutRoutes.ts
  IMPORTS:
    - express -> [Router]
    - express-validator -> [body]
    - ../controllers/aboutController -> [getAboutMe, updateAboutMe]
    - ../middleware/authMiddleware -> [adminAuth]
  VARIABLES:
    - router: from Router()
    - aboutValidation: array of validation middleware
  CALLS:
    - Router()
    - body(...).trim().notEmpty().withMessage(...)
    - body(...).optional().isURL().withMessage(...)
    - router.route('/').get(getAboutMe)
    - router.route('/').put(adminAuth, aboutValidation, updateAboutMe)

FILE: backend/src/routes/authRoutes.ts
  IMPORTS:
    - express
    - ../controllers/authController -> [login]
  VARIABLES:
    - router: from express.Router()
  CALLS:
    - express.Router()
    - router.post('/login', login)

FILE: backend/src/routes/experienceRoutes.ts
  IMPORTS:
    - express
    - ../controllers/experienceController -> [getExperiences, getExperience, createExperience, updateExperience, deleteExperience]
    - ../middleware/authMiddleware -> [adminAuth]
  VARIABLES:
    - router: from express.Router()
  CALLS:
    - express.Router()
    - router.get('/', getExperiences)
    - router.get('/:id', getExperience)
    - router.post('/', adminAuth, createExperience)
    - router.put('/:id', adminAuth, updateExperience)
    - router.delete('/:id', adminAuth, deleteExperience)

FILE: backend/src/routes/projectRoutes.ts
  IMPORTS:
    - express -> [Router]
    - express-validator -> [body]
    - ../controllers/projectController -> [getAllProjects, getProject, createProject, updateProject, deleteProject]
    - ../middleware/authMiddleware -> [adminAuth]
  VARIABLES:
    - router: from Router()
    - projectValidation: array of validation middleware
    - updateProjectValidation: array of validation middleware
  CALLS:
    - Router()
    - body(...).trim().notEmpty().withMessage(...)
    - body(...).isArray().withMessage(...)
    - body().custom(<anonymous_validator>)
    - router.route('/').get(getAllProjects)
    - router.route('/').post(adminAuth, projectValidation, createProject)
    - router.route('/:id').get(getProject)
    - router.route('/:id').patch(adminAuth, updateProjectValidation, updateProject)
    - router.route('/:id').delete(adminAuth, deleteProject)
  INSTANTIATES:
    - Error (in custom validator)

FILE: backend/src/routes/skillRoutes.ts
  IMPORTS:
    - express -> [Router]
    - express-validator -> [body]
    - ../controllers/skillController -> [getAllSkills, getSkill, createSkill, updateSkill, deleteSkill]
    - ../middleware/authMiddleware -> [adminAuth]
  VARIABLES:
    - router: from Router()
    - skillValidation: array of validation middleware
  CALLS:
    - Router()
    - body(...).trim().notEmpty().withMessage(...)
    - body(...).isIn(...).withMessage(...)
    - body(...).isInt(...).withMessage(...)
    - router.route('/').get(getAllSkills)
    - router.route('/').post(adminAuth, skillValidation, createSkill)
    - router.route('/:id').get(getSkill)
    - router.route('/:id').patch(adminAuth, skillValidation, updateSkill)
    - router.route('/:id').delete(adminAuth, deleteSkill)

FILE: backend/src/scripts/initDb.ts
  IMPORTS:
    - mongoose
    - ../models/AboutMe -> [AboutMe]
    - dotenv
  FUNCTIONS:
    - initializeDb (async): calls [mongoose.connect, process.env.MONGODB_URI, console.log, AboutMe.findOne, AboutMe.create, console.error, mongoose.disconnect]
  CALLS:
    - dotenv.config()
    - initializeDb()
  USES_MONGOOSE_MODELS:
    - AboutMe: [findOne, create]

FILE: backend/src/scripts/initializeDb.ts
  IMPORTS:
    - ../config/database -> [connectDB]
    - ../models/Project -> [Project]
    - ../models/AboutMe -> [AboutMe]
    - ../models/Experience -> [Experience]
    - dotenv -> [config]
  FUNCTIONS:
    - initializeDb (async): calls [connectDB, console.log, Project.countDocuments, Project.create, Experience.countDocuments, Experience.insertMany, AboutMe.countDocuments, AboutMe.create, process.exit, console.error]
  CALLS:
    - config()
    - initializeDb()
  USES_MONGOOSE_MODELS:
    - Project: [countDocuments, create]
    - Experience: [countDocuments, insertMany]
    - AboutMe: [countDocuments, create]

FILE: backend/src/scripts/resetAboutCollection.ts
  IMPORTS:
    - ../config/database -> [connectDB]
    - ../models/AboutMe -> [AboutMe]
    - dotenv -> [config]
  FUNCTIONS:
    - resetAboutCollection (async): calls [connectDB, console.log, AboutMe.collection.drop, AboutMe.create, console.error, process.exit]
  CALLS:
    - config()
    - resetAboutCollection()
  USES_MONGOOSE_MODELS:
    - AboutMe: [collection.drop, create]

FILE: backend/src/scripts/setupEnv.ts
  IMPORTS:
    - fs
    - path
    - dotenv
  VARIABLES:
    - envPath: from path.join
    - envContent: string literal
  CALLS:
    - dotenv.config()
    - path.join(__dirname, '../../.env')
    - fs.writeFileSync(envPath, envContent)
    - console.log(...)
    - console.error(...)
    - process.env.PORT
    - process.env.ADMIN_USERNAME
    - process.env.MONGODB_URI

FILE: backend/src/utils/errorHandler.ts
  CLASSES:
    - AppError: extends Error, constructor calls [super, Error.captureStackTrace]
  FUNCTIONS:
    - catchAsync: returns [<anonymous_wrapper_function>] calls [fn, catch]

FILE: src/app/about/page.tsx
  IMPORTS:
    - react -> [useState, useEffect, useRef]
    - @/lib/auth -> [isAdmin, getAuthToken]
    - @/services/api -> [api]
    - @/types -> [AboutMe]
    - @/utils/imageUtils -> [fileToBase64, validateImage, resizeImage]
    - react-markdown -> [ReactMarkdown]
  COMPONENTS:
    - AboutPage (React Function Component): uses hooks [useState, useEffect, useRef], calls [setIsAdminUser, isAdmin, setLoading, api.getAbout, setAbout, setImagePreview, console.error, setEditedAbout, setIsEditing, handleCancel, handleImageSelect, handleSubmit, fileToBase64, resizeImage, api.updateAbout, alert], renders [ReactMarkdown]
  FUNCTIONS:
    - fetchAbout (async): calls [setLoading, api.getAbout, setAbout, setImagePreview, console.error]
    - handleEdit: calls [setIsEditing]
    - handleCancel: calls [setIsEditing, setEditedAbout, setSelectedImage, setImagePreview, fileInputRef.current.value]
    - handleImageSelect (async): calls [validateImage, alert, setSelectedImage, fileToBase64, resizeImage, setImagePreview]
    - handleSubmit (async): calls [e.preventDefault, setIsSubmitting, getAuthToken, alert, fileToBase64, resizeImage, api.updateAbout, setAbout, setIsEditing, setSelectedImage, fileInputRef.current.value, console.error]

FILE: src/app/admin/login/page.tsx
  IMPORTS:
    - react -> [useState]
    - next/navigation -> [useRouter]
    - @/lib/auth -> [login]
  COMPONENTS:
    - AdminLogin (React Function Component): uses hooks [useState, useRouter], calls [setUsername, setPassword, setError, handleSubmit, login, router.push, router.refresh]
  FUNCTIONS:
    - handleSubmit (async): calls [e.preventDefault, login, router.push, router.refresh, setError]

FILE: src/app/admin/page.tsx
  IMPORTS:
    - react -> [Suspense]
    - @/components/AdminDashboard -> [AdminDashboard]
  COMPONENTS:
    - AdminLoading (React Function Component)
    - AdminPage (React Function Component): renders [Suspense, AdminDashboard, AdminLoading]

FILE: src/app/experiences/page.tsx
  IMPORTS:
    - react -> [useState, useEffect, useCallback]
    - @/components/ExperienceSection -> [ExperienceSection]
    - @/services/api -> [api]
    - @/types -> [Experience]
  COMPONENTS:
    - ExperiencesPage (React Function Component): uses hooks [useState, useEffect, useCallback], calls [setExperiences, setLoading, fetchExperiences, handleExperienceUpdate], renders [ExperienceSection]
  FUNCTIONS:
    - fetchExperiences (async, within useEffect): calls [api.getExperiences, setExperiences, console.error, setLoading]
    - handleExperienceUpdate (useCallback): calls [console.log, setExperiences]

FILE: src/app/layout.tsx
  IMPORTS:
    - next/metadata -> [Metadata]
    - next/font/google -> [Geist, Geist_Mono]
    - @/components/Navigation -> [Navigation]
    - ./globals.css
    - react -> [Suspense]
  VARIABLES:
    - geistSans
    - geistMono
    - metadata: Metadata object
  COMPONENTS:
    - NavigationFallback (React Function Component)
    - RootLayout (React Function Component): renders [html, body, Suspense, Navigation, NavigationFallback, main]

FILE: src/app/page.tsx
  IMPORTS:
    - @/components/AboutSection -> [AboutSection]
    - @/components/ProjectCard -> [ProjectCard]
    - @/components/SkillsGrid -> [SkillsGrid]
    - @/components/ExperienceSection -> [ExperienceSection]
    - @/services/api -> [api]
  COMPONENTS:
    - Home (React Server Component, async): calls [Promise.all, api.getProjects, api.getSkills, api.getAbout, api.getExperiences], renders [AboutSection, ProjectCard, ExperienceSection, SkillsGrid]

FILE: src/app/projects/page.tsx
  IMPORTS:
    - react -> [useState, useEffect, useRef]
    - @/lib/auth -> [isAdmin, getAuthToken]
    - @/services/api -> [api]
    - @/types -> [Project]
    - next/image -> [Image]
    - @/utils/imageUtils -> [fileToBase64, validateImage, compressImageToMaxSize]
  COMPONENTS:
    - ProjectsPage (React Function Component): uses hooks [useState, useEffect, useRef], calls [setIsAdminUser, isAdmin, setLoading, api.getProjects, setProjects, console.error, resetForm, handleCreateNew, handleEdit, setFormData, setImagePreview, handleImageSelect, validateImage, alert, setSelectedImage, fileToBase64, compressImageToMaxSize, handleTechKeyPress, removeTech, handleSubmit, getAuthToken, api.createProject, api.updateProject, handleDelete, confirm, api.deleteProject], renders [Image]
  FUNCTIONS:
    - fetchProjects (async): calls [setLoading, api.getProjects, setProjects, console.error, setLoading]
    - resetForm: calls [setFormData, setIsCreating, setEditingId, setSelectedImage, setImagePreview, setTechInput, fileInputRef.current.value]
    - handleCreateNew: calls [setIsCreating, setEditingId, resetForm]
    - handleEdit: calls [setIsCreating, setEditingId, setFormData, setImagePreview]
    - handleImageSelect (async): calls [validateImage, alert, setSelectedImage, fileToBase64, compressImageToMaxSize, setImagePreview]
    - handleTechKeyPress: calls [e.preventDefault, setFormData, setTechInput]
    - removeTech: calls [setFormData]
    - handleSubmit (async): calls [e.preventDefault, setIsSubmitting, getAuthToken, alert, selectedImage, fileToBase64, compressImageToMaxSize, api.createProject, setProjects, api.updateProject, projects.map, projects.find, resetForm, console.error]
    - handleDelete (async): calls [confirm, setIsSubmitting, getAuthToken, alert, api.deleteProject, setProjects, projects.filter, resetForm, console.error]

FILE: src/app/skills/page.tsx
  IMPORTS:
    - react -> [useState, useEffect]
    - @/lib/auth -> [isAdmin, getAuthToken]
    - @/services/api -> [api]
    - @/types -> [Skill]
  VARIABLES:
    - CATEGORY_LABELS: object literal
  COMPONENTS:
    - SkillsPage (React Function Component): uses hooks [useState, useEffect], calls [setIsAdminUser, isAdmin, setLoading, setError, fetchSkills, resetForm, handleCreateNew, handleEdit, setFormData, handleSubmit, getAuthToken, api.createSkill, api.updateSkill, handleDelete, window.confirm, api.deleteSkill, handleCancel, handleInputChange, skills.reduce], renders skill list
  FUNCTIONS:
    - fetchSkills (async): calls [setLoading, api.getSkills, setSkills, setError, console.error, setLoading]
    - resetForm: calls [setFormData, setIsCreating, setEditingId]
    - handleCreateNew: calls [setIsCreating, setEditingId, setFormData]
    - handleEdit: calls [setIsCreating, setEditingId, setFormData]
    - handleSubmit (async): calls [e.preventDefault, setIsSubmitting, getAuthToken, alert, api.createSkill, api.updateSkill, fetchSkills, resetForm, console.error]
    - handleDelete (async): calls [window.confirm, getAuthToken, alert, api.deleteSkill, fetchSkills, resetForm, console.error]
    - handleCancel: calls [resetForm]
    - handleInputChange: calls [setFormData, parseInt]

FILE: src/components/AboutSection.tsx
  IMPORTS:
    - @/types -> [AboutMe]
    - next/link -> [Link]
  COMPONENTS:
    - AboutSection (React Function Component): renders [section, h1, p, img, div, svg, span, a, Link]

FILE: src/components/AdminAboutManager.tsx
  IMPORTS:
    - react -> [useState, useRef]
    - @/lib/auth -> [getAuthToken]
    - @/types -> [AboutMe]
    - @/services/api -> [api]
    - @/utils/imageUtils -> [fileToBase64, validateImage, resizeImage]
  INTERFACES:
    - AdminAboutManagerProps
  COMPONENTS:
    - AdminAboutManager (React Function Component): uses hooks [useState, useRef], calls [setEditedAbout, setIsSubmitting, setSelectedImage, setImagePreview, handleImageSelect, validateImage, alert, fileToBase64, resizeImage, handleSubmit, getAuthToken, api.updateAbout, onUpdate, console.error], renders form elements, img
  FUNCTIONS:
    - handleImageSelect (async): calls [validateImage, alert, setSelectedImage, fileToBase64, resizeImage, setImagePreview]
    - handleSubmit (async): calls [e.preventDefault, setIsSubmitting, selectedImage, fileToBase64, resizeImage, api.updateAbout, getAuthToken, onUpdate, console.error, alert]

FILE: src/components/AdminDashboard.tsx
  IMPORTS:
    - react -> [useState, useEffect]
    - next/navigation -> [useRouter, useSearchParams]
    - @/lib/auth -> [isAdmin]
    - @/services/api -> [api]
    - @/types -> [Project, Skill, AboutMe, Experience]
    - @/components/AdminSkillsManager -> [AdminSkillsManager]
    - @/components/AdminProjectsManager -> [AdminProjectsManager]
    - @/components/AdminAboutManager -> [AdminAboutManager]
    - @/components/AdminExperienceManager -> [AdminExperienceManager]
    - next/image -> [Image]
  COMPONENTS:
    - AdminDashboard (React Function Component): uses hooks [useState, useEffect, useRouter, useSearchParams], calls [setIsPageAdmin, isAdmin, router.push, setActiveTab, searchParams.get, setLoading, fetchData, Promise.all, api.getSkills, api.getProjects, api.getAbout, api.getExperiences, console.log, setSkills, setProjects, setAbout, setExperiences, console.error, handleRefreshData, handleTabClick, router.replace], renders [AdminSkillsManager, AdminProjectsManager, AdminExperienceManager, AdminAboutManager, Image]
  FUNCTIONS:
    - fetchData (async, within useEffect): calls [setLoading, Promise.all, api.getSkills, api.getProjects, api.getAbout, api.getExperiences, console.log, setSkills, setProjects, setAbout, setExperiences, console.error, setLoading]
    - handleRefreshData (async): calls [setLoading, Promise.all, api.getProjects, api.getSkills, api.getAbout, api.getExperiences, setSkills, setProjects, setAbout, setExperiences, console.error, setLoading]
    - handleTabClick: calls [setActiveTab, router.push]

FILE: src/components/AdminExperienceManager.tsx
  IMPORTS:
    - react -> [useState]
    - @/lib/auth -> [getAuthToken]
    - @/types -> [Experience]
    - @/services/api -> [api]
  INTERFACES:
    - AdminExperienceManagerProps
  COMPONENTS:
    - AdminExperienceManager (React Function Component): uses hooks [useState], calls [setIsCreating, setEditingId, setIsSubmitting, console.log, setFormData, resetForm, handleCreateNew, handleEdit, handleSubmit, getAuthToken, alert, api.createExperience, api.updateExperience, onUpdate, handleDelete, confirm, api.deleteExperience], renders form and list
  FUNCTIONS:
    - resetForm: calls [setFormData, setIsCreating, setEditingId]
    - handleCreateNew: calls [setIsCreating, setEditingId, setFormData]
    - handleEdit: calls [setIsCreating, setEditingId, setFormData]
    - handleSubmit (async): calls [e.preventDefault, setIsSubmitting, getAuthToken, alert, api.createExperience, api.updateExperience, resetForm, onUpdate, console.error]
    - handleDelete (async): calls [confirm, setIsSubmitting, getAuthToken, alert, api.deleteExperience, onUpdate, resetForm, console.error]

FILE: src/components/AdminHeader.tsx
  IMPORTS:
    - next/navigation -> [useRouter]
    - @/lib/auth -> [isAdmin, logout]
  COMPONENTS:
    - AdminHeader (React Function Component): uses hooks [useRouter], calls [isAdmin, handleLogout, logout, router.refresh], renders admin bar conditionally

FILE: src/components/AdminProjectsManager.tsx
  IMPORTS:
    - react -> [useState, useRef]
    - @/lib/auth -> [getAuthToken]
    - @/types -> [Project]
    - @/services/api -> [api]
    - @/utils/imageUtils -> [fileToBase64, validateImage, resizeImage]
  INTERFACES:
    - AdminProjectsManagerProps
  COMPONENTS:
    - AdminProjectsManager (React Function Component): uses hooks [useState, useRef], calls [setEditingProject, setNewProject, setIsSubmitting, setTechInput, setSelectedImage, setImagePreview, handleImageSelect, validateImage, alert, fileToBase64, resizeImage, handleTechKeyPress, removeTech, handleEdit, handleDelete, confirm, api.deleteProject, onUpdate, console.error, handleSubmitEdit, api.updateProject, handleSubmitNew, api.createProject], renders forms and list
  FUNCTIONS:
    - handleImageSelect (async): calls [validateImage, alert, setSelectedImage, fileToBase64, resizeImage, setImagePreview]
    - handleTechKeyPress: calls [e.preventDefault, setNewProject, setEditingProject, setTechInput]
    - removeTech: calls [setNewProject, setEditingProject]
    - handleEdit: calls [setEditingProject, setImagePreview]
    - handleDelete (async): calls [confirm, setIsSubmitting, api.deleteProject, getAuthToken, onUpdate, console.error, alert]
    - handleSubmitEdit (async): calls [e.preventDefault, setIsSubmitting, selectedImage, fileToBase64, resizeImage, api.updateProject, getAuthToken, setEditingProject, setSelectedImage, setImagePreview, onUpdate, console.error, alert]
    - handleSubmitNew (async): calls [e.preventDefault, alert, setIsSubmitting, fileToBase64, resizeImage, api.createProject, getAuthToken, setNewProject, setSelectedImage, setImagePreview, fileInputRef.current.value, onUpdate, console.error]

FILE: src/components/AdminSkillsManager.tsx
  IMPORTS:
    - react -> [useState]
    - @/lib/auth -> [getAuthToken]
    - @/types/skill -> [Skill]
  INTERFACES:
    - AdminSkillsManagerProps
  COMPONENTS:
    - AdminSkillsManager (React Function Component): uses hooks [useState], calls [setEditingSkill, setNewSkill, setIsSubmitting, handleEdit, handleDelete, confirm, fetch, getAuthToken, onUpdate, console.error, alert, handleSubmitEdit, JSON.stringify, handleSubmitNew, parseInt], renders form and list
  FUNCTIONS:
    - handleEdit: calls [setEditingSkill]
    - handleDelete (async): calls [confirm, setIsSubmitting, fetch, getAuthToken, onUpdate, console.error, alert]
    - handleSubmitEdit (async): calls [e.preventDefault, setIsSubmitting, fetch, JSON.stringify, getAuthToken, setEditingSkill, onUpdate, console.error, alert]
    - handleSubmitNew (async): calls [e.preventDefault, setIsSubmitting, fetch, JSON.stringify, getAuthToken, console.log, setNewSkill, onUpdate, console.error, alert]

FILE: src/components/ExperienceSection.tsx
  IMPORTS:
    - react -> [useEffect, useState]
    - @/types -> [Experience]
    - @/services/api -> [api]
    - @/lib/auth -> [getAuthToken]
    - react-markdown -> [ReactMarkdown]
  INTERFACES:
    - ExperienceSectionProps
  COMPONENTS:
    - ExperienceSection (React Function Component): uses hooks [useState, useEffect], calls [setExperiences, setLoading, setIsAdmin, getAuthToken, fetchExperiences, api.getExperiences, console.error, resetForm, setFormData, setIsCreating, setEditingId, handleCreateNew, handleEdit, handleSubmit, alert, api.createExperience, api.updateExperience, notifyParentOfChanges, handleDelete, confirm, setTimeout, api.deleteExperience, console.log, setShowPreview], renders [ReactMarkdown]
  FUNCTIONS:
    - fetchExperiences (async, within useEffect): calls [api.getExperiences, setExperiences, console.error, setLoading]
    - resetForm: calls [setFormData, setIsCreating, setEditingId]
    - handleCreateNew: calls [setIsCreating, setEditingId, setFormData]
    - handleEdit: calls [setIsCreating, setEditingId, setFormData]
    - handleSubmit (async): calls [e.preventDefault, setIsSubmitting, getAuthToken, alert, api.createExperience, console.log, setExperiences, api.updateExperience, setExperiences, setTimeout, notifyParentOfChanges, resetForm, console.error]
    - handleDelete (async): calls [confirm, setIsSubmitting, getAuthToken, alert, console.log, setExperiences, api.deleteExperience, setTimeout, notifyParentOfChanges, resetForm, console.error, api.getExperiences]
    - notifyParentOfChanges: calls [onExperienceUpdate]

FILE: src/components/Navigation.tsx
  IMPORTS:
    - react -> [useState, useEffect]
    - next/link -> [Link]
    - next/navigation -> [usePathname, useSearchParams, useRouter]
    - @/lib/auth -> [isAdmin, logout]
  COMPONENTS:
    - Navigation (React Function Component): uses hooks [useState, useEffect, usePathname, useSearchParams, useRouter], calls [setIsAdminUser, isAdmin, checkAdminStatus, window.addEventListener, window.removeEventListener, handleLogout, logout, router.refresh], renders [Link]
  FUNCTIONS:
    - checkAdminStatus (within useEffect): calls [setIsAdminUser, isAdmin]
    - handleLogout: calls [logout, setIsAdminUser, router.refresh]

FILE: src/components/ProjectCard.tsx
  IMPORTS:
    - @/types -> [Project]
    - next/image -> [Image]
  INTERFACES:
    - ProjectCardProps
  COMPONENTS:
    - ProjectCard (React Function Component): renders [Image, h3, p, span, a]

FILE: src/components/SkillsGrid.tsx
  IMPORTS:
    - @/lib/auth -> [isAdmin]
    - @/types -> [Skill]
    - ./AdminSkillsManager -> [AdminSkillsManager]
  INTERFACES:
    - SkillsGridProps
  VARIABLES:
    - CATEGORY_LABELS: object literal
  COMPONENTS:
    - SkillsGrid (React Function Component): calls [isAdmin, categories.map, skills.filter], renders [div, h3, span, AdminSkillsManager]

FILE: src/data/fallback.ts
  IMPORTS:
    - ../types -> [AboutMe, Project, Skill, Experience]
  VARIABLES:
    - fallbackProjects: Project[]
    - fallbackSkills: Skill[]
    - fallbackExperiences: Experience[]
    - fallbackAboutMe: AboutMe

FILE: src/lib/auth.ts
  FUNCTIONS:
    - login (async): calls [fetch, process.env.NEXT_PUBLIC_API_URL, JSON.stringify, response.json, window.localStorage.setItem, window.dispatchEvent, new Event]
    - logout: calls [window.localStorage.removeItem, window.dispatchEvent, new Event]
    - getAuthToken: calls [window.localStorage.getItem]
    - isAdmin: calls [getAuthToken]

FILE: src/services/api.ts
  IMPORTS:
    - ../types -> [AboutMe, Project, Skill, Experience]
    - ../data/fallback -> [fallbackAboutMe, fallbackProjects, fallbackSkills, fallbackExperiences]
  VARIABLES:
    - API_BASE_URL: from process.env.NEXT_PUBLIC_API_URL
  FUNCTIONS:
    - fetchWithFallback (async): calls [new AbortController, setTimeout, fetch, clearTimeout, console.error, console.warn, response.json]
    - getProject (async): calls [fetch, response.json]
    - createProject (async): calls [fetch, JSON.stringify, response.json, new Error]
    - updateProject (async): calls [fetch, JSON.stringify, response.json, new Error]
    - deleteProject (async): calls [fetch, response.json, new Error]
    - getSkill (async): calls [fetch, response.json]
    - createSkill (async): calls [fetch, JSON.stringify, response.json, new Error]
    - updateSkill (async): calls [fetch, JSON.stringify, response.json, new Error]
    - deleteSkill (async): calls [fetch, response.json, new Error]
    - getAbout (async): calls [fetchWithFallback]
    - updateAbout (async): calls [fetch, JSON.stringify, response.json, new Error]
    - getExperiences (async): calls [fetchWithFallback]
    - getExperience (async): calls [fetchWithFallback]
    - createExperience (async): calls [fetch, JSON.stringify, response.json, new Error]
    - updateExperience (async): calls [fetch, JSON.stringify, response.json, new Error]
    - deleteExperience (async): calls [console.log, new URL, fetch, response.json, new Error]
  VARIABLES:
    - api: object literal containing API functions
  INSTANTIATES:
    - AbortController
    - Error
    - URL

FILE: src/types/index.ts
  INTERFACES:
    - Project
    - Skill
    - AboutMe
    - Experience

FILE: src/types/skill.ts
  INTERFACES:
    - Skill

FILE: src/utils/imageUtils.ts
  FUNCTIONS:
    - fileToBase64: returns [new Promise], calls [new FileReader, reader.readAsDataURL]
    - validateImage: returns validation object
    - resizeImage: returns [new Promise], calls [new Image, Math.round, document.createElement, canvas.getContext, ctx.drawImage, canvas.toDataURL, new Error]
    - compressImageToMaxSize (async): calls [resizeImage, getBase64SizeKB, console.log]
    - getBase64SizeKB (within compressImageToMaxSize): calls [split, length]
  INSTANTIATES:
    - Promise
    - FileReader
    - Image
    - Error
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
src/components/AdminDashboard.tsx
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

// Middleware
app.use(express.json());
app.use(cors());

// ---> ADD THIS MIDDLEWARE <---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Received Request: ${req.method} ${req.originalUrl}`);
  next();
});
// ---> END ADD <---

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/experiences', experienceRoutes);

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
  
   // --- DEBUGGING ---
   console.log('Login Attempt:', { username, password });
   console.log('Env Vars:', {
       ADMIN_USERNAME: process.env.ADMIN_USERNAME,
       ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
   });
   // --- END DEBUGGING ---
   
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
// Keep this simple. No 'use client' needed here if we delegate client logic.
import { Suspense } from 'react';
import AdminDashboard from '@/components/AdminDashboard';
//import { isAdmin } from '@/lib/auth'; // Import isAdmin if needed for initial check (optional)
// If doing server-side redirect, use next/navigation
// import { redirect } from 'next/navigation';

// Simple loading component for Suspense
function AdminLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Loading Admin...</h2>
                 <div className="mt-4 inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        </div>
    );
}


export default function AdminPage() {
  // Optional: Perform check server-side if possible, though isAdmin() relies on localStorage
  // const isUserAdmin = isAdmin(); // This won't work reliably on the server
  // if (!isUserAdmin) {
  //    redirect('/'); // Redirect server-side if check was possible
  // }
  // The check inside AdminDashboard will handle client-side redirect


  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminDashboard />
    </Suspense>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { isAdmin } from '@/lib/auth';
// import { api } from '@/services/api';
// import { Project, Skill, AboutMe, Experience } from '@/types';
// import AdminSkillsManager from '@/components/AdminSkillsManager';
// import AdminProjectsManager from '@/components/AdminProjectsManager';
// import AdminAboutManager from '@/components/AdminAboutManager';
// import AdminExperienceManager from '@/components/AdminExperienceManager';

// export default function AdminPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const tabParam = searchParams.get('tab');
//   const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'about' | 'experiences'>('skills');
//   const [skills, setSkills] = useState<Skill[]>([]);
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [about, setAbout] = useState<AboutMe | null>(null);
//   const [experiences, setExperiences] = useState<Experience[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!isAdmin()) {
//       router.push('/');
//       return;
//     }

//     // Set active tab based on URL parameter
//     if (tabParam === 'projects' || tabParam === 'about' || tabParam === 'skills' || tabParam === 'experiences') {
//       setActiveTab(tabParam);
//     }

//     const fetchData = async () => {
//       try {
//         const [skillsData, projectsData, aboutData, experiencesData] = await Promise.all([
//           api.getSkills(),
//           api.getProjects(),
//           api.getAbout(),
//           api.getExperiences()
//         ]);

//         console.log('Fetched experiences:', experiencesData);
//         console.log('Current active tab:', activeTab);

//         setSkills(skillsData);
//         setProjects(projectsData);
//         setAbout(aboutData);
//         setExperiences(experiencesData);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [router, tabParam, activeTab]);

//   const handleRefreshData = async () => {
//     try {
//       setLoading(true);
//       const [projectsData, skillsData, aboutData, experiencesData] = await Promise.all([
//         api.getProjects(),
//         api.getSkills(),
//         api.getAbout(),
//         api.getExperiences()
//       ]);

//       setSkills(skillsData);
//       setProjects(projectsData);
//       setAbout(aboutData);
//       setExperiences(experiencesData);
//     } catch (error) {
//       console.error('Error refreshing data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isAdmin()) {
//     return null;
//   }

//   if (loading || !about) {
//     return (
//       <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center">
//             <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Loading...</h2>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
//           <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your portfolio content</p>
//         </div>

//         {/* Tab Navigation */}
//         <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
//           <nav className="-mb-px flex space-x-8" aria-label="Tabs">
//             {(['skills', 'projects', 'experiences', 'about'] as const).map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`
//                   ${activeTab === tab
//                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                     : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
//                   }
//                   whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
//                 `}
//               >
//                 {tab}
//               </button>
//             ))}
//           </nav>
//         </div>

//         {/* About Information Summary (shown only when About tab is active) */}
//         {activeTab === 'about' && (
//           <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
//             <div className="text-center">
//               <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{about.name}</h3>
//               <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{about.title}</p>
              
//               {/* Display profile image */}
//               {(about.imageData || about.imageUrl) && (
//                 <div className="flex justify-center mb-6">
//                   <img 
//                     src={about.imageData || about.imageUrl} 
//                     alt={about.name} 
//                     className="w-48 h-auto rounded-lg shadow-md" 
//                   />
//                 </div>
//               )}
              
//               <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
//                 {about.bio.length > 150 ? `${about.bio.substring(0, 150)}...` : about.bio}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Tab Content */}
//         <div className="mt-8">
//           {activeTab === 'skills' && (
//             <AdminSkillsManager skills={skills} onUpdate={handleRefreshData} />
//           )}
//           {activeTab === 'projects' && (
//             <AdminProjectsManager projects={projects} onUpdate={handleRefreshData} />
//           )}
//           {activeTab === 'experiences' && (
//             <>
//               <div className="bg-yellow-100 dark:bg-yellow-900 p-4 mb-4 rounded-md">
//                 <p className="text-yellow-800 dark:text-yellow-200">
//                   Debug info: Active tab is &apos;experiences&apos;. Experience data length: {experiences.length}
//                 </p>
//               </div>
//               <AdminExperienceManager experiences={experiences} onUpdate={handleRefreshData} />
//             </>
//           )}
//           {activeTab === 'about' && (
//             <AdminAboutManager about={about} onUpdate={handleRefreshData} />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
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
import { Suspense } from 'react'; // Import Suspense

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

// Optional: Create a simple loading fallback for the navigation
function NavigationFallback() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Placeholder for nav items */}
          <div className="flex space-x-4 items-center">
             <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
             <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
             <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </nav>
  );
}

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
        {/* Wrap Navigation in Suspense */}
        <Suspense fallback={<NavigationFallback />}>
          <Navigation />
        </Suspense>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import Navigation from "@/components/Navigation";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Portfolio",
//   description: "Personal portfolio showcasing my projects and skills",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 dark:bg-gray-900`}
//       >
//         <Navigation />
//         <main className="container mx-auto px-4 py-8">
//           {children}
//         </main>
//       </body>
//     </html>
//   );
// }
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

<file path="src/components/AdminDashboard.tsx">
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
import Image from 'next/image'; // Import Image

// Define props if needed, though we fetch data internally here
// interface AdminDashboardProps { }

export default function AdminDashboard(/* props: AdminDashboardProps */) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'about' | 'experiences'>('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [about, setAbout] = useState<AboutMe | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPageAdmin, setIsPageAdmin] = useState(false); // Track admin status locally

  useEffect(() => {
    const adminStatus = isAdmin();
    setIsPageAdmin(adminStatus);
    if (!adminStatus) {
      router.push('/');
      return; // Early exit if not admin
    }

    // Set active tab based on URL parameter
    const validTabs = ['skills', 'projects', 'about', 'experiences'];
    if (tabParam && validTabs.includes(tabParam)) {
       setActiveTab(tabParam as typeof activeTab);
    } else {
       // Default to 'skills' if tabParam is invalid or missing
       setActiveTab('skills');
       // Optionally update URL if needed, though maybe not necessary
       // router.replace('/admin?tab=skills');
    }

    const fetchData = async () => {
      setLoading(true); // Set loading true when fetching starts
      try {
        const [skillsData, projectsData, aboutData, experiencesData] = await Promise.all([
          api.getSkills(),
          api.getProjects(),
          api.getAbout(),
          api.getExperiences()
        ]);

        console.log('Fetched experiences:', experiencesData);

        setSkills(skillsData);
        setProjects(projectsData);
        setAbout(aboutData);
        setExperiences(experiencesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error state if necessary
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, tabParam]); // Re-run if tabParam changes

  // Separate useEffect for tabParam change to only update the active tab state
  // This prevents redundant data fetching unless explicitly desired on tab change
  useEffect(() => {
      const validTabs = ['skills', 'projects', 'about', 'experiences'];
      if (tabParam && validTabs.includes(tabParam)) {
          setActiveTab(tabParam as typeof activeTab);
      } else if (isPageAdmin) { // Only default if user is admin and tab is invalid
          setActiveTab('skills');
      }
  }, [tabParam, isPageAdmin]);


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

  // Important: Check admin status *before* rendering sensitive content
  if (!isPageAdmin) {
     // Render nothing or a redirecting message while router pushes
     return <div className="min-h-screen flex items-center justify-center"><p>Redirecting...</p></div>;
  }

  if (loading || !about) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Loading Admin Dashboard...</h2>
            {/* Optional: Add a spinner */}
            <div className="mt-4 inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Function to handle tab clicks and update URL
  const handleTabClick = (tab: typeof activeTab) => {
      setActiveTab(tab);
      router.push(`/admin?tab=${tab}`, { scroll: false }); // Update URL without full page reload
  };


  return (
    // This is the JSX previously in AdminPage
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
                onClick={() => handleTabClick(tab)} // Use handler to update URL
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

         {/* About Information Summary (conditionally rendered) */}
        {activeTab === 'about' && about && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{about.name}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{about.title}</p>

              {/* {(about.imageData || about.imageUrl) && (
                <div className="flex justify-center mb-6">
                  <Image // Use next/image
                      src={imageSource}
                      alt={about.name}
                      width={192} // w-48
                      height={192} // Estimate height
                      className="rounded-lg shadow-md object-contain"
                    />
                </div>
              )} */}
                {/* --- START CHANGE --- */}
              {(() => {
                // Calculate the source inside this scope
                const imageSource = about.imageData || about.imageUrl;
                // Explicitly check if imageSource is a valid string
                if (imageSource) {
                  return (
                    <div className="flex justify-center mb-6">
                      <Image
                        src={imageSource} // TS knows imageSource is a string here
                        alt={about.name}
                        width={192} // w-48
                        height={192} // Estimate height
                        className="rounded-lg shadow-md object-contain"
                      />
                    </div>
                  );
                }
                // Return null or an empty fragment if no image source
                return null;
              })()}
              {/* --- END CHANGE --- */}
              <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto text-left prose dark:prose-invert">
                {/* Using ReactMarkdown if bio contains markdown */}
                {about.bio}
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
              {/* Removed debug info */}
              <AdminExperienceManager experiences={experiences} onUpdate={handleRefreshData} />
            </>
          )}
          {activeTab === 'about' && about && ( // Ensure 'about' is not null
            <AdminAboutManager about={about} onUpdate={handleRefreshData} />
          )}
        </div>
      </div>
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
