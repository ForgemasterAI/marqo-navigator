# 🧭 Marqo Navigator 

<div align="center" style="margin: 30px;">
    <a href="https://refine.dev">
    <img alt="Marqo Navigator logo" src="./public/marqo-navigator.jpeg">
    </a>
</div>
<br/>

## 📚 Overview

MMarqo Navigator is a frontend development tool designed to streamline the interaction between React applications and backend services. Utilizing Vite as its core build tool, this project allows for a fast and efficient development experience, with built-in features such as API proxying and CORS handling. The primary purpose of the Marqo Navigator is to facilitate seamless development workflows while integrating complex API interactions.

This [Refine](https://github.com/refinedev/refine) project was generated with [create refine-app](https://github.com/refinedev/refine/tree/master/packages/create-refine-app).

## How it looks

<div align="center" style="margin: 30px;">
    <a href="https://refine.dev">
    <img alt="Marqo Navigator logo" src="./public/example.gif">
    </a>
</div>
<br/>


## Getting Started 🚀

A React Framework for building internal tools, admin panels, dashboards & B2B apps with unmatched flexibility ✨

Refine's hooks and components simplify the development process and eliminate the repetitive tasks by providing industry-standard solutions for crucial aspects of a project, including authentication, access control, routing, networking, state management, and i18n.

## Structure:
The directory and file structure for the Marqo Navigator project is organized as follows:

```
marqo-navigator/
│
├── README.MD                 # Project documentation
├── index.html                # HTML entry point for the application
├── package.json              # Node.js package configuration
├── vite.config.ts            # Vite configuration file (for build setup)
│
└── src/                      # Source code directory
    ├── App.tsx               # Main React application component
    ├── components/           # Reusable UI components
    │   ├── dashboard/        # Dashboard components (e.g., device-bar, search-table)
    │   └── header/           # Header components for navigation
    │  
    ├── contexts/             # Context providers for global state management
    │   └── color-mode/       # Color mode context (light/dark theme)
    │
    ├── pages/                # Routed pages of the application 
    │   ├── dashboard.tsx      # Dashboard page component
    │   ├── indexes/           # Index management pages (create, edit, list, show)
    │   └── ...
    │  
    └── marqo/                # Marqo specific functionalities
        └── dataloader.ts     # Data loading logic for interacting with Marqo engine
```


## Available Scripts 🛠️

### Running the development server.

```bash
    pnpm dev
```

### Building for production.

```bash
    pnpm build
```

### Running the production server.

```bash
    pnpm start
```

## Learn More 📚

To learn more about **Refine**, please check out the [Documentation](https://refine.dev/docs)

- **REST Data Provider** [Docs](https://refine.dev/docs/core/providers/data-provider/#overview)
- **Material UI** [Docs](https://refine.dev/docs/ui-frameworks/mui/tutorial/)
- **React Router** [Docs](https://refine.dev/docs/core/providers/router-provider/)

## License 📝

MIT
