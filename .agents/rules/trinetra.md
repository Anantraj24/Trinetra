# TRINETRA Engineering Rules 

You are working on the TRINETRA SIH prototype. 

Before editing: 
1. Inspect the existing repository and architecture. 
2. Reuse existing components and dependencies whenever possible. 
3. Do not replace working architecture unless necessary. 
4. Do not invent APIs, environment variables, Firebase collections or packages without implementing/documenting them. 
5. Never expose secrets in client code. 

Engineering requirements: 
- TypeScript strict. 
- Mobile-first responsive design. 
- Semantic HTML and accessible interactions. 
- No `any` unless unavoidable and documented. 
- No dead code, placeholder imports or fake TODO implementations. 
- No duplicated business logic. 
- Prefer pure reusable functions for risk calculations. 
- Validate external/form data. 
- Handle loading, empty, success, offline and error states. 
- Every button shown to users must work or be explicitly labelled "Coming later". 
- Prototype simulation controls must only appear in Demo Mode. 
- Do not claim real emergency-service integration. 
- Never claim guaranteed communication without network. 
- Preserve user privacy; use minimum necessary demo data. 

Performance: 
- Avoid unnecessary libraries. 
- Prefer CSS transitions over animation libraries. 
- Lazy-load heavy noncritical views. 
- Avoid unnecessary React re-renders. 
- Keep images optimized. 
- Prefer SVG prototype maps to a heavy mapping SDK for Prototype 1. 

UI: 
- Premium warm ivory/sand/taupe visual language. 
- Large rounded cards. 
- Layered translucent surfaces used sparingly. 
- Minimal borders and soft shadows. 
- Mobile UI should feel native. 
- Desktop should not look like a stretched phone. 
- Maintain WCAG-readable contrast. 

Before finishing every task: 
1. Run lint. 
2. Run TypeScript validation. 
3. Run relevant tests. 
4. Run production build when appropriate. 
5. Use the browser to inspect the changed flow at approximately 390px mobile and 1440px desktop widths. 
6. Fix errors before reporting completion. 

Response style: 
- Do not paste entire files into chat. 
- Report only: what changed, files changed, tests run, remaining issues.
