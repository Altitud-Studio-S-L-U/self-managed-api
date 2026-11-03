# Walkthrough: a payments API migration

Run a complete maintenance cycle through the [public SDK](../../src/index.ts): observe changed local contracts, prepare a reviewed recipe, approve and execute baseline/candidate tests, then approve a simulated draft PR. The payments provider and credentials are fictional. No model, provider account or GitHub credentials are required.

The example changes the API version from `2026-01` to `2026-02`, forwards the application's existing currency, and converts an explicitly defined decimal amount into exact integer minor units. Those decisions come from the [reviewed recipe](../../fixtures/payments/payment-recipe.json) and [contract snapshots](../../fixtures/payments), not from field-name inference.

## Prerequisites

- A Linux x64 host, Node.js **24.21.0-24.x**, pnpm **11.19.0**, Git at `/usr/bin/git`, and `tar`.
- Docker at `/usr/bin/docker`, with a local Linux x64 daemon accessible to the current user at `unix:///var/run/docker.sock`. The daemon must support seccomp and memory, swap, CPU quota and PID limits.
- A checkout on a native Linux filesystem that supports private file/directory permissions. With WSL, use a Linux home directory rather than a Windows-mounted checkout.
- Network access for dependency installation, the pinned oasdiff download and the explicit Docker image pull below. After setup, this fixture uses local evidence and loopback HTTP inside the test containers.

These commands use Bash and run from the repository root. Start with the [Quick start](../../README.md#quick-start), including dependency installation and `pnpm build`.

## Prepare the comparison engine and test runtime

Check that the required host tools are available:

```sh
node --version
pnpm --version
/usr/bin/git --version
/usr/bin/docker --host unix:///var/run/docker.sock info
```

Download the comparison engine and the exact Node image used by the [validation profile](../../src/docker-runner.ts):

```sh
pnpm engine:setup
work/tools/oasdiff/oasdiff --version
/usr/bin/docker --host unix:///var/run/docker.sock pull --platform linux/amd64 \
  node@sha256:51b1100cc2a83d370c6a60952e3f2989c8a43159d0e38586e090f3b3326efefd
```

The runner uses `--pull=never`: it will not fetch a missing image during validation. Its profile disables external networking, mounts captured source read-only, drops capabilities and runs as an unprivileged container user with resource limits. The selected fixture test starts its own loopback HTTP server; do not start a separate payments service.

## Record the maintenance cycle

Read [record.mjs](record.mjs) and the recipe before running this command. The recorder calls SDK approval functions automatically for this fixed fixture using `origin: 'explicit-sdk-caller'`. An embedding application must supply its own human review and authorization boundary; this script is not an interactive approval UI.

```sh
node dev/terminal-demo/record.mjs
```

Each run creates a new ignored `work/terminal-demo/record-*` directory containing a disposable consumer Git repository, private worker state and `public-replay.json`. It uses real contract comparison, source inspection, approval receipts and isolated test execution. Only the GitHub transport is simulated in memory: no remote commit, branch or PR is created.

On success the command exits **0** and prints one JSON summary. This is an illustrative shape; paths vary by run:

```json
{
  "directory": "/path/to/self-managed-api/work/terminal-demo/record-XXXXXX",
  "tests": 25,
  "validation": "improved",
  "publication": "simulation",
  "record": "/path/to/self-managed-api/work/terminal-demo/record-XXXXXX/public-replay.json"
}
```

The original consumer fails the new API's selected tests. The candidate passes those same tests, including exact decimal conversion, caller currency, HTTP failures and invalid responses. The recorder checks that only `payments.mjs` is proposed for change and the consumer Git checkout remains clean. The 25-test count is the Node TAP total, including the parent test.

An assertion failure or execution error exits nonzero. A partial run directory can remain for diagnosis; a missing replay is not a successful recording. A printed `publication: "simulation"` does not mean that anything was published on GitHub.

## Inspect the replay

Open the `record` path printed by the command. Check these fields together:

| Field | Expected evidence |
| --- | --- |
| `provider`, `source`, `recipe` | `fictional-payments`, `local-contract-snapshots`, `explicit-reviewed-recipe` |
| `changes` | Breaking changes reported by oasdiff for the included contracts. |
| `files` | The before/after source of `payments.mjs`; inspect currency forwarding, version selection and exact minor-unit conversion. |
| `validation` | `status: "improved"`, `baseline: "failed"`, `candidate: "passed"`, `tests: 25`, `failed: 0`, `testsUnchanged: true`. |
| `publicationMode`, `publication` | Simulation mode, a draft PR result, and simulated `commit`, `branch`, `draft-pr` writes. |
| `consumerModified` | `false`; changes were validated in separate captured copies. |

Passing this fixture demonstrates its selected assertions, not compatibility with an arbitrary payment provider. No real customer statistics are included. Review the replay's source snippets before sharing it, especially if you adapt the fixture. Keep the worker state, approval receipts and consumer directory private; share only the reviewed replay.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Linux host assertion or blocked validation | Run on Linux x64 with the supported local daemon. A Windows or macOS Node process is not the isolated runner host. |
| Engine missing or invalid | Run `pnpm engine:setup` in this Linux checkout; a Windows `oasdiff.exe` is not the Linux executable. |
| Docker daemon unavailable | Check `/usr/bin/docker` and the fixed socket with the `info` command above. A remote Docker context does not satisfy this profile. |
| Pinned image unavailable | Pull the exact digest above into that same local daemon. |
| Missing isolation or resource controls | Inspect Docker's reported capabilities and provision a compatible host; the runner intentionally blocks when its profile cannot be enforced. |
| State permission errors | Use a native Linux filesystem and current-user-owned checkout with working POSIX permissions. |

For the full CLI approval flow, SDK contracts and operational procedures, see the Spanish [technical guide](../../docs/technical-guide.pdf) and its [HTML source](../../docs/technical-guide.html).
