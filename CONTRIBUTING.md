# 🤝 Contributing to QuillForge

Thank you for your interest in contributing to QuillForge! Following these instructions guarantees a clean development lifecycle.

---

## 💻 Development Workflow

1. **Fork & Branch**: Create a feature branch off of the `main` branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. **Setup Env**: Ensure you have valid local `.env` configurations set up inside `quillforge/backend/.env`.

---

## 🧼 Code Quality & Style Guidelines

- **Clean Structure**: Write clean, dry, well-commented code. Avoid bloated single-file codebases.
- **ESM Modules**: Maintain native ESM `import`/`export` syntax in backend files.
- **JSX Extensions**: Always use `.jsx` extensions for any React frontend files containing markup to keep Vite dev compilations fast and error-free.

---

## 🧪 Testing Standards

All code modifications must pass the test suites before submitting pull requests.

### Backend Testing (Jest + Supertest)
Ensure all backend tests pass successfully:
```bash
cd quillforge/backend
npm test
```
Write unit and integration tests under `tests/` for any new controllers, schemas, or middlewares.

### Frontend Testing (Vitest + JSDOM)
Ensure all frontend UI assertions and navigation tests pass successfully:
```bash
cd quillforge/Frontend
npm test
```
Write component tests under `src/__tests__/` for new components or routing pages.

---

## 💬 Commit Guidelines

Use descriptive commit messages that follow conventional commits structure:
- `feat(auth): add OAuth registration support`
- `fix(blogs): repair views count increment handler`
- `docs(api): update sitemap reference paths`
