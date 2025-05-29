const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamo = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, title, note, summary, beginnerNote, timestamp } = body;

    console.log("Received saveNote request:", { userId, title });

    if (!userId || !note || !title) {
      console.warn("Missing required fields:", { userId, title, note });
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const item = {
      userId: { S: userId },
      noteId: { S: timestamp || new Date().toISOString() },
      title: { S: title },
      originalNote: { S: note },
      summary: { S: summary || '' },
      beginnerNote: { S: beginnerNote || '' },
    };

    const command = new PutItemCommand({
      TableName: "ai_notes",
      Item: item,
    });

    await dynamo.send(command);

    console.log("Note saved successfully for user:", userId);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ message: "Note saved successfully" }),
    };

  } catch (err) {
    console.error("Error saving note:", err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Failed to save note" }),
    };
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
