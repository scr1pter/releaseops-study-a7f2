# ReleaseOps starter

This is an unfinished synthetic benchmark scaffold. It contains public fixtures,
deployment identity, a deliberate hosted API failure, and basic visible chrome.
The product modules in BUILD_SPEC.md remain to be built.

Before any source edits, open the already supplied public test deployment in a
fresh owned browser profile. Click **Run cloud diagnostic** and preserve the
actual hosted500 response, request ID, console event and screenshot. Local501
is not hosted evidence. After that baseline is retained, implement and repair
the product. A repaired product must not manufacture another500.

Use Node24. Dependency versions and bun.lock match the supplied shared seed.
Install with Bun1.3.13 using `bun install --frozen-lockfile --ignore-scripts`.
`npm run ci` runs typecheck, public protocol tests and build; it is different
from `npm ci` and there is no npm lockfile. To invoke the CI script directly on
Windows, supply NPM_CLI pointing to npm-cli.js and run it with NODE_EXE.

The assigned repository is a new disposable public repository, default main.
Its own new disposable Vercel project's stable public production alias is only
a test deployment. Never touch existing production resources or another arm's
repository. Do not change deployment protection or global Git configuration.
Configure the supplied public noreply author only in this assigned clone.

Use the supplied NODE_EXE, PLAYWRIGHT_MODULE and CHROME_PATH for owned headless
browser work. No browser is downloaded and no private owner profile is copied.
The app contains no credentials; do not add provider accounts, secrets, paid
resources, external services or environment dumps.
