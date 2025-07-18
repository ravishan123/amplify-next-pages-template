// on-upload-handler.ts
import type { S3Event } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "ap-southeast-1";
const TABLE_NAME = process.env.DOCUMENT_TABLE_NAME || "Document";

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event: S3Event) => {
  console.log("S3 event:", JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records) {
      const s3Key = record.s3.object.key;
      const uploadedAt = new Date().toISOString();
      const id = s3Key;

      console.log(`Processing file: ${s3Key}`);
      console.log(`Table name: ${TABLE_NAME}`);

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

      console.log(`Successfully processed: ${s3Key}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success" }),
    };
  } catch (error) {
    console.error("Error processing S3 event:", error);
    throw error;
  }
};
