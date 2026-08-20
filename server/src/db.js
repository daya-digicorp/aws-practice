import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let dynamoClient;
let docClient;

function getRegion() {
  return process.env.AWS_REGION || "us-east-1";
}

export function getTableName() {
  return process.env.DYNAMODB_TABLE || "todo";
}

/**
 * Created after Secrets Manager runs so region/credentials from the secret apply.
 * On EC2, credentials come from the instance role, not from keys in .env.
 */
export function getDynamoClient() {
  if (!dynamoClient) {
    dynamoClient = new DynamoDBClient({ region: getRegion() });
  }
  return dynamoClient;
}

export function getDocClient() {
  if (!docClient) {
    docClient = DynamoDBDocumentClient.from(getDynamoClient(), {
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return docClient;
}
