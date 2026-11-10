# Self-managed API

[![CI](https://github.com/Altitud-Studio-S-L-U/self-managed-api/actions/workflows/ci.yml/badge.svg)](https://github.com/Altitud-Studio-S-L-U/self-managed-api/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Altitud-Studio-S-L-U/self-managed-api/actions/workflows/codeql.yml/badge.svg)](https://github.com/Altitud-Studio-S-L-U/self-managed-api/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Inspect API changes, review their impact, and validate proposed migrations locally.**

A TypeScript SDK, CLI and local worker for maintaining API and MCP integrations. Compare contracts, inspect affected consumer calls, and prepare changes for review. Test execution, model use and GitHub publication have separate approval steps.

## From a breaking change to a reviewed migration

The included fictional payments walkthrough compares API contracts, prepares a consumer change and runs the same tests against baseline and candidate copies. Its expected result is a failing baseline followed by **25 passing candidate tests**. Docker execution is real; GitHub publication is simulated. The recorder supplies approvals for the fixed fixture, so this is not an interactive human-review demo.

[Follow the terminal walkthrough](dev/terminal-demo/README.md), or start below with a local comparison that needs no model, Docker or GitHub credentials.

```text
Provider contract + consumer source → compare and inspect → reviewed proposal
                                   → approved isolated tests → approved draft PR
```

No project account, license token or hosted control server is required. The project is [MIT licensed](LICENSE), and the package is not published to npm.

## What it does

| Area | Implemented behavior |
| --- | --- |
| Contract comparison | Compare OpenAPI with a pinned local oasdiff executable, MCP catalog captures, and a supported structural JSON Schema profile. Compare JSON examples as evidence of value changes. |
| Consumer inspection | Discover bounded native-fetch patterns in JavaScript and TypeScript without executing consumer code. Inspect explicitly selected Python and Java sources through reviewed recipes. |
| Change observation | Observe registered local or explicitly authorized HTTP sources, record evidence transitions, and maintain local jobs and history. |
| Migration proposals | Prepare source previews from reviewed recipes; optionally request a proposal from an operator-configured model. Bind review decisions to the captured proposal. |
| Isolated validation | Run selected, unchanged tests against original and candidate copies using prepared Linux x64 Docker profiles. |
| GitHub publication | Prepare a Git-bound publication candidate and publish a draft pull request to a private, writable, active, non-fork GitHub repository after a separate approval. |
| Dependency evidence | Inspect npm lockfile dependencies and compare them with an explicitly supplied advisory catalog. |

The public SDK exports are listed in [src/index.ts](src/index.ts). Detailed contracts and operating procedures are maintained in the [technical guide](docs/technical-guide.pdf), with an [HTML source](docs/technical-guide.html).

## Quick start

Requirements: **Node.js 24.21.0-24.x** and **pnpm 11.19.0**. Install from a Git checkout:

```sh
git clone https://github.com/Altitud-Studio-S-L-U/self-managed-api.git
cd self-managed-api
pnpm install --frozen-lockfile
pnpm build
pnpm self-managed-api --help
```

Dependency installation requires network access. The following examples use included fictional fixtures and need no model, server or comparison engine:

```sh
pnpm --silent self-managed-api mcp-compare fixtures/mcp/catalog-before.json fixtures/mcp/catalog-after.json --json
pnpm --silent self-managed-api scan fixtures/consumer --json
```

The catalog fixture changes a tool's input and output contracts. Its comparison deliberately detects two breaking changes and exits **1**. The scan reads local files without running consumer code.

For these comparison commands, exit **2** indicates invalid input or an execution error; inspect stderr. Other commands also distinguish unresolved or inconclusive evidence, approval, execution and publication outcomes. Use `--help` and the guide for their individual exit contracts.

### Compare OpenAPI

Explicitly download the pinned oasdiff engine, then compare the fictional contracts:

```sh
pnpm engine:setup
pnpm --silent self-managed-api compare fixtures/orders-v1.json fixtures/orders-v2.json --engine work/tools/oasdiff/oasdiff --json
```

On Windows, use `work/tools/oasdiff/oasdiff.exe`. This fixture also exits **1**. Engine setup requires network access and `tar`; subsequent local comparisons do not download an engine. JSON Schema and MCP comparisons do not require oasdiff.

### Follow a complete migration

The [terminal walkthrough](dev/terminal-demo/README.md) includes Linux x64 prerequisites, exact setup commands and replay fields for the payments example described above. It preserves the selected tests and live consumer while validating separate baseline and candidate copies.

### Use the SDK in another application

Build a local tarball and install it in your application. **Before installing, apply the documented consumer-root override for the `@tufjs/models` → `minimatch` dependency:** the checkout's override is not carried into the tarball. The [SDK installation instructions](docs/sdk-installation.md) contain the exact policy, advisory, commands and verification steps.

## Execution and approval boundaries

```text
                        LOCAL MAINTENANCE WORKFLOW

  Provider evidence      Consumer source        Reviewed recipe
  OpenAPI / MCP / JSON   JS / TS / selected      or optional model
  schemas / documents   Python and Java files   proposal
          |                    |                      |
          +-------> compare + inspect <---------------+
                             |
                      review decisions
                             |
                   approve test execution
                             |
                  isolated baseline + candidate
                             |
                  approve GitHub publication
                             |
                       draft pull request

  Local state and approval receipts remain outside the consumer checkout.
```

- Inspection and ordinary local worker observation require neither a model nor GitHub credentials.
- HTTP observation is explicitly enabled; registering a local HTTP policy does not itself fetch a source.
- Model inference uses an operator-configured local model or provider credentials. Remote disclosure has an explicit authorization boundary.
- Model use, test execution and draft PR publication each require their own approval. CLI approval commands confirm the exact request identifier in a terminal.
- GitHub publication requires a private destination on `github.com`, with push permission, that is neither archived, disabled nor a fork. Public repositories and GitHub Enterprise hosts are not supported publication destinations. Local candidate preparation does not verify remote eligibility; `publication-review --github` performs that check before approval.
- SDK approval functions trust their caller; they do not authenticate a human reviewer. Applications embedding the SDK own that boundary.
- Validation runs approved tests against separate captured copies. It does not change the live consumer checkout.
- Native service manifests are generated for review. Generating a manifest does not install a service or grant code execution.
- The project does not merge or deploy automatically.

Keep state, model credentials, proposals and approval receipts outside the consumer checkout and Git. Worker state uses a local SQLite database; apply the host's permissions, encryption and backup procedures as described in the guide.

## Scope and limitations

| Result | What it establishes |
| --- | --- |
| Structural contract diff | Changes within the supported profile. It does not establish business semantics or complete consumer compatibility. |
| Consumer impact report | Potentially affected observed calls. Imports, aliases, dynamic dispatch and unresolved cases require review. Automatic call discovery is not implemented for Python or Java. |
| JSON example comparison | Differences in captured values. Examples do not establish required fields or compatibility. |
| Passing selected tests | Their assertions passed in the configured isolated runtime. This does not prove all business behavior. |
| Dependency advisory report | Findings against the supplied evidence. It does not prove the absence of every vulnerability. |
| Draft pull request | A reviewable publication. Adoption, merge and deployment remain separate actions. |

Validation requires prepared **Linux x64 Docker profiles**. Python and Java use explicitly selected sources/tests; pytest and Maven/JUnit support the dependency profiles documented in the guide, rather than arbitrary application environments.

Models and GitHub are optional integrations with their own credentials and operating costs. The local CLI can inspect and compare supported evidence without either.

## Development and verification

Run the checkout's checks locally:

```sh
pnpm engine:setup
pnpm check
```

After completing the Linux runtime preparation in the guide, run the isolated integration suite:

```sh
pnpm test:isolated
```

To regenerate and verify the technical guide:

```sh
pnpm exec playwright install chromium
pnpm docs:build
pnpm docs:check
```

The documentation build checks page overflow and binds the PDF to the HTML source hash and package version. Keep source and PDF together when their contracts change. Optional development laboratories and their requirements are documented in the guide.

Every pull request runs `pnpm check` and `pnpm docs:check` on Linux, macOS and Windows, the isolated integration suite against the pinned Docker profiles on Linux x64, and a CodeQL scan. Model laboratories, live APIs and GitHub publication are not exercised in CI.

## Releases and updates

The package is not published to npm. Source releases require a local build; platform archives are produced separately with their own CLI runtime. Signing and update trust require operator-provisioned keys, and no official hosted update feed is bundled. See [release installation, signing and update boundaries](docs/releases.md).

## Contributing

Read [AGENTS.md](AGENTS.md) for repository conventions. Submit changes through a pull request against `main`, preserve valid tests, and describe the behavior and validation relevant to the change.

Report suspected vulnerabilities through the private channel described in [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE), copyright 2026 Altitud Studio. External engines, runtimes and dependencies retain their own licenses and attribution requirements.

Maintained by [Altitud Studio](https://altitudstudio.ad).
