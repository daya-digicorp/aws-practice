import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

/**
 * Pulls JSON from Secrets Manager into process.env.
 * On EC2 this uses the instance role (no access keys in a file).
 * Locally, skip by leaving SECRET_NAME unset and keep using .env.
 */
export async function loadSecrets() {
  const secretId = process.env.SECRET_NAME || process.env.AWS_SECRET_NAME;
  if (!secretId) {
    console.log("SECRET_NAME not set; using .env / environment variables");
    return;
  }

  const region = process.env.AWS_REGION || "us-east-1";
  const client = new SecretsManagerClient({ region });
  const result = await client.send(new GetSecretValueCommand({ SecretId: secretId }));

  if (!result.SecretString) {
    throw new Error(`Secret "${secretId}" has no string value`);
  }

  const parsed = JSON.parse(result.SecretString);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Secret "${secretId}" must be a JSON object`);
  }

  for (const [key, value] of Object.entries(parsed)) {
    if (value == null) continue;
    process.env[key] = String(value);
  }

  console.log(`Loaded config from Secrets Manager (${secretId})`);
}
