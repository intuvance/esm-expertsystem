:sparkles:

# ESM A.I Expert System

![Logo](https://github.com/user-attachments/assets/c5e1409d-8fb8-4016-9ef6-855172c8e2d1)

This is a [monorepo](https://yarnpkg.com/advanced/lexicon#monorepo) containing the packages that use Artificial Intelligence ( A.I ) to mimic the judgment and problem-solving abilities of a human expert in the use of digital tools, and electronic platforms to enhance healthcare delivery, improve patient care, and ultimately improve health outcomes.

## Available Packages

### Application

### Frontend modules

A set of frontend modules provide the Artificial Intelligence ( A.I ) functionality of the application.

- [@intuvance/esm-expertsystem](packages/apps/esm-llm-tools-app)

## Development

### Getting Started

To set up the repository for development, run the following commands:

```sh
yarn
yarn setup
```

> **Note:** If `yarn setup` fails or causes system resource issues, use this alternative instead:
>
> ```sh
> yarn build --concurrency 1
> ```
>
> Both commands build all the packages - once either completes successfully, you can proceed to [running the app shell and the framework](#running-the-app-shell-and-the-framework).

### Building

To build all packages in the repository, run the following command:

```sh
yarn build
```

Verification of the existing packages can also be done in one step using `yarn`:

```sh
yarn verify
```

### Running the frontend modules in `apps`

```sh
yarn run:omrs develop --sources packages/apps/<app folder>

yarn run:omrs develop --sources packages/apps/esm-llm-tools-app
```

### Running tests

#### Unit tests

To run tests for all packages, run:

```bash
yarn turbo run test
```

To run tests in `watch` mode, run:

```bash
yarn turbo run test:watch
```

#### E2E tests

To run E2E tests locally, follow these steps:

##### Start the Development Server

Begin by spinning up a development server for the frontend module that you want to test. Ensure the server is running before proceeding.

##### Set Up Environment Variables

Copy the example environment variables into a new .env file by running the following command:

```bash
cp example.env .env
```

##### Execute Tests

Run the tests with the following command:

```bash
yarn test-e2e --ui --headed
```

### Version and release

We use Yarn [workspaces](https://yarnpkg.com/features/workspaces) to handle versioning in this monorepo.

To increment the version, run the following command:

```sh
yarn release [version]
```

Where version corresponds to:

- `patch` for bug fixes e.g. `3.2.0` → `3.2.1`
- `minor` for new features that are backwards-compatible e.g `3.2.0` → `3.3.0`
- `major` for breaking changes e.g. `3.2.0` → `4.0.0`

Note that this command will not create a new tag, nor publish the packages. After running it, make a PR or merge to `main` with the resulting changeset. Note that the release commit message must resemble `(chore) Release vx.x.x` where `x.x.x` is the new version number prefixed with `v`.

This is because we don't want to trigger a pre-release build when effecting a version bump.

Once the version bump commit is merged, go to GitHub and [draft a new release](https://github.com/intuvance/esm-expertsystem/releases/new).

The tag should be prefixed with `v` (e.g., `v3.2.1`), while the release title should just be the version number (e.g., `3.2.1`). The creation of the GitHub release will cause GitHub Actions to publish the packages, completing the release process.

> Don't run `npm publish`, `yarn publish`, or `lerna publish`. Use the above process.

### Important Notes About Version Updates

When releasing a new major version (e.g., moving from v6 to v7), you must:

1. Update all peerDependencies that reference `@openmrs/` packages in every package that depends on them
2. Change the version notation from the current major version to the new one (e.g., from `6.x` to `7.x`)

This ensures that all packages use compatible versions and breaking changes are properly tracked.

## Design Patterns

For documentation about our design patterns, please visit our [design system documentation website](https://om.rs/o3ui).

## Bumping Playwright

Be sure to update the Playwright version in the [Bamboo Playwright Docker image](e2e/support/bamboo/playwright.Dockerfile) whenever making version changes.
Also, ensure you specify fixed (pinned) versions of Playwright in the package.json file to maintain consistency between the Playwright version used in the Docker image for Bamboo test execution and the version used in the codebase.
