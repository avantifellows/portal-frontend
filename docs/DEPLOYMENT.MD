# DEPLOYMENT
This document covers steps on setting up this repository on various cloud hosting providers.

## AWS
### Staging
1. Login to your aws console.
2. Create a S3 bucket and uncheck `Block all public access`.
3. Enable static website hosting and note down the bucket endpoint. We'll use it to set up a Cloudfront distribution later.
4. In Cloudfront, create a distribution with the S3 origin, created in the step above.
5. If you choose to set up a SSL, do so at this step.
6. Use a DNS provider of your choice. Give an appropriate CNAME and enter the target address. This would be the address of the newly created Cloudfront distribution.
7. The actual deployment happens through Github Actions. Look at `.github/workflows/deploy_to_s3_staging.yml` for understanding the deployment to Staging and `.github/workflows/deploy_to_s3_prod.yml` for Production. Make sure to set all the environment variables mentioned in `docs/ENV.md` in the Production and Staging environments in your Github repository.

### Production
Setting up a production environment on AWS is the same as setting up a staging environment.

**Make sure to setup `.env.staging` for staging environment and `.env.production` for production environment.**

## Docker
### Building the Docker Image
1. Ensure you have Docker installed on your machine.
2. Navigate to the root of the repository.
3. Build the Docker image using the following command:
    ```sh
    docker build -t portal-frontend .
    ```

### Running the Docker Container
1. Run the Docker container using the following command:
    ```sh
    docker run -p 80:80 --env-file .env portal-frontend
    ```

The application should now be accessible at http://localhost.
