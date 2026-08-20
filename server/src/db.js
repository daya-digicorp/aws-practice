import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || "us-east-1";

/**
 * Uses the default AWS credential chain:
 * env vars, then ~/.aws/credentials (aws configure), then IAM roles.
 */
const client = new DynamoDBClient({ region });

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export { client as dynamoClient };
export const TABLE_NAME = process.env.DYNAMODB_TABLE || "Todos";
