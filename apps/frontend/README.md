<h1 align="center"> <br> <img src="public/novelya-icon.jpg" width="120"> <br>Novelya Frontend<br> </h1>
<h4 align="center">Angular application for browsing and purchasing Light Novels.</h4>
<br>
<p align="center">
Novelya is a personal learning project developed to explore the ecosystem of modern frameworks and fullstack development. The primary goal was to build a complete application using Angular for the frontend, connected to a dedicated REST API, in order to master framework concepts like component-based architecture, reactive state management, and API integration.
</p>
<br>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#installation--setup">Installation & Setup</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#file-structure">File Structure</a> •
  <a href="#license">License</a>
</p>

## Key Features

- 📖 **Modern Catalog**: Showcase of light novels with genre filtering and real-time search.
- 🛒 **Store Interface**: Interactive cart system and checkout flow (simulation).
- 👤 **User Profiles**: JWT-based authentication with personal wishlist and profile management.
- 🎨 **Premium UI**: Crafted with **Spartan UI** (Shadcn for Angular) and **Tailwind CSS** for a sleek, modern look.
- ⚡ **Optimized Performance**: Reactive state management and SPA for a smooth UX.
- 🛡️ **Secure Access**: Robust route guards and HTTP interceptors for authenticated sessions.

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (installed with Node.js)
- [Angular CLI](https://angular.dev/tools/cli)

### Steps

1. **Clone the repository**

    ```bash
    git clone https://github.com/UnOrdinary95/Novelya-front.git
    cd Novelya-front
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Environment Configuration**
   Update `src/environments/environment.ts` with your backend API URL.

4. **Run the development server**
    ```bash
    npm run start
    ```
    The app will be available at `http://localhost:4200`.

## Architecture

Novelya follows a **modular Angular architecture**, promoting separation of concerns and maintainability:

- **Core**: Centralizes singleton services, global models, authentication logic, and HTTP interceptors. It is the backbone of the application.
- **Features**: Business-specific views (Home, Shop, Cart, Profile) are encapsulated to keep the codebase organized and scalable.
- **Shared**: Contains reusable UI components and library wrappers (Spartan UI, Lucide) used across all features.

## File Structure

```text
src/app/
├── core/           # Auth, guards, interceptors, global services & models
├── features/       # Main business pages (Home, Shop, Cart, Profile)
└── shared/         # Reusable UI components & library wrappers
```

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.
