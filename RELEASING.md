# Releasing

Soy Themes is published to the
[Visual Studio Marketplace](https://marketplace.visualstudio.com/), which is
what VS Code uses, under the publisher `tsangkenneth`. Releases are uploaded
through the Marketplace website. Each release is also attached to a GitHub
release, so it can be installed by hand in other editors.

## Each release

1. In `CHANGELOG.md`, rename `## Unreleased` to the new version and date, e.g.
   `## 0.1.0 (2026-10-01)`. Don't leave an empty `## Unreleased` heading behind;
   the next change after the release adds it back above the latest version.
2. Set `version` in `package.json` to the same version.
3. Run `deno task build` and `deno task check`.
4. Commit, then tag and push:

   ```sh
   git tag v0.1.0
   git push origin main v0.1.0
   ```

5. The release workflow checks that the tag, `package.json` and `CHANGELOG.md`
   agree, runs the checks, and packages the extension. It then creates a GitHub
   release with the `.vsix` and the changelog section as notes.
6. Download the `.vsix` from the GitHub release and upload it to the
   [Marketplace publisher page](https://marketplace.visualstudio.com/manage):
   - First release: **New extension → Visual Studio Code**, then choose the
     file.
   - Later releases: open the **⋯** menu next to the extension, choose
     **Update**, then choose the file.

   The Marketplace scans the upload before it goes live, which usually takes a
   few minutes.

To check a package before releasing, `deno task package` writes
`vscode-theme-soy-<version>.vsix` locally, and **Extensions: Install from
VSIX...** installs it in VS Code. A locally built package can also be uploaded
to the Marketplace directly; commit first so it matches the repository.

## Future options

### Publishing to Open VSX

[Open VSX](https://open-vsx.org/) is a separate registry, run by the Eclipse
Foundation, that VSCodium, Cursor, Gitpod and other editors based on VS Code use
instead of the Marketplace. Publishing there makes the theme show up in those
editors' extension search. The release workflow already publishes to Open VSX
whenever the `OVSX_PAT` secret is set, so enabling it is a one-time setup:

1. Create an [Eclipse account](https://accounts.eclipse.org/user/register), and
   enter your GitHub username in its profile. Open VSX requires a signed Eclipse
   Foundation publisher agreement, and the account is how you sign it.
2. Sign in to [open-vsx.org](https://open-vsx.org/) with GitHub. In **Settings →
   Profile**, log in with your Eclipse account and sign the publisher agreement.
3. In **Settings → Access Tokens**, generate a token. It is only shown once.
4. Create the namespace, matching the Marketplace publisher ID:

   ```sh
   deno run -A npm:ovsx@1 create-namespace tsangkenneth -p <token>
   ```

5. In the GitHub repository, go to **Settings → Secrets and variables →
   Actions** and add a repository secret named `OVSX_PAT` with the token.
6. Add an Open VSX link to the Installation section of `README.md`:
   `https://open-vsx.org/extension/tsangkenneth/vscode-theme-soy`.

The next tagged release then publishes to Open VSX automatically. To publish an
existing release, run `deno run -A npm:ovsx@1 publish <file>.vsix -p <token>`.
Optionally,
[claim ownership of the namespace](https://github.com/eclipse/openvsx/wiki/Namespace-Access)
so the extension shows as verified.

### Automating Marketplace publishing

The usual way to publish with `vsce publish` is an Azure DevOps personal access
token for all organizations. Azure DevOps retires those global tokens on
December 1, 2026. Their replacement is Microsoft Entra ID with workload identity
federation (`vsce publish --azure-credential`). That needs an Azure subscription
and a user-assigned managed identity added as a member of the publisher, and the
[VS Code publishing guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
documents it for Azure Pipelines. Uploading through the website needs none of
this, so it is the simplest option for occasional releases.
