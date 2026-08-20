import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";
import { getDynamoClient, getTableName } from "./db.js";

/**
 * Creates the todo table in AWS if it does not already exist.
 * PAY_PER_REQUEST avoids having to pick provisioned read/write capacity.
 */
export async function ensureTable() {
  const tableName = getTableName();
  const dynamoClient = getDynamoClient();

  try {
    await dynamoClient.send(new DescribeTableCommand({ TableName: tableName }));
    return;
  } catch (err) {
    if (!(err instanceof ResourceNotFoundException) && err.name !== "ResourceNotFoundException") {
      throw err;
    }
  }

  await dynamoClient.send(
    new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    })
  );

  await waitUntilTableExists(
    { client: dynamoClient, maxWaitTime: 30 },
    { TableName: tableName }
  );

  console.log(`Created DynamoDB table "${tableName}"`);
}
