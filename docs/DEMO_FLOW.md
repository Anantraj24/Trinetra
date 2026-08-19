# Demo Simulation Flow

## Overview
As this is a prototype, real emergency service (112) integration and blockchain are explicitly excluded. The system relies on a controlled Demo Mode to simulate real-world conditions like network loss.

## Demo Controls Component
A floating FAB (only rendered when `NEXT_PUBLIC_DEMO_MODE=true`) allows the presenter to toggle:
- **Network State**: Force the app into offline mode (triggers IndexedDB fallback and Survival Mode UI).
- **GPS Mocking**: Jump location to simulate reaching a checkpoint or going off-route.
- **Instant SOS**: Trigger an emergency without waiting for a missed safety check.

## Flow Walkthrough

### 1. Tourist Flow
1. **Role Entry & Home**: Select Tourist. Dashboard shows prompt to create a Safety Pass.
2. **Journey Safety Contract**: Tourist defines a route on the SVGBaseMap. App calculates local risk (pure function).
3. **Live Journey**: User tracks progress. 
4. **Safety Check & Survival Mode**: 
   - Presenter toggles "Offline" via Demo Controls.
   - App transitions to Survival Mode (battery saving UI, cached maps).
   - A missed safety check triggers a local alert.
5. **Rescue Capsule & Emergency Status**:
   - Tourist activates SOS. Since offline, the app queues the "Rescue Capsule" in IndexedDB and simulates a mesh-network broadcast.
   - Presenter toggles "Online". App immediately pushes the SOS to Firestore.
   - UI switches to Emergency Status, showing "Waiting for Responder".

### 2. Authority Flow
1. **TRINETRA Nexus**: Presenter opens a second browser window as Authority. The Nexus dashboard polls Firestore.
2. **Incident Detail**: The SOS from the Tourist appears. Authority clicks to view details.
3. **Assign & Resolve**: Authority assigns a responder. Tourist's Emergency Status screen updates in real-time to show "Help is on the way". Authority eventually marks as Resolved.
