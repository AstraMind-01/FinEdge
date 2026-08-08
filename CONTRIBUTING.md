# Contributing to FinEdge

Welcome to the FinEdge project! To ensure smooth collaboration among the team, please follow these rules when contributing.

## Contribution Rules

1. **Never push directly to main.** The `main` branch is protected and represents the stable state of the project.
2. **Create a feature branch.** For any new work, create a branch from `main` named according to the feature you are working on (e.g., `feature/transaction-service`).
3. **Make small meaningful commits.** Do not bundle unrelated changes together. Commit often and logically.
4. **Push the branch.** Push your feature branch to the remote repository.
5. **Open a Pull Request.** Create a PR on GitHub targeting the `main` branch.
6. **Explain what was changed.** Use the Pull Request template to describe the changes, why they were made, and how they work.
7. **Add testing information.** Clearly state what manual or automated tests were run to verify the change.
8. **At least one other team member reviews the PR.** You must get an approval from another team member before merging.
9. **Merge only after review.** Once approved and all checks pass, you may squash and merge or rebase and merge your PR.
10. **Never commit secrets.** Always use environment variables for passwords, keys, and tokens. Verify `.gitignore` before committing.

## Commit Message Guidelines

We use conventional commit messages. Please prefix your commits with one of the following:

- `feat:` for new features (e.g., `feat: add transaction transfer API`)
- `fix:` for bug fixes (e.g., `fix: correct account ownership validation`)
- `test:` for adding or modifying tests (e.g., `test: add transaction service tests`)
- `docs:` for documentation updates (e.g., `docs: update architecture documentation`)
- `refactor:` for code changes that neither fix a bug nor add a feature
- `chore:` for routine tasks like updating dependencies or configuration

Happy coding!
