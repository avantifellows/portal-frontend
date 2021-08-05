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
7. Add the following lines to the `scripts` object in `package.json`.
    - ```"deploy-staging": "vue-cli-service build --mode staging && aws --profile $YOUR_AWS_PROFILE --region $YOUR_AWS_REGION s3 sync ./dist $S3_STAGING_BUCKET_NAME --delete --acl public-read",
    "deploy": "vue-cli-service build && aws --profile $YOUR_AWS_PROFILE --region $YOUR_AWS_REGION s3 sync ./dist $S3_PROD_BUCKET_NAME --delete --acl public-read" ```

8. To deploy your code on to staging, use `npm run deploy-staging/yarn deploy-staging`.

# Production
Setting up a production environment on AWS is same as staging.
