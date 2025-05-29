const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");

const dynamo = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  const userId = event.queryStringParameters?.userId;

  console.log("Received request to get notes for user:", userId);

  if (!userId) {
    console.warn("Missing userId in queryStringParameters");
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Missing userId" }),
    };
  }

  try {
    const command = new QueryCommand({
      TableName: "ai_notes",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: userId },
      },
    });

    const response = await dynamo.send(command);

    const notes = response.Items.map(item => ({
      noteId: item.noteId.S,
      title: item.title?.S || "Untitled",
      originalNote: item.originalNote.S,
      summary: item.summary?.S || "",
      beginnerNote: item.beginnerNote?.S || "",
    }));

    console.log(`Returned ${notes.length} notes for userId: ${userId}`);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ notes }),
    };

  } catch (error) {
    console.error("Error fetching notes from DynamoDB:", error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Failed to retrieve notes" }),
    };
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
