const config = {

    MAX_ATTACHMENT_SIZE: 5000000,

    s3: {
        REGION: "us-east-1", // Ensure the region is correct for your S3 bucket
        BUCKET: "note-app-uploads-ipsita", // Ensure this matches your S3 bucket name
    },
    apiGateway: {
        REGION: "us-east-1", // Ensure the region matches your API Gateway region
        URL: "https://vf3mdgeshi.execute-api.us-east-1.amazonaws.com/prod", // Ensure this is the correct API Gateway endpoint URL
    },
    cognito: {
        REGION: "us-east-1", // Ensure the region matches your Cognito setup
        USER_POOL_ID: "us-east-1_WLQhHgqRT", // Ensure this is your actual User Pool ID
        APP_CLIENT_ID: "4uq3393fp1ii37h4u4q00q6r0h", // Ensure this is your actual App Client ID
        IDENTITY_POOL_ID: "us-east-1:31965c20-55b5-48c2-b105-efcc75cebfc2", // Ensure this is your actual Identity Pool ID
    },
};

export default config;
