# Levantamiento AS-IS PWA Implementation Plan (v1, Option B with offline capture on laptops)

> **For agentic workers:** Implement task by task and validate each task before moving on. Do not commit unless explicitly requested. This plan is self-contained; do not rely on earlier versions.

**Goal:** Build an installable PWA for MHCONSULTANCY analysts to capture interviews offline on company laptops (structured notes and encrypted audio), accept audio recorded externally on phones and uploaded online, run deterministic session-close verification on the laptop, synchronize to a central service, transcribe locally on one designated MHCONSULTANCY transcription computer, verify or generate traceable AS-IS diagrams with subprocesses, draft the A3, and export BPMN and the agreed Excel sheets. Validate in an internal pilot against the estimated baseline before commercialization. Phones do not record inside the app in v1.

**Architecture:** React/TypeScript PWA with a service worker for the app shell and an encrypted IndexedDB queue (Dexie). Fastify API with managed PostgreSQL as the authoritative store; every business table carries `organizationId`. Originals go through a pluggable storage interface (Google Shared Drive via service account, or private GCS bucket) using direct resumable uploads with MD5 verification. Transcription is local: v1 imports VTT produced by Buzz on a single designated transcription computer; an in-browser Whisper engine is a feature-flagged spike. Text analysis uses the Anthropic API behind a gate. Structural verification and BPMN import live in an isomorphic module that runs offline in the browser and on the server. Process-owner approval is attached evidence bound to an exported revision.

**Tech Stack:** React, TypeScript, Vite, vite-plugin-pwa, Dexie, Web Crypto API, Node.js, Fastify, PostgreSQL (managed), Prisma, Google Workspace OIDC, Google Drive API, Zod, bpmn-js, bpmn-moddle, BPMN auto-layout, fflate, @xmldom/xmldom, spark-md5, Transformers.js (spike only), Vitest, Playwright.

**Spec:** [2026-10-27-levantamiento-as-is-pwa-design.md](../specs/2026-10-27-levantamiento-as-is-pwa-design.md)

## Global Constraints

- Product name is **Mapio by MHCONSULTANCY**: Mapio is the application brand; MHCONSULTANCY is the corporate endorsement.
- Follow the MHCONSULTANCY moodboard: corporate red (swatch labeled “Naranja”), coffee brown, medium gray, black, and white/ivory surfaces; Futura for headings/graphic accents and Myriad Pro Bold for brand/principal text, using licensed font assets or legible fallbacks.
- Place `Mapio by MHCONSULTANCY.jpeg` in the top-left app header and `Logo MH.jpeg` in the bottom-right footer, both on light surfaces with their white backgrounds intact; do not crop, stretch, or reverse either lockup.
- Use `Sistema iconográfico aplicativo final.jpeg` as the normative icon source for primary navigation, secondary actions, documents, interviews, diagrams, A3, and review. Preserve its outline/color/monochrome variants, circular compositions, and 16/24/32/48 px sizing; do not substitute generic unrelated icons.
- Use natural leaf imagery and the segmented-leaf motif only in brand areas (cover, header accents, and empty states); keep tables, interview notes, transcripts, upload zones, and BPMN canvas clean and high-contrast.
- Offline capture (notes, consent receipts, audio) must work on registered company laptops with network APIs unavailable. In-app recording on phones, in-app video recording, offline AI, offline sync, and phone transcription are out of scope.
- Phones are external recorders only: their audio files are uploaded online (from the phone browser or a laptop) with a declared origin `phone_external | other_external`, interview, participants, and recording-consent confirmation.
- Every audio chunk (10-second `timeslice`) is encrypted and committed to IndexedDB before it is treated as durable; interrupted sessions are recoverable without a final Blob event.
- Recording interruptions on the laptop (sleep, lid close, page hidden, track end, errors) are detected and stored as `RecordingGap` with start/end times; the app requests `Screen Wake Lock` during recording and recommends external power.
- Local data is encrypted with AES-GCM using a per-user, per-device data key wrapped by PBKDF2-HMAC-SHA256 (600,000 iterations, per-user salt) from a local phrase of at least 14 characters; five failures trigger persisted exponential delay (30 seconds doubling to a 30-minute cap); plaintext keys live only in memory.
- Inactivity auto-lock is suspended while recording; explicit lock stops recording safely, flushes chunks, then clears keys.
- Dexie schema is versioned with data-preserving migrations; a new service worker does not activate during recording or with unsynced data and requires user confirmation.
- Request `navigator.storage.persist()` and show the result and available space.
- Only company laptops are registered as capture devices, each with a signed, versioned attestation renewed every 6 months; in-app recording requires a registered laptop with a current attestation. Analysts using personal phones as external recorders sign a BYOD agreement. Uploads declared `phone_external` are rejected for `client_authorized` projects whose client authorization does not allow personal devices. The app cannot verify device security and must not claim it does.
- Sync only with the app open and a valid server session; on expiry pause, re-authenticate, and resume without decrypting or deleting unsynced data. Local copies are deleted only after PostgreSQL commit, storage completion, and MD5 match.
- Every business record has `organizationId`; every project-scoped route verifies organization and project membership server-side and never trusts client-supplied IDs or roles; denials are non-enumerating.
- Originals are never public; no permissions are created on stored files.
- Each project declares `dataOrigin = internal | simulated | client_authorized`; `client_authorized` requires an attached client authorization, the legal-review flag, and configured retention, set by an `org_admin`.
- Text analysis requires: provider approved, duration and cost limits configured, allowed `dataOrigin`, and current `ai_processing` consent from every participant linked to the evidence. Otherwise zero bytes leave the system.
- Transcription is local and requires current `transcription` consent from every participant in the recording.
- AI output passes a strict Zod schema; every `SourceRef` resolves to evidence in the same project and organization; quoted spans match normalized source text; source content is data, never instructions.
- Confirmed, proposed, and pending stay distinct; metrics are never invented; contradictions are never silently resolved.
- Structural verification is deterministic, runs offline, and never calls a provider.
- Generated diagrams require an accepted review by a `diagram_reviewer` (not the generating analyst) before a revision is frozen for client review while the organization setting `requireDiagramReview` is on (default on).
- Approval attachments bind to a frozen revision hash and expire on any substantive edit.
- Draft and diagram editing require a server-side single-writer lease and connectivity.
- Excel export follows Task 7; ExcelJS is not used.
- Bizagi Modeler 4.0.0.65 compatibility is claimed only after round-trip fixtures pass.
- Insert-only, hash-chained `AuditEvent`; operational logs never contain notes, transcripts, prompts, media, upload URLs, or secrets.
- Session cookie `HttpOnly; Secure; SameSite=Lax`; CSRF on mutating requests; rate-limited auth; login restricted to the verified Workspace domain; restrictive CSP; content rendered as text; no secrets in the browser; two environments (development, production).
- Retention periods and legal conclusions are configuration supplied after external legal review; never invented.

## Review Focus

- Laptop recording over long sessions (sleep, lid close, battery, Wake Lock): Task 2, on the team's laptops first.
- Chunk recovery, encryption, lock suspension, migrations, service-worker update control: Task 2.
- Laptop attestation gate and personal-phone upload gate: Tasks 2 and 3.
- External audio formats from the team's phones: Task 3.
- Ordered sync, chunk assembly, resumable upload, MD5, session expiry: Task 3.
- Cross-organization and cross-project isolation: Tasks 1, 3, 8.
- Analysis gate, citations, prompt injection, caps; VTT import with gaps: Task 4.
- Diagram review, lease, approval expiry: Task 5.
- Offline structural verification and Bizagi import fidelity: Task 6.
- Excel package fidelity: Task 7.
- Pilot metrics and readiness: Task 9.

---

### Task 1: Foundation, multi-organization schema, hierarchy, taxonomy, and devices

**Files:**
- Modify: `package.json`, `index.html`
- Create: `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/app/App.tsx`, `src/app/app.css`, `src/shared/domain.ts`
- Create: `server/index.ts`, `server/app.ts`, `server/securityHeaders.ts`
- Create: `server/auth/session.ts`, `server/auth/csrf.ts`, `server/auth/projectAuthorization.ts`
- Create: `server/audit/auditWriter.ts`, `server/usage/usageEvents.ts`
- Create: `server/db/prisma.ts`, `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed/taxonomy.ts`, `prisma/seed/organization.ts`
- Create: `.github/workflows/ci.yml`, `.github/dependabot.yml`
- Create: `tests/server/health.test.ts`, `tests/db/migrations.test.ts`, `tests/auth/sessionSecurity.test.ts`, `tests/auth/projectAuthorization.test.ts`, `tests/audit/auditWriter.test.ts`, `tests/domain/complexityClassifier.test.ts`

**Interfaces:**
- `buildServer()` returns a Fastify instance; `GET /health` returns `{ "status": "ok" }`.
- `src/shared/domain.ts` defines `ReviewStatus = "proposed" | "confirmed" | "pending"`, `DataOrigin`, `AnalystProfile = "diagrammer" | "domain_specialist"`, `ComplexityLevel = "simple" | "medium" | "complex"`, `RecordingOrigin = "pwa_laptop" | "phone_external" | "other_external"`, `SourceRef`, `ProcessProject`, `Subprocess`, `ProcessActivity`, `PainPoint`.
- `classifyComplexity({ activities, roles, areas, hasSubprocesses })` applies the highest-criterion rule: simple ≤20 activities, 1–3 roles, 1 area; medium 21–30, 4–6, 2–3; complex >30 or subprocesses, ≥7, ≥4.
- Baseline schema, all business tables with indexed `organizationId`: `Organization`, `User` (`analystProfile`, `isDiagramReviewer`), `OrganizationMember` (`org_admin | member`), `Project` (`dataOrigin`, `complexityInitial`, `complexityFinal`, `complexityOverrideReason`, `apqcCategoryId`, `apqcLevel`, `industry`, `clientSize`, `benchmarkingConsent`), `Subprocess` (ordered), `ProjectMember` (`project_admin | analyst`), `Device` (company computers only, purposes `capture | transcription`), `DeviceAttestation`, `ByodAgreement` (user, version, signedAt, expiresAt), `Interview` (assigned analyst), `InterviewParticipant`, `ConsentRecord` (purpose `recording | transcription | ai_processing`, notice version, scope, method, evidence ref, device time, server time, revoked at), `ClientAuthorization` (`allowsPersonalDevices`, scope flags, attachment), `RecordingSession`, `RecordingGap`, `Evidence` (`phase = pre_session | session | post_session`, `recordingOrigin` for audio, derivedFrom), `UploadJob`, `StructuredNote`, `ProcessDraft`, `DraftRevision`, `EditLease`, `Diagram`, `DiagramRevision`, `DiagramReview`, `VerificationRun`, `ApprovalAttachment`, `AIJob`, `DeletionRequest`, `ExcelTemplate`, `TemplateMapping`, `InterviewGuide`, `GuideVersion`, `AuditEvent`, `UsageEvent`, `PilotMeasurement`.
- `requireProjectRole(userId, projectId, allowedRoles)` verifies organization and project membership with identical responses for missing and forbidden.
- `auditWriter.ts` appends through a DB role without UPDATE/DELETE; each event stores actor, organization, project, action, object, revision, server timestamp, previous hash, hash; never content.
- `usageEvents.ts` records counts by type without content.
- `prisma/seed/taxonomy.ts` loads the APQC PCF categories in use with source and version; `prisma/seed/organization.ts` creates MHCONSULTANCY and its first `org_admin` via a documented one-time command.

- [x] **Step 1: Write failing tests** for health, baseline migration from empty, session cookie flags, CSRF rejection, auth rate limiting, cross-organization and non-member denial with identical responses, audit immutability and hash-chain tamper detection, and `classifyComplexity` boundary cases (20/21 activities, 3/4 and 6/7 roles, 1/2 and 3/4 areas, subprocess flag, mixed cases).
- [x] **Step 2: Run and confirm failure.** `npm test -- --run tests/server tests/db tests/auth tests/audit tests/domain`
- [x] **Step 3: Scaffold toolchain, branded shell, and CI.** Scripts `dev`, `build`, `test`, `test:e2e`, `lint`, `typecheck`, `db:migrate`, `db:deploy`. CI runs lint, typecheck, tests, `npm audit --audit-level=high`; enable Dependabot; add CodeQL only if private-repository licensing is confirmed. Build the Spanish **Mapio by MHCONSULTANCY** shell with CSS tokens from the moodboard. Place `Mapio by MHCONSULTANCY.jpeg` at the top-left of the app header and `Logo MH.jpeg` at the bottom-right footer. Use the icons from `Sistema iconográfico aplicativo final.jpeg` for navigation and service actions, preserving their outlined/color/monochrome variants and sizes. Use licensed Futura/Myriad Pro Bold assets if supplied, otherwise legible fallbacks. Use natural leaf photography only in brand headers/empty states; keep dense working surfaces clear.
- [x] **Step 4: Implement server, schema, classifier, seeds, authorization helper, audit, usage events, security headers** (CSP, HSTS in HTTPS, secure cookies, CSRF).
- [x] **Step 5: Verify.** `npm test -- --run && npm run lint && npm run typecheck && npm run build`

**Validation note:** The initial PostgreSQL migration was executed against PGlite from an empty database. A source/versioned APQC taxonomy importer is ready, but no approved APQC category file is present in the workspace; load it before relying on taxonomy-based project setup.

### Task 2: Offline PWA, encrypted capture, structured notes, and device registration

**Files:**
- Create: `src/offline/db.ts`, `src/offline/migrations.ts`, `src/offline/projectRepository.ts`, `src/offline/localCrypto.ts`, `src/offline/unlockStore.ts`, `src/offline/serviceWorkerUpdate.ts`, `src/offline/storagePersistence.ts`
- Create: `src/capture/CapturePage.tsx`, `src/capture/AudioRecorder.tsx`, `src/capture/recordingSession.ts`, `src/capture/interruptionMonitor.ts`, `src/capture/wakeLock.ts`
- Create: `src/interview/StructuredNotesEditor.tsx`, `src/privacy/OfflineConsentForm.tsx`
- Create: `src/devices/DeviceRegistration.tsx`, `server/devices/deviceRoutes.ts`
- Create: `src/projects/ProjectSetupPage.tsx`, `src/projects/OfflineProjectDownload.tsx`, `server/projects/projectRoutes.ts`, `server/projects/subprocessRoutes.ts`
- Create: `tests/offline/projectRepository.test.ts`, `tests/offline/localCrypto.test.ts`, `tests/offline/migrations.test.ts`, `tests/offline/serviceWorkerUpdate.test.ts`, `tests/capture/recordingRecovery.test.ts`, `tests/capture/interruptionMonitor.test.ts`, `tests/capture/AudioRecorder.test.tsx`, `tests/devices/deviceGate.test.ts`, `tests/projects/projectSetup.test.ts`
- Create: `docs/testing/laptop-recording-spike.md`
- Modify: `vite.config.ts`, `src/app/App.tsx`

**Interfaces:**
- Project setup requires `dataOrigin`, complexity inputs (computed with `classifyComplexity`, override only with a recorded reason), APQC category, industry, client size, and optional `benchmarkingConsent` only with an attached contractual clause. Changing to `client_authorized` is restricted to `org_admin` and audited.
- `OfflineProjectDownload` caches the project, subprocesses, participants, guide version, structured-note schema, and consent notice versions in encrypted IndexedDB.
- `recordingSession.ts` exports `startRecording`, `persistChunk`, `recordGap`, `recoverInterruptedSessions`, `finalizeRecording`, `deleteSyncedChunks`, with stable session/chunk IDs and ordered timestamps. Chunk writes are serialized. A failed write or quota error stops capture and shows the recoverable partial session. MIME type is chosen with `MediaRecorder.isTypeSupported()` and stored per session.
- `interruptionMonitor.ts` listens to `visibilitychange`, `pagehide`, track `ended`/`mute`, and recorder errors; on resume it starts a new segment in the same session and stores a `RecordingGap` with cause.
- `wakeLock.ts` requests and re-acquires `Screen Wake Lock` while recording; failure is shown. The recorder warns not to close the lid or let the laptop sleep and recommends external power.
- `localCrypto.ts` and `unlockStore.ts` implement the key scheme of Global Constraints; record/project/user/chunk metadata are AES-GCM additional data with unique nonces; the raw key and phrase are never persisted. Switching users locks the current profile.
- Inactivity lock suspended during recording; explicit lock stops and finalizes before clearing keys.
- `StructuredNote` per activity: name, subprocess, actor/role, inputs, outputs, decision/conditions, system, handoff to, free text, `fieldsMissing` computed on save; encrypted offline; only the interview's assigned analyst edits it.
- `OfflineConsentForm` records consent per participant and purpose with device time; recording controls stay disabled until every participant has current `recording` consent; notes-only mode remains available.
- `DeviceRegistration` registers a company laptop and captures a signed, versioned attestation (screen lock, OS disk encryption, OS updated, not shared). `AudioRecorder` is available only on a registered laptop with a current attestation; on any other device (including phones) the recording control is hidden and the UI points to external-recording upload (Task 3).
- `storagePersistence.ts` requests `navigator.storage.persist()` before first offline capture and shows result and estimated free space.
- `serviceWorkerUpdate.ts` defers activation during recording or with unsynced data, shows an update prompt that can be postponed, and applies only after confirmation and a successful Dexie migration. The service worker caches only the app shell.

- [ ] **Step 1: Laptop recording spike before anything else.** On the team's laptops (Windows and macOS if both are used), record 60 minutes in the installed PWA with Wake Lock; then test lid close, sleep, battery saver, and switching tabs or windows. Record format, whether recording continues, gap-detection accuracy, and size per hour in `docs/testing/laptop-recording-spike.md`.
- [ ] **Step 2: Write failing tests** for encrypted persistence surviving repository reinitialization; recovery after interruption at chunk N producing playable audio; header-chunk corruption reported without deleting fragments; gap creation on simulated visibility changes and sleep; inactivity not interrupting recording; explicit lock finalizing safely; separate per-user keys on a shared laptop; unlock throttling; migration preserving pending chunks, notes, and consents; service-worker update deferred with pending data; device gate (unregistered device, no attestation, expired attestation); recording hidden on non-registered devices; recording disabled until all participants consent; project setup validation and `client_authorized` restrictions.
- [ ] **Step 3: Run and confirm failure.** `npm test -- --run tests/offline tests/capture tests/devices tests/projects`
- [ ] **Step 4: Implement** offline storage, crypto, migrations, recording session, interruption monitor, wake lock, persistence request, service-worker update control, structured notes, offline consent, device registration and gate, project setup and offline download.
- [ ] **Step 5: Verify** `npm test -- --run tests/offline tests/capture tests/devices tests/projects && npm run build`, then repeat the laptop spike with the implemented recorder and update the document.

### Task 3: Login, membership, profiles, storage, and synchronization

**Files:**
- Create: `server/auth/googleWorkspace.ts`, `server/auth/sessionRoutes.ts`
- Create: `server/org/orgMemberRoutes.ts`, `server/org/userProfileRoutes.ts`, `server/projects/membershipRoutes.ts`
- Create: `server/storage/storageAdapter.ts`, `server/storage/memoryStorageAdapter.ts`, `server/storage/googleDriveAdapter.ts`, `server/storage/gcsAdapter.ts`
- Create: `server/evidence/evidenceRoutes.ts`, `server/evidence/fileValidation.ts`, `server/evidence/transcriptParsers.ts`
- Create: `src/sync/syncQueue.ts`, `src/sync/SyncStatus.tsx`, `src/evidence/EvidenceUpload.tsx`, `src/evidence/ExternalAudioUpload.tsx`, `src/devices/ByodAgreementForm.tsx`
- Create: `tests/evidence/externalAudioUpload.test.ts`, `docs/testing/phone-audio-formats.md`
- Create: `tests/auth/workspaceLogin.test.ts`, `tests/org/userProfile.test.ts`, `tests/projects/membershipRoutes.test.ts`, `tests/storage/googleDriveAdapter.test.ts`, `tests/sync/syncQueue.test.ts`, `tests/evidence/fileValidation.test.ts`, `tests/evidence/transcriptParsers.test.ts`, `tests/evidence/evidenceRoutes.authorization.test.ts`
- Create: `docs/spikes/drive-resumable-cors.md`
- Modify: `server/app.ts`, `src/app/App.tsx`

**Interfaces:**
- OIDC login accepts only ID tokens whose verified `hd` equals the configured domain; first login grants no project access.
- `org_admin` manages organization members, analyst profiles, reviewer flags, registered laptops (including revocation, which invalidates the device's sessions and records an incident entry), and BYOD agreements; `project_admin` manages project members. All changes audited. Only `diagrammer` users can be reviewers.
- `StorageAdapter`: `createUploadSession`, `getUploadStatus`, `finalize` (returns `{ storageId, md5 }`), `openRead`, `delete`. Drive adapter uses a service account that is a Shared Drive member with the least role able to create files and never creates permissions; GCS adapter targets a private bucket with uniform access. Selected by configuration.
- Uploads: the API creates a resumable session and returns a short-lived URL (never logged); the browser sends 8 MiB ranges directly and computes incremental MD5 with spark-md5. Completion requires storage MD5 match, then the PostgreSQL reference is committed. Retries are idempotent by `UploadJob` id. Fastify control routes have a 1 MiB body limit and timeouts. If the CORS spike fails, fall back to a streaming proxy with backpressure and no full buffering.
- `syncQueue.ts` uploads, in order: consent receipts (server adds received time), structured notes (detecting newer server versions and surfacing conflicts), device-side `VerificationRun`s, then recordings. Audio chunks are decrypted sequentially while the profile is unlocked, appended to a bounded 8 MiB buffer, and uploaded as one file; MD5 covers the assembled bytes; gaps are uploaded as metadata. Local deletion only after commit, completion, and MD5 match. The laptop shows a persistent indicator while unsynced recordings exist. Session expiry pauses the queue and resumes from the last confirmed offset after re-authentication.
- Online evidence intake: documents (`.pdf`, `.docx`, `.xlsx`), existing transcripts (`.txt`, `.vtt`, `.docx`), existing video, and external audio, with configured size/type limits and MIME sniffing; each evidence carries `phase`. `transcriptParsers` normalize TXT/VTT/DOCX with speakers and timestamps.
- `ExternalAudioUpload` works online from any browser, including phones. It requires: declared `recordingOrigin` (`phone_external | other_external`), interview, participants, and confirmation of recording consent for all of them (which must exist or be recorded in the same step). Accepted formats include those produced by the team's phones (documented in `docs/testing/phone-audio-formats.md`, at least M4A) plus MP3, WAV, and Opus. `phone_external` uploads require the uploader to have a current `ByodAgreement` and are rejected for `client_authorized` projects whose authorization disallows personal devices. After MD5 confirmation the UI tells the analyst to delete the file from the phone.

- [ ] **Step 1: CORS spike.** Record result in `docs/spikes/drive-resumable-cors.md`; confirm Shared Drive availability or select the GCS adapter.
- [ ] **Step 2: Write failing tests** for domain-restricted login; admin-only membership, profile, reviewer, and device changes with audit; device revocation invalidating sessions; non-member and cross-organization upload/download denial; service-account identity and no permission creation; idempotent retry; MD5 mismatch keeping local data; ordered sync; note conflict detection; assembled-audio MD5 and gap metadata; unsynced indicator; session-expiry pause and resume; file validation and MIME spoofing; transcript parsing; external audio upload requiring origin, participants, and consent; `phone_external` rejected without a current BYOD agreement or when the client disallows personal devices; resumable upload of a large phone file from a mobile browser.
- [ ] **Step 3: Run and confirm failure.** `npm test -- --run tests/auth tests/org tests/projects tests/storage tests/sync tests/evidence`
- [ ] **Step 4: Implement** login, membership and profile routes, device administration, storage adapters, evidence intake, parsers, sync queue, and status UI.
- [ ] **Step 5: Verify.** `npm test -- --run tests/auth tests/org tests/projects tests/storage tests/sync tests/evidence && npm run typecheck`

### Task 4: Consent lifecycle, analysis gate, local transcription, domain guides, and AI analysis

**Files:**
- Create: `src/interview/InterviewPage.tsx`, `src/admin/GuideAdminPage.tsx`
- Create: `server/guides/guideRoutes.ts`, `server/guides/guideTailoring.ts`
- Create: `server/privacy/consentRoutes.ts`, `server/privacy/deletionRoutes.ts`, `server/privacy/retentionWorker.ts`
- Create: `server/ai/providerGate.ts`, `server/ai/anthropicAdapter.ts`, `server/ai/citationValidator.ts`, `server/ai/schemas.ts`
- Create: `server/transcription/vttImport.ts`, `src/transcription/TranscriptionHandoff.tsx`, `src/transcription/browserWhisperSpike.ts`
- Create: `tests/privacy/consentRoutes.test.ts`, `tests/privacy/deletionLifecycle.test.ts`, `tests/privacy/retentionWorker.test.ts`, `tests/ai/providerGate.test.ts`, `tests/ai/citationValidator.test.ts`, `tests/ai/promptInjection.test.ts`, `tests/transcription/vttImport.test.ts`, `tests/transcription/handoff.test.tsx`, `tests/guides/guideTailoring.test.ts`
- Create: `docs/providers/transcription-evaluation.md`

**Interfaces:**
- Consent purposes are independent; revocation cancels queued AI jobs, blocks retries, and opens a `DeletionRequest` that propagates to PostgreSQL, storage, derived evidence (transcripts, drafts), and records provider-deletion status. The retention worker runs only with configured periods. All audited without content.
- `InterviewGuide` per domain (initially `contable`, `operativo`) with versioned questions covering sequence, actor, inputs/outputs, decision, system, handoff, pain point, plus domain prompts; editable by `org_admin`, audited, cached offline.
- `providerGate.assertAllowed(projectId, evidenceIds)` checks provider approval, limits, `dataOrigin`, and current `ai_processing` consent for every linked participant; evidence without participants still requires the `dataOrigin` condition. Otherwise returns typed `pending` with reasons and makes zero calls.
- `anthropicAdapter` sends text only (notes, normalized transcripts, document text/PDF) from the server. Source content is delimited and labelled as evidence; embedded instructions are ignored. Hard timeout and per-project budget.
- `citationValidator` rejects fields whose `SourceRef` is missing, foreign, or whose quoted span is absent from normalized text.
- `AIJob` stores provider, exact model/version, prompt and schema versions, tokens, duration, cost, outcome, error class.
- `guideTailoring` uses pre-session documents (when the gate allows) to propose a preliminary flow and targeted questions marked `proposed` with citations; otherwise the base guide is used.
- `TranscriptionHandoff` is available only on the registered device with the `transcription` purpose (one designated computer in the MVP); an `org_admin` can temporarily enable a registered capture laptop as contingency, with an expiry and an audit event. It shows a queue of recordings pending transcription (oldest first, with a priority flag), applies equally to PWA recordings and external uploads, downloads the recording for local transcription, shows the approved Buzz version and model, accepts the VTT, and reminds the user to delete the downloaded copy; download and upload are audited.
- `vttImport` parses VTT with speakers and timestamps, aligns it to the recording, inserts `RecordingGap` markers, and stores it as derived evidence linked to the recording; requires current `transcription` consent for every participant.
- `browserWhisperSpike` runs Whisper via Transformers.js and WebGPU in a Web Worker on laptops behind feature flag `browserTranscription` (default off), producing the same derived-evidence format; never enabled on phones.

- [ ] **Step 1: Write failing tests**: gate denies on each missing condition independently with zero provider calls (mock records calls); consent purposes independent; revocation cancels jobs and opens deletion; foreign or missing citations, absent quotes, schema-invalid output, and injection attempts rejected; timeout and budget caps; AIJob metadata; VTT import with speakers, timestamps, and gap markers; transcription consent required; handoff only on the transcription device or an admin-enabled contingency laptop with unexpired permission; queue ordering and priority flag; handoff works for external phone uploads; spike disabled by default; tailoring falls back when denied.
- [ ] **Step 2: Run and confirm failure.** `npm test -- --run tests/privacy tests/ai tests/transcription tests/guides`
- [ ] **Step 3: Implement** consent lifecycle, deletion, retention worker.
- [ ] **Step 4: Implement** guides, tailoring, gate, adapter, validator, VTT import, handoff, and the spike. Evaluate Buzz and the spike with simulated recordings (Ecuadorian Spanish, multiple speakers, accounting and operations vocabulary), including phone recordings made in a meeting room; record quality observations, speaker separation, and processing time per audio hour on the designated transcription computer in `docs/providers/transcription-evaluation.md`; approve one Buzz version and model; confirm the computer can clear a worst-case week (two complex processes of 16 to 24 audio hours each) without delaying internal validation.
- [ ] **Step 5: Verify.** `npm test -- --run tests/privacy tests/ai tests/transcription tests/guides && npm run typecheck`

### Task 5: Draft review, diagram review, revisions, and external approval

**Files:**
- Create: `src/review/DraftReviewPage.tsx`, `src/review/FieldReview.tsx`, `src/review/DiagramReviewPanel.tsx`, `src/review/ApprovalAttachmentPanel.tsx`
- Create: `server/review/reviewRoutes.ts`, `server/review/editLease.ts`, `server/review/diagramReviewRoutes.ts`, `server/review/approvalRoutes.ts`
- Create: `tests/review/fieldReview.test.tsx`, `tests/review/editLease.test.ts`, `tests/review/diagramReview.test.ts`, `tests/review/approvalAttachment.test.ts`

**Interfaces:**
- `setReviewStatus(projectId, fieldId, status, reviewerId, note)` preserves source references.
- `EditLease` per draft with holder and expiry; acquire, renew, release; others read-only and see the holder; stale writes rejected.
- Freezing revision N for client review stores a content hash.
- `DiagramReview` records reviewer (must be `isDiagramReviewer` and not the generating analyst), diagram revision, decision (`accepted | changes_requested`), notes, minutes spent. A revision containing a generated diagram cannot be frozen without an accepted review of that diagram revision while `requireDiagramReview` is on; imported diagrams do not require review. Any diagram edit after review expires it.
- `ApprovalAttachment` stores revision N, hash, approver name and role as stated in the document, approval date, file (via storage), and uploading analyst; it does not claim the approver authenticated. A substantive edit creates N+1, expires attachments for N, and sets project status `needs_reapproval`.
- Every mutation audited without content.

- [ ] **Step 1: Write failing tests** for pending metrics, displayed contradictions, status changes preserving sources, lease contention, stale writes, reviewer eligibility (non-reviewer and self-review rejected), freeze blocked without accepted review for generated diagrams, imported diagrams exempt, review expiry on edit, approval expiry on edit, cross-project denial, audit on every mutation.
- [ ] **Step 2: Run and confirm failure.** `npm test -- --run tests/review`
- [ ] **Step 3: Implement** review workflow, lease, diagram review, approval attachment.
- [ ] **Step 4: Render** A3 and AS-IS review for sheets 1.1, 1.2, 1.3, 2.3, 2.5, 2.6; time, frequency, baseline, %C&A, FTE, queue, and Pareto stay pending unless sourced.
- [ ] **Step 5: Verify.** `npm test -- --run tests/review && npm run typecheck`

### Task 6: Diagram model, Bizagi import, offline structural verification, generation, and export

**Files:**
- Create: `shared/process/model.ts`, `shared/process/structuralChecks.ts`, `shared/process/bpmnImport.ts`
- Create: `src/process/ProcessDiagramPage.tsx`, `src/process/PlainLanguageView.tsx`, `src/process/VerificationPanel.tsx`, `src/process/SessionClosePage.tsx`
- Create: `server/process/bpmnExport.ts`, `server/process/diagramGeneration.ts`, `server/process/autoLayout.ts`, `server/process/diagramRoutes.ts`, `server/process/verificationRoutes.ts`
- Create: `tests/process/structuralChecks.test.ts`, `tests/process/bpmnImport.test.ts`, `tests/process/sessionCloseOffline.test.ts`, `tests/process/bpmnExport.test.ts`, `tests/process/diagramGeneration.test.ts`, `tests/process/autoLayout.test.ts`, `tests/process/diagramRoutes.authorization.test.ts`
- Create: `tests/fixtures/bizagi/` and `tests/fixtures/bizagi-roundtrip-check.md`

**Interfaces:**
- `shared/process/model.ts`: process, subprocesses, pool, lanes by role, activities, events, gateways with conditions, sequence flows, call activities or collapsed subprocesses, data inputs/outputs, `SourceRef` per element. Independent of Bizagi.
- `structuralChecks(model | structuredNotes)` returns typed findings with severity and a suggested Spanish question, without any network call: activity without role, input, or output; gateway without conditions or with one outgoing flow; empty lane; documented role absent from flow; path without end event; unreachable activity; subprocess output not consumed or input without origin; role present in one subprocess and absent in the next without handoff.
- `bpmnImport(xml)` parses BPMN 2.0 from Bizagi Modeler 4.0.0.65 via bpmn-moddle, preserving IDs, lanes, gateways, subprocesses, and DI; unsupported elements go to an `ImportReport`, never silently dropped.
- These three shared modules are isomorphic and bundled into the PWA. `SessionClosePage` runs offline on registered laptops (Bizagi import plus checks, or checks on structured notes), storing the `VerificationRun` (findings count, duration) in IndexedDB until sync.
- `diagramGeneration(projectId)` (online, behind the analysis gate) builds the model from structured notes, transcripts, and documents with citations; unsourced elements are `proposed`.
- `autoLayout` produces non-overlapping DI; `PlainLanguageView` shows who, receives, delivers, decides, system, subprocess, with sources; the editor uses bpmn-js with the Task 5 lease.
- `bpmnExport(model)` emits BPMN 2.0 XML with DI, stable IDs, Spanish labels, and subprocesses in the form validated by the round-trip fixture.

- [ ] **Step 1: Write failing tests** for every structural check including subprocess interfaces with network mocked to throw; offline session close for an imported `.bpmn` and for structured notes; Bizagi fixture import preserving lanes, gateways, and subprocesses and reporting unsupported elements; generation with citations and `proposed` for unsourced elements; non-overlapping layout; export validity; route authorization.
- [ ] **Step 2: Run and confirm failure.** `npm test -- --run tests/process`
- [ ] **Step 3: Implement** the shared model, structural checks, Bizagi import, and offline session-close page. These do not depend on AI and are the first pilot-usable feature after capture.
- [ ] **Step 4: Implement** generation, auto-layout, editor, plain-language view, export.
- [ ] **Step 5: Round trip with Bizagi Modeler 4.0.0.65.** Export from Bizagi, import, export, re-import into Bizagi; record preserved and lost constructs in `tests/fixtures/bizagi-roundtrip-check.md` before claiming compatibility.

### Task 7: Excel export with registered, configurable templates

**Files:**
- Create: `server/exports/excelExport.ts`, `server/exports/xlsxPackage.ts`, `server/exports/templateRegistry.ts`, `server/exports/exportRoutes.ts`
- Create: `src/admin/TemplateAdminPage.tsx`
- Create: `tests/exports/excelExport.test.ts`, `tests/exports/xlsxPackageFidelity.test.ts`, `tests/exports/templateRegistry.test.ts`, `tests/exports/exportRoutes.authorization.test.ts`
- Create: `tests/fixtures/template-inventory.json`, `tests/fixtures/workbook-expected.md`

**Interfaces:**
- `ExcelTemplate` (organization, name, version, SHA-256, inventory, storage reference) and `TemplateMapping` (domain field to sheet/cell) are data managed by `org_admin`, versioned, audited. First template: `Toolkit_Playbook_Rediseno_Iniciativas A3.xlsx`, SHA-256 `0f662d7d7e1adc5dcafc5b9fa226c715f04afcff6feb1451225c32033a765d95`, inventory 34 worksheet parts, 91 package parts, 1 chart, 27 conditional formats, 60 data validations, 6 `extLst`, `xl/calcChain.xml` present, no tables, pivots, slicers, or images.
- Registration rejects mappings to formula cells; export re-checks and fails closed. An unregistered or modified template fails closed.
- `xlsxPackage.ts` (fflate and @xmldom/xmldom) may modify only: mapped worksheet XML; `xl/workbook.xml` (new sheet entry and `calcPr`); `xl/_rels/workbook.xml.rels`; `[Content_Types].xml`; `docProps/app.xml`; and add the `Propuestas pendientes` worksheet. If `xl/calcChain.xml` exists, remove it and its content-type entry because the export adds a `HYPERLINK()` formula and the existing calculation chain would be stale. Set full recalculation on open. All other decompressed parts stay byte-identical.
- Text is written as `inlineStr`; `sharedStrings.xml` is not modified. Sheet 2.3 link uses `HYPERLINK(url, label)` in the first data-row link cell (`E14`); `E13` is the template's illustrative example and remains unchanged. No worksheet relationships are added.
- Policy: confirmed to mapped cells; proposed to `Propuestas pendientes` with destination, value, source, state; pending blank. That sheet shows the exported revision and approval status (`approved`, `needs_reapproval`, `not_approved`).
- One A3 per project; subprocess activities roll up into process-level sheets; 2.3 links to the process diagram.
- `calcMode="auto"`, `fullCalcOnLoad="1"`, `forceFullCalc="1"`.
- Export route requires `requireProjectRole`, audits project, revision, and template hash, never content; export is not approval.

- [ ] **Step 1: Write failing tests** for unregistered/modified template rejection; formula-cell mapping rejection; output opening with 34 original sheets plus the proposal sheet; three field states; `E13` example preserved, `HYPERLINK` written in `E14` with no new relationships, stale `calcChain.xml` removed if present, and recalc flags; `needs_reapproval` after edit; only allowlisted parts differ; chart, conditional formats, validations, and `extLst` preserved; single A3 with rolled-up subprocess activities; cross-project export denied.
- [ ] **Step 2: Run and confirm failure.** `npm test -- --run tests/exports`
- [ ] **Step 3: Implement** registry, package patcher, export.
- [ ] **Step 4: Implement** export route and template admin page.
- [ ] **Step 5: Verify** in Excel and LibreOffice: recalculation on open, visible proposal sheet, working hyperlink, chart, formats, validations.

### Task 8: End-to-end verification

**Files:**
- Create: `tests/e2e/offline-profile-a-laptop.spec.ts`, `tests/e2e/offline-profile-b-external-audio.spec.ts`, `tests/e2e/gates.spec.ts`, `tests/e2e/review-approval-export.spec.ts`, `tests/e2e/isolation.spec.ts`, `tests/e2e/pwa-update.spec.ts`
- Create: `docs/testing/device-matrix.md`

- [ ] **Step 1: Scenarios**
  - Profile A on a laptop profile: setup with taxonomy, download for offline, go offline, consent, record, reload during recording and recover, import Bizagi `.bpmn`, session-close findings, reconnect, ordered sync, local copy deleted after MD5, transcription handoff and VTT import, review, export BPMN and Excel.
  - Profile B on a laptop: consent, structured notes offline, session-close findings on notes, reconnect and sync; the session audio is recorded externally and uploaded from a mobile-viewport browser as `phone_external` with participants and consent; then transcription handoff and VTT import, generation with citations, plain-language validation, freeze blocked until reviewer accepts, approval attached, edit expires approval and review.
  - Laptop recording with simulated sleep and visibility interruptions producing gaps, recovered after reload.
  - Gates: analysis blocked per missing condition; transcription import blocked without consent; `phone_external` upload rejected on a `client_authorized` project without personal-device permission or without a BYOD agreement; recording control hidden on unregistered devices.
  - PWA update deferred with pending data.
  - Isolation: same-organization non-member and other-organization user denied everywhere.
- [ ] **Step 2: Run and identify failures.** `npm run test:e2e`
- [ ] **Step 3: Repair only defects in the tested workflow.** External systems mocked; no real recordings or credentials.
- [ ] **Step 4: Full verification.** `npm test -- --run && npm run lint && npm run typecheck && npm run build && npm run test:e2e`
- [ ] **Step 5: Device matrix.** Record real-device results for the team's Windows/macOS laptops (recording duration, gaps, formats, storage, persistence, Wake Lock, sync resume, Bizagi import) and for external-audio upload from the team's phones (formats, large-file resumable upload from the mobile browser); untested combinations are unsupported.

### Task 9: Operations, device policy, pilot gates, baseline, and metrics

**Files:**
- Create: `docs/operations/runbook.md`, `docs/operations/backup-restore.md`, `docs/operations/responsibility-matrix.md`, `docs/operations/device-policy.md`, `docs/operations/byod-agreement.md`, `docs/operations/lost-device-response.md`, `docs/operations/buzz-installation.md`, `docs/operations/transcription-computer.md`
- Create: `docs/pilot/pilot-plan.md`, `docs/pilot/baseline-estimated.md`, `docs/pilot/baseline-timed.md`, `docs/legal/pre-client-checklist.md`
- Create: `src/pilot/MeasurementForm.tsx`, `server/pilot/measurementRoutes.ts`, `server/pilot/pilotReport.ts`, `server/readiness/readiness.ts`
- Create: `tests/operations/readiness.test.ts`, `tests/operations/restore.test.ts`, `tests/operations/logRedaction.test.ts`, `tests/pilot/pilotReport.test.ts`

**Interfaces:**
- `baseline-estimated.md` transcribes the design's tables (profile A by level; profile B contable with 5–8 subprocesses and 8–16 h diagramming each) with source and limitations. `baseline-timed.md` records at least one timed profile A levantamiento and one timed profile B contable process before the pilot.
- `PilotMeasurement` per project: analyst, profile, complexity initial and final, subprocess count, recording origin (`pwa_laptop | phone_external | other_external`), number and duration of gaps, hours by stage (session, internal validation, transcription, diagramming, diagram review, each correction round), number of correction rounds, calendar days from session to deliverable, client wait days per round, A3 fields completed, accepted, pending, citations rejected or corrected, export outcomes. Hours are entered by the analyst at the end of each stage.
- `pilotReport` compares against the timed baseline when available, otherwise the estimated one, always within the same level and profile, flags analyst mismatches, and reports H1 (rounds, calendar days), H2 (internal validation hours), H3 (diagramming plus review hours for profile B), H4 (A3 completeness) separately, never as one aggregated saving.
- `readiness.ts` reports pilot readiness (managed backups on, restore drill within 90 days, CI green, audit verification passing, laptop recording spike documented, phone audio formats documented, approved Buzz version and model, registered transcription computer with current attestation and documented throughput, current attestations for pilot laptops, current BYOD agreements for analysts using phones) and client-use readiness (adds legal-review flag, retention configured, AI provider terms reviewed, client authorization template covering personal devices, legal review of the BYOD agreement). AI on `client_authorized` projects is blocked until client-use readiness passes.

- [ ] **Step 1: Write failing tests** for readiness per missing item, restore into a disposable PostgreSQL (organizations, memberships, devices, consents, approvals, verifiable audit chain), log redaction with a transcript sentinel, and pilot-report rules (same-level comparison, analyst-mismatch flag, separate hypotheses, timed baseline precedence).
- [ ] **Step 2: Run and confirm failure.** `npm test -- --run tests/operations tests/pilot`
- [ ] **Step 3: Document** runbook (deploy, rollback, secret rotation, migration order, managed-provider alerts), quarterly restore drill, responsibility matrix, device policy, BYOD agreement, lost-device response (revoke sessions and device, record incident, assess unsynced data with the client; state that a PWA cannot remotely wipe local data), Buzz installation from the official source with the approved version, transcription-computer controls (dedicated account, disk encryption, screen lock, no personal cloud sync, deletion of downloaded copies) and contingency procedure, pilot plan (internal and simulated projects until client-use readiness; designated reviewers; mix of profiles A and B), baselines, and pre-client legal checklist (controller/processor qualification, notice, consent, retention, sub-processors, international transfer, AI provider terms, personal devices, optional benchmarking clause).
- [ ] **Step 4: Implement** measurement form, pilot report, readiness checks.
- [ ] **Step 5: Verify.** `npm test -- --run tests/operations tests/pilot && npm run typecheck`

## Self-Review

- **Spec coverage:** foundation, taxonomy, devices (1); offline PWA on laptops, encrypted capture, interruptions, notes, consent, laptop gate (2); login, storage, ordered sync, evidence intake, external phone audio upload (3); consent lifecycle, analysis gate, local transcription, guides (4); review and approval (5); offline structural verification, Bizagi import, generation, export (6); Excel (7); offline end to end on laptop plus external phone audio (8); operations, device policy, pilot metrics (9).
- **Recommended build order:** Task 2 Step 1 (laptop recording spike) first; then Tasks 1, 2, 3; then Task 6 Steps 1–3; then Task 4 with the Buzz evaluation; then 5, rest of 6, 7, 8, 9.
- **External prerequisites:** managed PostgreSQL and hosting; Workspace Shared Drives or GCS bucket; service account; Anthropic API commercial account; approved Buzz version; the team's phones for audio-format checks; one designated transcription computer with enough capacity for 3 analysts; signed BYOD agreements; external developer with code assignment; external lawyer before client use; Bizagi Modeler 4.0.0.65 samples; domain guides; timed baselines.
- **No commits** unless explicitly requested.
