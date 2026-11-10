# SDK installation

[Back to the project overview](../README.md). Run checkout commands from the repository root.

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

See the [guide](../docs/technical-guide.html) for SDK examples, runtime preparation and application-owned approval handling. Checkout installations and CLI release builds use this repository's committed policy and lockfile.
