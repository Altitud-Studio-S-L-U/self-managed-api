# Security policy

## Reporting a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/Altitud-Studio-S-L-U/self-managed-api/security/advisories/new). Include the affected commit or version, the relevant SDK or CLI operation, prerequisites, expected behavior and a minimal reproduction using fictional data.

Do not publish credentials, consumer source, local state, approval receipts or a working exploit against another user's environment in a public issue. Reproduce issues only in environments you control. Response times and release dates are not guaranteed.

## Supported scope

Security fixes target the current `main` branch. This project is distributed from source and operator-built releases; the npm package is not published and there is no bundled hosted update feed.

The SDK, CLI and worker run with the local operator's permissions. Approval receipts record explicit caller intent for a bound operation; they do not authenticate a human or protect against another process running as the same OS user. Embedding applications must authenticate their callers and authorize SDK approval functions themselves.

Keep worker state, approval receipts, model credentials and proposals outside the consumer checkout. Apply host permissions, encryption and backup controls. Captured source and validation evidence can contain private application data.

Model calls, selected-test execution and draft PR publication have separate approval boundaries. Configured SDK adapters and transport overrides are trusted code, not a sandbox. The built-in GitHub adapter accepts private, writable, active, non-fork repositories on `github.com`; it never merges or deploys. An interrupted write can have completed remotely: reconcile its existing attempt before another publication.

Validation profiles use bounded Linux x64 Docker containers. Passing selected tests establishes only their observed results in that profile, not complete consumer compatibility or proof that arbitrary code is harmless. Keep the host, Docker and configured runtimes maintained.

See the [technical guide](docs/technical-guide.html) for runtime preparation, approval contracts and operating limits.
