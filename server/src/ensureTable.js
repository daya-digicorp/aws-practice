import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";
import { dynamoClient, TABLE_NAME } from "./db.js";

/**
 * Creates the Todos table in AWS if it does not already exist.
 * Needs dynamodb:DescribeTable and dynamodb:CreateTable. PAY_PER_REQUEST
 * avoids having to pick provisioned read/write capacity.
 */
export async function ensureTable() {
  try {
    await dynamoClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return;
  } catch (err) {
    if (!(err instanceof ResourceNotFoundException) && err.name !== "ResourceNotFoundException") {
      throw err;
    }
  }

  await dynamoClient.send(
    new CreateTableCommand({
      TableName: TABLE_NAME,
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    })
  );

  await waitUntilTableExists(
    { client: dynamoClient, maxWaitTime: 30 },
    { TableName: TABLE_NAME }
  );

  console.log(`Created DynamoDB table "${TABLE_NAME}"`);
}
