# DEPLOYMENT
This document covers steps on setting up this repository on various cloud hosting providers.

# AWS

# Staging
1. Login to your aws console.
2. Create a S3 bucket and uncheck `Block all plublic access`.
3. Enable static website hosting and note down the bucket endpoint. We'll use it to set up a Cloudfront distribution later.
4. In Cloudfront, create a distribution with the S3 origin, created in the step above.
5. If you choose to set up a SSL, do so at this step.
6. Use a DNS provider of your choice. Give an appropriate CNAME and enter the target address. This would be the address of the newly created Cloudfront distribution.
7. Next, go to your GitHub repository and create a new environment from settings tab.
        i. Name the environment as Staging.
        ii. Make sure you have added the following GitHub secrets on repository level. If not, add these as your environment secrets.
                AWS_ACCESS_KEY_ID
                AWS_SECRET_ACCESS_KEY
                AWS_REGION
        iii. Additionally, refer to .env.example file to set all the other required environment variables for your project.
8. To deploy your code on to staging, use `npm deploy-staging/yarn deploy-staging`.

# Production
Setting up a production environment on AWS is same as staging.
