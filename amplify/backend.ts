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
