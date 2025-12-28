# OAuth Scopes Guide for IssueMatch

This guide explains which GitHub OAuth scopes IssueMatch requests, why they are needed, and how to minimize access to protect user privacy.

## Default behavior

- By default IssueMatch requests `read:user` (basic profile) and `repo:status` (commit status access). These allow the app to read your public profile and access commit statuses without requesting access to repository code.

## Common scopes explained

- `read:user` (recommended, required): Read basic profile information (username, avatar, bio). No repo access.
- `user:email` (optional): Read your verified email addresses. Useful to show a contact email.
- `repo:status` (optional): Read/write commit statuses. Does NOT grant access to repository code. Use this if you want status-related features without granting code access.
- `public_repo` (optional): Access to public repositories only (read and write). Does not include private repositories.
- `repo` (optional, powerful): Full control of private repositories (read/write). This includes code access and is only necessary if you explicitly want IssueMatch to read your private repositories.
- `read:org` (optional): Read organization and team membership.

## Recommendations

- If you only want IssueMatch to analyze your public activity (public repos, READMEs, languages), you can avoid `repo` and either sign in without extra repo scopes or choose `public_repo` (if you need public repo write features).
- If you want analysis that includes private repositories, you must consent to `repo`. Note: `repo` grants broad access, so only opt-in if you trust the app.
- `repo:status` is a useful middle-ground when you need commit-status functionality but not code access.

## How IssueMatch respects privacy

- The login page allows you to select which scopes to grant before redirecting to GitHub. The backend validates requested scopes against an allow-list.
- The profile page shows which scopes were requested and which were granted by GitHub.

## Future work

- Add UI to revoke scopes or unlink GitHub from the app (requires GitHub settings or a token revocation flow).
- Allow users to add/remove specific repository access via GitHub Apps (granular permissions) in the future.

If you have specific concerns about a scope or want help deciding which scopes to grant for a particular feature, please open an issue with the use case and we can advise.
