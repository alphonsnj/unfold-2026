# UNFOLD 2026 — Security, Bug, and Edge-Case Audit

Audit date: 2026-09-17  
Scope: React/Vite source, static assets, dependency graph, SEO/structured data, production response headers, accessibility-adjacent failure modes, and release checks.

## Remediation status

All findings below were resolved on 2026-09-17. Deployment headers are configured in `vercel.json` and will become observable on the public URL after the updated commit is deployed. The original evidence is retained below as an audit trail.

- SEC-001: resolved with CSP anti-framing/object/base/form restrictions plus COOP, Permissions Policy, Referrer Policy, MIME sniffing protection, and legacy frame denial.
- SEC-002 and SUPPLY-001: resolved; direct versions are pinned, unused packages were removed, PostCSS was updated, and `npm audit` reports zero vulnerabilities.
- A11Y-001, PERF-001, and BUG-001: resolved by removing the synthetic loader, GSAP sequence, HLS stream, and autoplay video; Framer Motion now follows the user's reduced-motion preference.
- PERF-002: resolved with intrinsic image dimensions, hero priority/decoding hints, and a compressed WebP venue image.
- SEO-001: resolved by removing the duplicate IEEE RAS sponsor entry from structured data while retaining its organizer role.
- DOC-001 and OPS-001: resolved with current sponsor documentation and a minimal CI workflow covering install, site integrity, build, and dependency audit.

## Original audit summary

No critical application vulnerability, exposed secret, unsafe HTML injection, credential flow, database, API, or user-controlled input surface was found. The site is a small static public site, which materially limits its attack surface.

Two issues should be addressed before the next release: the deployed site lacks a browser security-header policy, and the lockfile contains a vulnerable transitive `nanoid` version. The remaining findings are reliability, performance, accessibility, supply-chain hygiene, and SEO correctness issues rather than direct compromise paths.

| Severity | Count | Summary |
| --- | ---: | --- |
| Critical | 0 | None found |
| High | 0 | None found in reachable application code |
| Medium | 4 | Missing response headers, vulnerable build dependency, motion preference bypass, unconditional video/network load |
| Low | 6 | Loader cleanup/timing, image layout/performance, dependency drift, structured-data duplication, stale docs, missing automated checks |

## Medium findings

### SEC-001 — Production responses lack defense-in-depth security headers

- Location: deployment configuration (no `vercel.json` or equivalent header configuration is present)
- Evidence: the live `https://unfold-2026.vercel.app/` response included HSTS but did not include `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or an anti-framing policy (`frame-ancestors`/`X-Frame-Options`).
- Impact: the site can be framed by another origin, sends referrer information under browser defaults, and has no CSP containment if a future content-injection bug is introduced. The present static site has no user input, so immediate exploitability is low.
- Recommended fix: configure these headers at the Vercel edge. Start with `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive `Permissions-Policy`, and CSP `frame-ancestors 'none'`. Add a tested CSP after accounting for the Mux HLS stream and Google Fonts, or remove those third-party requests first.
- Temporary mitigation: keep the site static and avoid adding inline user-generated content until CSP is deployed.
- False-positive note: HSTS is already present, and `Access-Control-Allow-Origin: *` is not sensitive for this public static HTML because it contains no private data.

### SEC-002 — Vulnerable transitive `nanoid` dependency in the lockfile

- Location: `package-lock.json:1681-1693`, introduced through `postcss` at `package-lock.json:1778-1799`
- Evidence: both `npm audit` and `npm audit --omit=dev` reported GHSA-2v37-7h3g-55p8 against `nanoid@3.3.16`; a fix is available in `>=3.3.18`.
- Impact: affected custom generator calls can loop indefinitely for a zero output size. This project does not import or call `nanoid`; it is currently build tooling, so the advisory's generic “high” rating overstates this site's practical risk.
- Recommended fix: update the lockfile so PostCSS resolves a patched Nano ID version, then rebuild and rerun both audit commands. Do not use a forced major-version update unless the normal lockfile refresh cannot resolve it.
- Temporary mitigation: build only from the committed lockfile in a bounded CI job.
- False-positive note: no reachable browser runtime path to the affected API was found.

### A11Y-001 — JavaScript animation and autoplay video ignore reduced-motion preference

- Location: `src/main.tsx:13-18`, `src/components/LoadingScreen.tsx:6-15`, `src/components/VideoBackground.tsx:7-26`
- Evidence: CSS disables CSS animations in `src/style.css:3`, but the GSAP timeline, request-animation-frame counter, and autoplay looping video still run.
- Impact: users who request reduced motion still receive large transitions, an animated counter, and continuous background motion. This is an accessibility defect and can also worsen battery/CPU use.
- Recommended fix: read `matchMedia('(prefers-reduced-motion: reduce)')`; skip the loader/timeline and do not attach or autoplay the stream when it matches. Mark the decorative video `aria-hidden="true"`.
- Temporary mitigation: none beyond browser-level animation controls.

### PERF-001 — Below-the-fold footer video downloads and initializes on every visit

- Location: `src/components/Footer.tsx:6-8`, `src/components/VideoBackground.tsx:7-26`, `src/data/site.ts:3`
- Evidence: mounting the footer immediately imports the approximately 508 KB HLS bundle and attaches the Mux stream without waiting for viewport intersection. There is no poster, network-error state, or data-saving/reduced-motion gate.
- Impact: unnecessary bandwidth, CPU, battery use, and a third-party network request occur even when the visitor never reaches the footer. Failure or blocking of Mux can leave an empty background.
- Recommended fix: because this is now an archival event site, replace the decorative stream with an existing local event image. If video remains required, lazy-attach it with `IntersectionObserver`, use a poster, and skip it for reduced motion/data saving.
- Temporary mitigation: the dark footer overlay keeps text readable if playback fails.

## Low findings

### BUG-001 — Synthetic loader can complete after unmount and hides the hero entrance

- Location: `src/components/LoadingScreen.tsx:6-15`, `src/main.tsx:13-20`
- Evidence: the completion `setTimeout` is not retained or cleared. The GSAP hero timeline starts while the opaque loader is mounted, so much of the entrance animation finishes before it is visible. The loader also forces about 1.65 seconds of waiting independent of actual asset readiness.
- Impact: avoidable delay, hidden animation, and a possible callback after unmount in development/rapid remount cases.
- Recommended fix: remove the synthetic loader. The static page already has native image loading; this is the smallest reliable solution.

### PERF-002 — Large images lack intrinsic dimensions and the hero lacks explicit loading hints

- Location: `src/components/Hero.tsx:4`, `src/components/Sections.tsx:18,30`
- Evidence: event images, sponsor logos, and the 1.28 MB venue PNG omit `width`/`height`; the hero image does not declare `fetchpriority="high"` or async decoding.
- Impact: avoidable layout movement and slower largest-contentful paint, especially on mobile or slow connections.
- Recommended fix: add intrinsic dimensions/aspect ratios, prioritize the hero image, and convert/compress `public/christ-exterior.png` to WebP or AVIF.

### SUPPLY-001 — Broad `latest` dependency ranges make fresh installs non-deterministic

- Location: `package.json:12-29`
- Evidence: most direct dependencies use `latest`; `@vitejs/plugin-react` is a runtime dependency even though it is build-only. `react-router-dom` and `tailwindcss-animate` have no imports in `src`.
- Impact: a lockfile regeneration can silently introduce breaking or compromised versions, while unused packages increase audit surface.
- Recommended fix: pin intentional compatible ranges, move build-only packages to `devDependencies`, and remove unused packages after confirming they are not needed by configuration.
- Temporary mitigation: continue installing with `npm ci`, not unconstrained `npm install`, in deployment.

### SEO-001 — IEEE RAS is represented as both organizer and sponsor

- Location: `index.html:84-92`, `src/data/site.ts:6-10`, `src/components/Sections.tsx:26-30`
- Evidence: structured data lists IEEE Robotics and Automation Society Kerala Chapter as an organizer and IEEE Robotics and Automation Society Kerala Section as a sponsor; visible content also identifies it as a joint organizer while placing the logo in the combined sponsors/partners section.
- Impact: inconsistent entity relationships can reduce structured-data clarity and misstate the event's credits.
- Recommended fix: confirm the intended role and represent the organization once under the correct schema property. A combined visible partner grid can remain.
- False-positive note: if the Kerala Chapter and Kerala Section are intentionally distinct legal/event roles, document that distinction and keep both exact names.

### DOC-001 — Sponsor asset documentation is stale

- Location: `public/sponsors/README.md:3-8`
- Evidence: the README names only two logos and describes a grayscale hover treatment that the current components do not apply.
- Impact: future maintainers can add assets incorrectly or assume nonexistent behavior.
- Recommended fix: list the actual required filenames or delete the README if the component is the only needed source of truth.

### OPS-001 — No automated regression checks are defined

- Location: `package.json:6-10`; repository root (no CI workflow found)
- Evidence: only `dev`, `build`, and `preview` scripts exist. There is no automated dependency audit, lint, link/asset verification, or browser smoke test.
- Impact: broken internal anchors, missing assets, dependency advisories, and metadata regressions can reach production unnoticed.
- Recommended fix: add one minimal CI job running `npm ci`, `npm run build`, `npm audit --omit=dev`, JSON-LD parsing, and a static internal-link/asset check. Add browser testing only when a browser runtime is available.

## Checks that passed

- Production build completed successfully.
- TypeScript compilation completed as part of the build.
- JSON-LD parsed successfully.
- All statically referenced local assets exist.
- All internal fragment links resolve to an element ID.
- No `dangerouslySetInnerHTML`, `eval`, dynamic script execution, untrusted redirect, storage of sensitive data, or user-controlled HTML sink was found.
- No hard-coded credential, private key, password, or environment file was found in the repository scan.
- The only external link using `target="_blank"` also uses `rel="noreferrer"` (`src/components/Sections.tsx:30`).
- No stale registration URL, registration CTA, countdown, or active-registration copy was found in the current source.
- `git diff --check` passed.

## Validation

- A local browser smoke test confirmed the complete page accessibility tree, navigation targets, images, and accordion interaction after remediation. Core Web Vitals still require measurement from the deployed production build.
- The live deployment currently serves an older build (its observed `Last-Modified` date was 2026-09-12), so production content was not used to validate the current uncommitted post-event changes. Production headers were still checked independently.

## Recommended order

1. Patch the dependency advisory and add production response headers.
2. Remove the archival site's synthetic loader and footer stream; this resolves several motion, performance, and failure-mode findings with less code.
3. Add image dimensions/compression and correct the IEEE RAS structured-data role.
4. Add the minimal CI release check, then run one real-browser smoke test before publishing.
