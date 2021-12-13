# Installation

## Pre-requisites
### git-secrets
git-secrets scans commits, commit messages, and --no-ff merges to prevent adding secrets into your git repositories.
For installing, follow steps at https://github.com/awslabs/git-secrets#installing-git-secrets.

## Installation steps
Follow the steps below to set up the repo for development.
1. Clone the repository and change the working directory
    ```sh
    git clone https://github.com/avantifellows/auth-layer.git
    cd auth-layer
    ```

2. Set up your `.env` file by copying `.env.example` file
    ```sh
    cp .env.example .env
    ```

3. Update environment variables in your `.env` file based on your environment. For all available settings, see our [Environment variables guide](ENV.md).

4. You MUST install the git hooks for every repo that you wish to use with ``git secrets --install``.

Here's a quick example of how to ensure a git repository is scanned for secrets
on each commit:

    ```sh
    cd /path/to/my/repo
    git secrets --install
    git secrets --register-aws
    ```

5. Run your app with `npm run serve`.

6. Your frontend app should be accessible at http://localhost:8080.
