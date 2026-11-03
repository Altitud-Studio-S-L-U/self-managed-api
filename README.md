# Self-managed API

**Inspect API changes, review their impact, and validate proposed migrations locally.**

A TypeScript SDK, CLI and local worker for maintaining API and MCP integrations. Compare contracts, inspect affected consumer calls, and prepare changes for review. Test execution, model use and GitHub publication have separate approval steps.

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

The [English terminal walkthrough](dev/terminal-demo/README.md) takes the included fictional payments integration from a breaking OpenAPI change to a reviewed recipe, baseline/candidate validation and simulated draft PR publication. It includes Linux x64 prerequisites, exact setup commands and the replay fields to inspect.

The fixture forwards the caller's currency, selects the new API version and preserves exact integer minor units. Its expected result is a failing baseline followed by **25 passing candidate tests**, with the selected tests and live consumer unchanged. Test execution uses the real Docker runner; GitHub transport is simulated. The recorder supplies SDK approvals for this fixed fixture, so it does not demonstrate an interactive human review.

### Use the SDK in another application

Build a local package from the checkout:

```sh
pnpm pack --pack-destination work/packages
```

Before installing the tarball, apply the following dependency policy in the **consuming application's root**. This checkout pins `minimatch` to `11.0.4` only under `@tufjs/models@4.1.1` to address [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). The SDK tarball does not carry the checkout's root override into another application.

For pnpm, merge this into the consumer's `pnpm-workspace.yaml`:

```yaml
overrides:
  '@tufjs/models@4.1.1>minimatch': 11.0.4
```

For npm, merge this into the consumer's root `package.json`:

```json
{
  "overrides": {
    "@tufjs/models@4.1.1": { "minimatch": "11.0.4" }
  }
}
```

Then install the tarball with `pnpm add --ignore-scripts /path/to/self-managed-api-0.1.0.tgz` or `npm install --ignore-scripts /path/to/self-managed-api-0.1.0.tgz`. Verify the resolved chain with `pnpm why minimatch` or `npm ls minimatch`, retain the consumer's lockfile, and run its tests. The intended edge is `@tufjs/models@4.1.1 → minimatch@11.0.4`; other applications may contain additional copies requiring separate review. Reassess this scoped policy when upgrading TUF.

See the [guide](docs/technical-guide.html) for SDK examples, runtime preparation and application-owned approval handling. Checkout installations and CLI release builds use this repository's committed policy and lockfile.

## Execution and approval boundaries

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

## Releases and updates

Source releases identify a Git tag. Check out the chosen tag and follow [Quick start](#quick-start) to install dependencies and build the CLI; source archives do not include a Node runtime, `dist`, the comparison engine or Docker images. The package is not distributed through npm.

Run `pnpm release:build` manually to produce a platform archive with its own CLI runtime. Extract the complete directory. Publishing the resulting files is a separate manual action.

Optional native signing and public TUF signing use operator-provisioned keys and retain explicit signature status. Checksums alone do not establish publisher identity. The updater stages a verified package; installation remains separate. No official hosted update feed or trust identity is bundled.

See the [technical guide](docs/technical-guide.html) for release inputs, platform requirements, service operation and trust bootstrap.

## Contributing

Read [AGENTS.md](AGENTS.md) for repository conventions. Submit changes through a pull request against `main`, preserve valid tests, and describe the behavior and validation relevant to the change.

Report suspected vulnerabilities through the private channel described in [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE), copyright 2026 Altitud Studio. External engines, runtimes and dependencies retain their own licenses and attribution requirements.

Maintained by [Altitud Studio](https://altitudstudio.ad).
