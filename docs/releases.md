# Releases and updates

[Back to the project overview](../README.md). Commands run from the repository root unless stated otherwise.

## Releases and updates

Source releases identify a Git tag. Check out the chosen tag and follow [Quick start](../README.md#quick-start) to install dependencies and build the CLI; source archives do not include a Node runtime, `dist`, the comparison engine or Docker images. The package is not distributed through npm.

Run `pnpm release:build` manually to produce a platform archive with its own CLI runtime. Extract the complete directory. Publishing the resulting files is a separate manual action.

Optional native signing and public TUF signing use operator-provisioned keys and retain explicit signature status. Checksums alone do not establish publisher identity. The updater stages a verified package; installation remains separate. No official hosted update feed or trust identity is bundled.

See the [technical guide](../docs/technical-guide.html) for release inputs, platform requirements, service operation and trust bootstrap.
