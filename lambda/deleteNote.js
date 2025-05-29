const { DynamoDBClient, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamo = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  console.log("Raw event body:", event.body);

  let userId, noteId;

  try {
    const body = JSON.parse(event.body || '{}');
    userId = body.userId;
    noteId = body.noteId;
  } catch (err) {
    console.error("Failed to parse body:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  console.log("Attempting to delete:", { userId, noteId });

  if (!userId || !noteId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing userId or noteId" }),
    };
  }

  try {
    const command = new DeleteItemCommand({
      TableName: "ai_notes",
      Key: {
        userId: { S: userId },
        noteId: { S: noteId },
      },
      ReturnValues: "ALL_OLD", 
    });

    const result = await dynamo.send(command);
    console.log("DynamoDB Delete result:", result);

    if (!result.Attributes) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Item not found. Nothing was deleted.",
          userId,
          noteId,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Note deleted", deleted: result.Attributes }),
    };
  } catch (err) {
    console.error("DynamoDB Delete Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete note", details: err.message }),
    };
  }
};
