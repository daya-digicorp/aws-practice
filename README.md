# React + Node Todo App (AWS DynamoDB)

A small todo app with a React frontend, an Express API, and **Amazon DynamoDB** for storage.

## Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** AWS DynamoDB (`id` partition key, on-demand billing)

## Prerequisites

- Node.js 18+
- An AWS account
- AWS credentials (`aws configure`, or `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`)

IAM needs at least:

- `dynamodb:DescribeTable`
- `dynamodb:CreateTable` (only if the table does not exist yet)
- `dynamodb:Scan`
- `dynamodb:GetItem`
- `dynamodb:PutItem`
- `dynamodb:UpdateItem`
- `dynamodb:DeleteItem`

## Setup

1. Copy env config (already created as `server/.env`):

```
PORT=4000
AWS_REGION=us-east-1
DYNAMODB_TABLE=Todos
```

2. Set credentials. Either:

```bash
aws configure
```

or uncomment and fill in `server/.env`:

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

3. Set `AWS_REGION` to the region where you want the table (for example `ap-south-1`).

The server creates the `Todos` table on first start if it does not exist (partition key `id`, String, on-demand).

## Run

```bash
npm run install:all
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API listens on [http://localhost:4000](http://localhost:4000).

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/todos` | List todos |
| `POST` | `/api/todos` | Create todo `{ "title": "Buy milk" }` |
| `PUT` | `/api/todos/:id` | Update `{ "title"?, "completed"? }` |
| `DELETE` | `/api/todos/:id` | Delete todo |
| `GET` | `/api/health` | Health check |

## Project layout

```
client/     React UI (proxies /api to the Node server)
server/     Express API + AWS DynamoDB
```
# aws-practice
