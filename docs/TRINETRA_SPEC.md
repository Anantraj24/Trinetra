# TRINETRA Product Specification

## Architecture Overview
Minimal architecture using Next.js App Router, TypeScript (strict), Tailwind CSS, Firebase (Auth + Firestore), Zod for validation, and Lucide icons. `idb` is used for IndexedDB caching during offline demo scenarios.

## Exact Routes
- `/` - **Role Entry**: Users select between Tourist and Authority roles.
- `/tourist` - **Tourist Home**: Dashboard showing active status, past journeys, and quick start.
- `/tourist/safety-pass` - **Safety Pass**: Pre-verification and tourist identity details.
- `/tourist/journey/new` - **Journey Safety Contract**: Form to define start, destination, duration, and local risk calculation.
- `/tourist/journey/live` - **Live Journey**: Active tracking view (using SVGBaseMap).
- `/tourist/journey/check` - **Safety Check**: Periodic check-in prompt during the journey.
- `/tourist/survival` - **Survival Mode**: Offline/low-battery UI with critical local instructions.
- `/tourist/rescue` - **Rescue Capsule**: Mock peer-to-peer or mesh network SOS broadcast payload.
- `/tourist/emergency` - **Emergency Status**: Post-SOS screen showing rescue progress.
- `/authority` - **TRINETRA Nexus**: Dashboard for authorities showing active incidents and high-risk zones on SVGBaseMap.
- `/authority/incident/[id]` - **Incident Detail**: Deep dive into a specific tourist's SOS or missed check-in.

## Key Components
- `RoleSelector`: Component for root route to set user context.
- `SVGBaseMap`: Lightweight SVG-based map avoiding heavy SDKs.
- `DemoControls`: A fixed floating panel (only visible in Demo Mode) to simulate network drops, battery drain, or instant SOS.
- `SafetyStatusCard`: Reusable component displaying current risk/safety state.
- `OfflineIndicator`: Banner showing when the app falls back to IndexedDB.

## Button Behaviour
- All buttons must be functional or explicitly labeled "Coming later".
- Action buttons have loading states, empty states (disabled if form invalid), and success/error feedback.

## Risk Calculation
- Pure, reusable functions for risk calculation.
- Capable of running locally on the client while offline using cached baseline data.
