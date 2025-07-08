// Make sure to install @aws-sdk/client-dynamodb and @aws-sdk/lib-dynamodb in your function's package.json
import type { S3Event, Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_NAME = process.env.DOCUMENT_TABLE_NAME || "Document"; // Update if your table name is different

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler: Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const s3Key = record.s3.object.key;
    const uploadedAt = new Date().toISOString();
    const id = s3Key; // Use s3Key as id, or generate a UUID if preferred

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          id,
          s3Key,
          uploadedAt,
        },
      })
    );
  }
  return { status: "done ok" };
};
