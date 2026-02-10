# Releasing fare (Automatic)

## One-time setup
- Enable GitHub Actions in the repo
- Update `.changeset/config.json` repo field: `<your-org>/<your-repo>`
- (Optional) add `NPM_TOKEN` secret for npm publishing

## Normal flow
1) Make changes
2) Add changeset:
```bash
npm run changeset
```
3) Commit (Conventional Commits enforced by commitlint)
4) Push / merge to `main`

The Release workflow will open/update a version PR. Merge it to release.
