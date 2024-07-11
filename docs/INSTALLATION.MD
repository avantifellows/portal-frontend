# Installation

## Pre-requisites

### git-secrets
git-secrets scans commits, commit messages, and --no-ff merges to prevent adding secrets into your git repositories.
For installing, follow steps at https://github.com/awslabs/git-secrets#installing-git-secrets.
```sh
cd portal-frontend
git secrets --install
git secrets --register-aws
```

## Installation steps
Follow the steps below to set up the repo for development.
1. Clone the repository and change the working directory
    ```sh
    git clone https://github.com/avantifellows/portal-frontend.git
    cd portal-frontend
    ```

2. Set up your `.env` file by copying `.env.example` file
    ```sh
    cp .env.example .env
    ```

    For deployment these variables are stored in the Github repo environments (Settings -> Environments).

3. Update environment variables in your `.env` file based on your environment. For all available settings, see our [Environment variables guide](./ENV.MD). You might have to get these values for `.env` from your colleagues.

4. Install dependencies
```sh
npm install
```

5. Run the app
```
npm run dev
```

6. Your frontend app should be accessible at http://localhost:8080.
