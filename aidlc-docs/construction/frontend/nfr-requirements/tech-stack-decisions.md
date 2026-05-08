# Tech Stack Decisions: frontend

| Concern | Decision | Rationale |
|---|---|---|
| Framework | React 18.x (pinned) | Specified in requirements |
| Build tool | Vite 5.x (pinned) | Fast HMR, standard for React |
| Server state | @tanstack/react-query 5.x (pinned) | Specified in requirements |
| HTTP client | axios 1.6.8 (pinned) | Consistent with data-integration |
| Routing | react-router-dom 6.x (pinned) | Standard React routing |
| Map | react-leaflet 4.x + leaflet 1.9.x (pinned) | Open source, no API key needed |
| Charts | recharts 2.x (pinned) | React-native, good docs |
| Styling | CSS Modules | No extra dependency, scoped styles |
| Testing | vitest + @testing-library/react (pinned) | Vite-native test runner |
| Linting | eslint (pinned) | Code quality |
