# Infrastructure Guidelines

Best practices for AWS services, serverless architecture, and infrastructure management.

## Table of Contents

- [Serverless Architecture](#serverless-architecture)
- [AWS Lambda](#aws-lambda)
- [API Gateway](#api-gateway)
- [DynamoDB](#dynamodb)
- [S3](#s3)
- [SES (Email)](#ses-email)
- [SQS (Queues)](#sqs-queues)
- [WebSocket](#websocket)
- [Environment Management](#environment-management)
- [Monitoring and Logging](#monitoring-and-logging)
- [Cost Optimization](#cost-optimization)

## Serverless Architecture

### Principles

**Stateless functions:**

```typescript
// ✅ Good - Stateless
export const handler = async (event: APIGatewayProxyEvent) => {
  const userId = event.pathParameters?.id;
  const user = await userService.getUser(userId);
  return successResponse(user);
};

// ❌ Bad - Stateful
let requestCount = 0; // Don't use module-level state
export const handler = async (event: APIGatewayProxyEvent) => {
  requestCount++; // This won't work reliably
};
```

**Cold start optimization:**

```typescript
// ✅ Good - Initialize outside handler
const dynamoClient = new DynamoDBClient({ region: process.env['AWS_REGION'] });
const clerkClient = createClerkClient({
  secretKey: process.env['CLERK_SECRET_KEY']!,
});

export const handler = async (event: APIGatewayProxyEvent) => {
  // Use pre-initialized clients
  const result = await dynamoClient.send(command);
};

// ❌ Bad - Initialize inside handler
export const handler = async (event: APIGatewayProxyEvent) => {
  const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
  // Slower cold starts
};
```

### Function Configuration

**Serverless.yml best practices:**

```yaml
functions:
  listUsers:
    handler: src/modules/users/handlers/listUsers.handler
    # Memory allocation (128-10240 MB)
    memorySize: 512 # Adjust based on needs
    # Timeout (max 900s for API Gateway)
    timeout: 30
    # Environment variables
    environment:
      TABLE_NAME: ${self:custom.tableName}
    # IAM permissions
    iamRoleStatements:
      - Effect: Allow
        Action:
          - dynamodb:Query
          - dynamodb:Scan
        Resource: !GetAtt UsersTable.Arn
    # API Gateway events
    events:
      - http:
          path: /api/admin/users
          method: get
          cors: true
          authorizer:
            type: request
            functionName: clerkAuthorizer
```

## AWS Lambda

### Best Practices

**Memory and timeout:**

```yaml
# ✅ Good - Appropriate settings
functions:
  quickOperation:
    memorySize: 256
    timeout: 10

  heavyOperation:
    memorySize: 1024
    timeout: 60

  backgroundJob:
    memorySize: 512
    timeout: 300

# ❌ Bad - One size fits all
functions:
  allFunctions:
    memorySize: 3008  # Expensive!
    timeout: 900      # Too long for most operations
```

**Error handling:**

```typescript
// ✅ Good - Proper error handling
export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const result = await processRequest(event);
    return successResponse(result);
  } catch (error) {
    console.error('[Handler] Error:', error);

    // Return proper error response
    if (error instanceof ValidationError) {
      return commonErrors.badRequest(error.message);
    }

    return handleAsyncError(error);
  }
};

// ❌ Bad - Unhandled errors
export const handler = async (event: APIGatewayProxyEvent) => {
  const result = await processRequest(event); // Can throw
  return successResponse(result);
};
```

**Logging:**

```typescript
// ✅ Good - Structured logging
import { logger } from '@shared/logger';

export const handler = async (event: APIGatewayProxyEvent) => {
  logger.info('Processing request', {
    path: event.path,
    method: event.httpMethod,
    requestId: event.requestContext.requestId,
  });

  try {
    const result = await processRequest(event);
    logger.info('Request completed', { result });
    return successResponse(result);
  } catch (error) {
    logger.error('Request failed', { error });
    return handleAsyncError(error);
  }
};

// ❌ Bad - console.log everywhere
export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('Got event:', event); // Too verbose
  console.log('Processing...'); // Not useful
  const result = await processRequest(event);
  console.log('Done'); // Not useful
  return successResponse(result);
};
```

### Lambda Layers

**When to use layers:**

- Shared dependencies across functions
- Large dependencies (reduce deployment size)
- Common utilities

**Layer structure:**

```
layers/
├── common/
│   └── nodejs/
│       └── node_modules/
│           ├── aws-sdk/
│           └── lodash/
└── utils/
    └── nodejs/
        └── utils/
            ├── logger.ts
            └── response.ts
```

## API Gateway

### REST API Configuration

**CORS setup:**

```yaml
functions:
  listUsers:
    events:
      - http:
          path: /api/users
          method: get
          cors:
            origin: '*'
            headers:
              - Content-Type
              - Authorization
            allowCredentials: false
```

**Request validation:**

```yaml
functions:
  createUser:
    events:
      - http:
          path: /api/users
          method: post
          cors: true
          request:
            schemas:
              application/json: ${file(schemas/create-user.json)}
```

**Rate limiting:**

```yaml
provider:
  apiGateway:
    usagePlan:
      quota:
        limit: 10000
        period: DAY
      throttle:
        burstLimit: 200
        rateLimit: 100
```

### Custom Domain

**Configuration:**

```yaml
custom:
  customDomain:
    domainName: api.example.com
    stage: ${self:provider.stage}
    basePath: ''
    certificateName: '*.example.com'
    createRoute53Record: false
    endpointType: 'regional'
```

## DynamoDB

### Table Design

**Single table design:**

```typescript
// ✅ Good - Single table with composite keys
interface TableItem {
  PK: string;      // Partition key: USER#123, ORG#456
  SK: string;      // Sort key: PROFILE, ORDER#789
  GSI1PK?: string; // Global secondary index
  GSI1SK?: string;
  // ... other attributes
}

// User profile
{
  PK: 'USER#123',
  SK: 'PROFILE',
  email: 'user@example.com',
  name: 'John Doe'
}

// User order
{
  PK: 'USER#123',
  SK: 'ORDER#789',
  total: 99.99,
  status: 'completed'
}

// ❌ Bad - Multiple tables
// UsersTable, OrdersTable, ProfilesTable, etc.
```

### Query Patterns

**Efficient queries:**

```typescript
// ✅ Good - Query with partition key
const result = await dynamoClient.send(
  new QueryCommand({
    TableName: 'MainTable',
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: `USER#${userId}` },
    },
  })
);

// ✅ Good - Query with partition and sort key
const result = await dynamoClient.send(
  new QueryCommand({
    TableName: 'MainTable',
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': { S: `USER#${userId}` },
      ':sk': { S: 'ORDER#' },
    },
  })
);

// ❌ Bad - Scan entire table
const result = await dynamoClient.send(
  new ScanCommand({
    TableName: 'MainTable',
    FilterExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': { S: email },
    },
  })
);
```

### Conditional Writes

**Prevent overwrites:**

```typescript
// ✅ Good - Conditional put
try {
  await dynamoClient.send(
    new PutCommand({
      TableName: 'MainTable',
      Item: {
        PK: `USER#${userId}`,
        SK: 'PROFILE',
        email: email,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    })
  );
} catch (error) {
  if (error.name === 'ConditionalCheckFailedException') {
    throw new ConflictError('User already exists');
  }
  throw error;
}

// ❌ Bad - Unconditional put
await dynamoClient.send(
  new PutCommand({
    TableName: 'MainTable',
    Item: {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
      email: email,
    },
  })
);
```

### Pagination

**Efficient pagination:**

```typescript
// ✅ Good - Use LastEvaluatedKey
async function listUsers(limit: number, lastKey?: string) {
  const params: QueryCommandInput = {
    TableName: 'MainTable',
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: 'USERS' },
    },
    Limit: limit,
  };

  if (lastKey) {
    params.ExclusiveStartKey = JSON.parse(Buffer.from(lastKey, 'base64').toString());
  }

  const result = await dynamoClient.send(new QueryCommand(params));

  return {
    items: result.Items,
    nextKey: result.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : undefined,
  };
}

// ❌ Bad - Fetch all and slice
const allUsers = await getAllUsers(); // Fetches everything
return allUsers.slice(offset, offset + limit);
```

## S3

### Bucket Configuration

**Security:**

```yaml
resources:
  Resources:
    FilesBucket:
      Type: AWS::S3::Bucket
      Properties:
        BucketName: ${self:service}-files-${self:provider.stage}
        # Block public access
        PublicAccessBlockConfiguration:
          BlockPublicAcls: true
          BlockPublicPolicy: true
          IgnorePublicAcls: true
          RestrictPublicBuckets: true
        # Enable versioning
        VersioningConfiguration:
          Status: Enabled
        # Lifecycle rules
        LifecycleConfiguration:
          Rules:
            - Id: DeleteOldVersions
              Status: Enabled
              NoncurrentVersionExpirationInDays: 30
        # Encryption
        BucketEncryption:
          ServerSideEncryptionConfiguration:
            - ServerSideEncryptionByDefault:
                SSEAlgorithm: AES256
```

### Presigned URLs

**Secure file uploads:**

```typescript
// ✅ Good - Presigned URL for upload
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function getUploadUrl(fileName: string, contentType: string) {
  const key = `uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env['FILES_BUCKET']!,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });

  return { url, key };
}

// ❌ Bad - Direct upload through Lambda
async function uploadFile(file: Buffer) {
  // Lambda has size limits and costs more
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env['FILES_BUCKET']!,
      Key: 'file.pdf',
      Body: file, // Large file through Lambda
    })
  );
}
```

## SES (Email)

### Email Service

**Send emails:**

```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: process.env['AWS_REGION'] });

async function sendEmail(to: string, subject: string, body: string) {
  const command = new SendEmailCommand({
    Source: process.env['FROM_EMAIL']!,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: body,
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    logger.info('Email sent', { to, subject });
  } catch (error) {
    logger.error('Failed to send email', { error, to, subject });
    throw error;
  }
}
```

**Email templates:**

```typescript
// ✅ Good - Use templates
const templates = {
  invitation: (name: string, link: string) => `
    <html>
      <body>
        <h1>Welcome ${name}!</h1>
        <p>You've been invited to join our platform.</p>
        <a href="${link}">Accept Invitation</a>
      </body>
    </html>
  `,
};

await sendEmail(user.email, "You're invited!", templates.invitation(user.name, invitationLink));
```

## SQS (Queues)

### Queue Configuration

**Standard queue:**

```yaml
resources:
  Resources:
    ProcessingQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: ${self:service}-processing-${self:provider.stage}
        VisibilityTimeout: 300
        MessageRetentionPeriod: 1209600 # 14 days
        ReceiveMessageWaitTimeSeconds: 20 # Long polling
```

### Queue Processing

**Send message:**

```typescript
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: process.env['AWS_REGION'] });

async function enqueueTask(task: any) {
  const command = new SendMessageCommand({
    QueueUrl: process.env['QUEUE_URL']!,
    MessageBody: JSON.stringify(task),
    MessageAttributes: {
      TaskType: {
        DataType: 'String',
        StringValue: task.type,
      },
    },
  });

  await sqsClient.send(command);
}
```

**Process messages:**

```typescript
export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const task = JSON.parse(record.body);
      await processTask(task);

      // Message is automatically deleted on success
    } catch (error) {
      logger.error('Failed to process message', { error, record });
      // Message will be retried or sent to DLQ
      throw error;
    }
  }
};
```

## WebSocket

### Connection Management

**Store connections:**

```typescript
// Store connection in DynamoDB
async function handleConnect(connectionId: string, userId: string) {
  await dynamoClient.send(
    new PutCommand({
      TableName: 'Connections',
      Item: {
        connectionId,
        userId,
        connectedAt: Date.now(),
      },
    })
  );
}

// Remove connection
async function handleDisconnect(connectionId: string) {
  await dynamoClient.send(
    new DeleteCommand({
      TableName: 'Connections',
      Key: { connectionId },
    })
  );
}
```

**Send messages:**

```typescript
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';

async function sendToConnection(connectionId: string, data: any) {
  const client = new ApiGatewayManagementApiClient({
    endpoint: process.env['WEBSOCKET_ENDPOINT'],
  });

  try {
    await client.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(data),
      })
    );
  } catch (error) {
    if (error.statusCode === 410) {
      // Connection is gone, remove from database
      await handleDisconnect(connectionId);
    } else {
      throw error;
    }
  }
}
```

## Environment Management

### Multi-Stage Setup

**Stage configuration:**

```yaml
provider:
  stage: ${opt:stage, 'dev'}
  environment:
    STAGE: ${self:provider.stage}
    TABLE_NAME: ${self:service}-${self:provider.stage}

custom:
  stages:
    dev:
      domainName: api-dev.example.com
    test:
      domainName: api-test.example.com
    prod:
      domainName: api.example.com
```

**Environment variables:**

```bash
# .env.dev
CLERK_SECRET_KEY=sk_test_...
AWS_REGION=us-east-1
LOG_LEVEL=debug

# .env.prod
CLERK_SECRET_KEY=sk_live_...
AWS_REGION=us-east-1
LOG_LEVEL=info
```

### Secrets Management

**Use AWS Secrets Manager or Parameter Store:**

```yaml
provider:
  environment:
    # ✅ Good - Reference from Secrets Manager
    API_KEY: ${ssm:/myapp/${self:provider.stage}/api-key~true}

    # ❌ Bad - Hardcoded secret
    API_KEY: sk_live_abc123
```

## Monitoring and Logging

### CloudWatch Logs

**Log groups:**

```yaml
provider:
  logs:
    restApi:
      accessLogging: true
      executionLogging: true
      level: INFO
      fullExecutionData: true
```

**Structured logging:**

```typescript
// ✅ Good - Structured logs
logger.info('User created', {
  userId: user.id,
  email: user.email,
  role: user.role,
  timestamp: Date.now(),
});

// ❌ Bad - Unstructured logs
console.log(`User ${user.id} created with email ${user.email}`);
```

### Metrics

**Custom metrics:**

```typescript
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

async function recordMetric(name: string, value: number) {
  const command = new PutMetricDataCommand({
    Namespace: 'MyApp',
    MetricData: [
      {
        MetricName: name,
        Value: value,
        Unit: 'Count',
        Timestamp: new Date(),
      },
    ],
  });

  await cloudWatchClient.send(command);
}

// Usage
await recordMetric('UserCreated', 1);
await recordMetric('ApiLatency', responseTime);
```

### Alarms

**CloudWatch alarms:**

```yaml
resources:
  Resources:
    ErrorAlarm:
      Type: AWS::CloudWatch::Alarm
      Properties:
        AlarmName: ${self:service}-${self:provider.stage}-errors
        MetricName: Errors
        Namespace: AWS/Lambda
        Statistic: Sum
        Period: 300
        EvaluationPeriods: 1
        Threshold: 10
        ComparisonOperator: GreaterThanThreshold
        AlarmActions:
          - !Ref AlertTopic
```

## Cost Optimization

### Lambda Optimization

**Right-size memory:**

```yaml
# ✅ Good - Appropriate memory
functions:
  lightFunction:
    memorySize: 256  # Cheaper for simple operations

  heavyFunction:
    memorySize: 1024  # More CPU for compute-intensive tasks

# ❌ Bad - Over-provisioned
functions:
  allFunctions:
    memorySize: 3008  # Expensive!
```

**Reduce cold starts:**

- Keep functions warm with scheduled pings (if needed)
- Minimize dependencies
- Use Lambda layers for shared code
- Initialize clients outside handler

### DynamoDB Optimization

**On-demand vs provisioned:**

```yaml
# ✅ Good - On-demand for unpredictable traffic
resources:
  Resources:
    MainTable:
      Type: AWS::DynamoDB::Table
      Properties:
        BillingMode: PAY_PER_REQUEST

# ✅ Good - Provisioned for predictable traffic
resources:
  Resources:
    MainTable:
      Type: AWS::DynamoDB::Table
      Properties:
        BillingMode: PROVISIONED
        ProvisionedThroughput:
          ReadCapacityUnits: 5
          WriteCapacityUnits: 5
```

### S3 Optimization

**Lifecycle policies:**

```yaml
LifecycleConfiguration:
  Rules:
    - Id: MoveToIA
      Status: Enabled
      Transitions:
        - Days: 30
          StorageClass: STANDARD_IA
    - Id: MoveToGlacier
      Status: Enabled
      Transitions:
        - Days: 90
          StorageClass: GLACIER
    - Id: DeleteOld
      Status: Enabled
      ExpirationInDays: 365
```

## Best Practices Summary

### Do's

- ✅ Initialize clients outside handlers
- ✅ Use structured logging
- ✅ Implement proper error handling
- ✅ Right-size Lambda memory
- ✅ Use DynamoDB efficiently (Query over Scan)
- ✅ Implement retry logic
- ✅ Monitor and set up alarms
- ✅ Use environment variables
- ✅ Implement security best practices
- ✅ Test locally with serverless-offline

### Don'ts

- ❌ Store state in Lambda
- ❌ Use Scan on large tables
- ❌ Hardcode secrets
- ❌ Over-provision resources
- ❌ Ignore cold starts
- ❌ Skip error handling
- ❌ Use console.log for production
- ❌ Forget to set timeouts
- ❌ Ignore costs
- ❌ Skip monitoring

---

For more information, see:

- [Coding Guidelines](./CODING_GUIDELINES.md)
- [Backend README](../backend/README.md)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
