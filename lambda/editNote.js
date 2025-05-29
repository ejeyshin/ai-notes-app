const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { TextDecoder } = require("util");

const dynamo = new DynamoDBClient({ region: "us-east-1" });
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

exports.handler = async (event) => {
  console.log("🛠️ Edit Event Body:", event.body);

  const { userId, noteId, newText, newTitle } = JSON.parse(event.body || '{}');
  const titleToUse = newTitle || "Untitled";

  if (!userId || !noteId || !newText) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing userId, noteId, or newText" }),
    };
  }

  try {
    const summaryPrompt = {
      role: "user",
      content: `Summarize the key concepts in this note in simple but accurate English:\n\n${newText}`
    };

    const beginnerPrompt = {
      role: "user",
      content: `Rewrite this note in beginner-friendly English. Include explanations for technical terms:\n\n${newText}`
    };

    const generate = async (prompt) => {
      const command = new InvokeModelCommand({
        modelId: "anthropic.claude-3-haiku-20240307-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          messages: [prompt],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      const response = await bedrock.send(command);
      const decoded = new TextDecoder().decode(response.body);
      const result = JSON.parse(decoded);
      return result.content?.[0]?.text || result.completion || "";
    };

    const summary = await generate(summaryPrompt);
    const beginnerNote = await generate(beginnerPrompt);

    const updateCommand = new UpdateItemCommand({
      TableName: "ai_notes",
      Key: {
        userId: { S: userId },
        noteId: { S: noteId },
      },
      UpdateExpression: "SET originalNote = :note, title = :title, summary = :summary, beginnerNote = :beginner",
      ExpressionAttributeValues: {
        ":note": { S: newText },
        ":title": { S: titleToUse },
        ":summary": { S: summary },
        ":beginner": { S: beginnerNote },
      },
    });

    await dynamo.send(updateCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({ summary, beginnerNote }),
    };

  } catch (err) {
    console.error("❌ Error editing note:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update note" }),
    };
  }
};
