const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamo = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  console.log("🛠️ Edit Summary/Beginner Event Body:", event.body);

  try {
    const { userId, noteId, newSummary, newBeginnerNote } = JSON.parse(event.body || '{}');

    if (!userId || !noteId || newSummary === undefined || newBeginnerNote === undefined) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ 
          error: "Missing required fields: userId, noteId, newSummary, or newBeginnerNote" 
        }),
      };
    }

    console.log("Updating summary and beginner note for:", { userId, noteId });

    const updateCommand = new UpdateItemCommand({
      TableName: "ai_notes",
      Key: {
        userId: { S: userId },
        noteId: { S: noteId },
      },
      UpdateExpression: "SET summary = :summary, beginnerNote = :beginner",
      ExpressionAttributeValues: {
        ":summary": { S: newSummary },
        ":beginner": { S: newBeginnerNote },
      },
      ReturnValues: "UPDATED_NEW"
    });

    const result = await dynamo.send(updateCommand);
    console.log("Successfully updated summary and beginner note");

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        message: "Summary and beginner note updated successfully",
        updated: {
          summary: newSummary,
          beginnerNote: newBeginnerNote
        }
      }),
    };

  } catch (err) {
    console.error("Error updating summary and beginner note:", err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        error: "Failed to update summary and beginner note",
        details: err.message 
      }),
    };
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
}