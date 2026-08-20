import "dotenv/config";
import { DynamoDBClient, DescribeTableCommand, ListTablesCommand } from "@aws-sdk/client-dynamodb";

const name = process.env.DYNAMODB_TABLE || "todo";
const regions = [process.env.AWS_REGION || "us-east-1", "ap-south-1", "us-east-1"];
const uniqueRegions = [...new Set(regions)];

for (const region of uniqueRegions) {
  const client = new DynamoDBClient({ region });
  const listed = await client.send(new ListTablesCommand({}));
  console.log(`[${region}] tables: ${listed.TableNames.join(", ") || "(none)"}`);
  try {
    const d = await client.send(new DescribeTableCommand({ TableName: name }));
    console.log(`[${region}] ${name} status=${d.Table.TableStatus} key=${d.Table.KeySchema.map((k) => k.AttributeName).join(",")}`);
  } catch (err) {
    console.log(`[${region}] ${name}: ${err.name}`);
  }
}
