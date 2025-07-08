import { defineBackend } from "@aws-amplify/backend";
import { Policy, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage, onUploadHandler } from "./storage/resource";

const backend = defineBackend({
  auth,
  data,
  storage,
  onUploadHandler,
});

// Grant DynamoDB permissions to the upload handler Lambda
backend.onUploadHandler.resources.lambda.addToRolePolicy(
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
      backend.data.resources.tables["Document"].tableArn,
      `${backend.data.resources.tables["Document"].tableArn}/index/*`,
    ],
  })
);

// Set environment variables for the Lambda function
backend.onUploadHandler.addEnvironment(
  "DOCUMENT_TABLE_NAME",
  backend.data.resources.tables["Document"].tableName
);

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
