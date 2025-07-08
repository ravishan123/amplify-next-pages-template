import { defineBackend } from "@aws-amplify/backend";
import { Policy, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";

const backend = defineBackend({
  auth,
  data,
  storage,
});

// Create S3 policy for authenticated users
const s3Policy = new Policy(
  backend.storage.resources.bucket.stack,
  "S3AccessPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:GetObject",
          "s3:GetObjectAcl",
          "s3:DeleteObject",
          "s3:ListBucket",
        ],
        resources: [
          backend.storage.resources.bucket.bucketArn,
          `${backend.storage.resources.bucket.bucketArn}/*`,
        ],
      }),
    ],
  }
);

// Attach policy to authenticated user role
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(s3Policy);

// Create read-only policy for unauthenticated users
const s3ReadPolicy = new Policy(
  backend.storage.resources.bucket.stack,
  "S3ReadPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:GetObject", "s3:ListBucket"],
        resources: [
          backend.storage.resources.bucket.bucketArn,
          `${backend.storage.resources.bucket.bucketArn}/*`,
        ],
      }),
    ],
  }
);

// Attach read policy to unauthenticated user role
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
  s3ReadPolicy
);

// Add DynamoDB permissions to the Lambda function
const dynamoDbPolicy = new Policy(
  backend.storage.resources.bucket.stack,
  "DynamoDBAccessPolicy",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
        ],
        resources: [
          // Replace with your actual DynamoDB table ARN
          // You can get this from the AWS Console or construct it as shown below
          `arn:aws:dynamodb:${backend.stack.region}:${backend.stack.account}:table/Document`,
          `arn:aws:dynamodb:${backend.stack.region}:${backend.stack.account}:table/Document/index/*`,
        ],
      }),
    ],
  }
);

// Attach DynamoDB policy to the Lambda function's execution role
// You'll need to get the Lambda function from your storage configuration
const onUploadHandler = backend.storage.resources.triggers?.onUpload;
if (onUploadHandler) {
  onUploadHandler.role?.attachInlinePolicy(dynamoDbPolicy);
}
