# Data Model & State Management

## Firebase Firestore Collections

### `users`
- `uid` (string): Firebase Auth ID
- `role` (enum): `TOURIST` | `AUTHORITY`
- `name` (string)
- `contactDetails` (object)

### `journeys`
- `id` (string): Document ID
- `touristId` (string): Ref to users
- `startLocation` (GeoPoint / string coordinates)
- `endLocation` (GeoPoint / string coordinates)
- `status` (enum): `PENDING` | `ACTIVE` | `COMPLETED` | `INTERRUPTED` | `SOS`
- `offlineRiskScore` (number): 0-100
- `createdAt` (timestamp)

### `incidents`
- `id` (string): Document ID
- `journeyId` (string): Ref to journeys
- `touristId` (string): Ref to users
- `status` (enum): `OPEN` | `ASSIGNED` | `RESOLVED`
- `responderId` (string, nullable)
- `reportedAt` (timestamp)

## IndexedDB (idb) - Offline Storage
- **Store `active_journey`**: Caches the current journey object so risk calculations and UI can persist without a network connection.
- **Store `offline_queue`**: Caches SOS events or checkpoints generated while offline to synchronize with Firestore upon reconnection.

## State Ownership & Zod Validation
- **Tourist**: Owns their `journeys` (write access). Can create an `incident` via SOS (write access).
- **Authority**: Has read access to `journeys` and `incidents`. Has write access to update `incidents` status to ASSIGNED/RESOLVED.
- All form inputs (e.g., Journey Safety Contract) and external data payloads are validated through Zod schemas before interacting with Firestore or idb.
