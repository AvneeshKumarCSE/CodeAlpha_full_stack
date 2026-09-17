# CodeAlpha E-Commerce Store — Project Rules

## 1. Strict Local Environment Isolation
* **Zero Global Pollution**: NEVER install npm packages or tools globally (no `npm install -g`, no global Python pip packages).
* **Local Scope Only**: All dependencies must be strictly installed in the local `./node_modules` via local `package.json`.
* **Self-Contained Storage**: The SQLite database (`store.db`) and uploaded media must live within this project folder (`server/data/` or `server/database/`).
* **Environment Files**: Keep configuration in local `.env` and provide a `.env.example`.

## 2. Token & Context Optimization
* **Concise Responses**: Provide direct, minimal, and actionable explanations without unnecessary fluff.
* **Targeted Code Modifications**: Use precise block replacements instead of rewriting entire files when possible.
* **Output Limiting**: Avoid verbose CLI outputs; pipe or filter command outputs to keep context clean.
* **Context Budgeting**: Keep conversation context lean to ensure fast and cost-effective model iterations.

## 3. UI/UX Standards
* Clean, modern, responsive design using semantic HTML5 and modern CSS (Flexbox & Grid).
* Clear feedback for user actions: loading spinners, toast notifications, empty states, and error alerts.
* Accessible color contrast, readable typography, and intuitive navigation flows.
