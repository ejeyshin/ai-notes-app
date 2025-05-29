const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { TextDecoder } = require("util");

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
const dynamo = new DynamoDBClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    console.log("Lambda started with event:", JSON.stringify(event));
    
    const body = JSON.parse(event.body || '{}');
    const userNote = body.note;
    const userId = body.userId;
    const noteTitle = body.title || "Untitled";

    console.log("Lambda started:", { note: userNote?.substring(0, 100), userId, title: noteTitle });

    if (!userNote || !userId) {
      console.log("Missing required fields");
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: "Note text or user ID missing" })
      };
    }

   
    const messages = [
      {
        role: "user",
        content: `Please help me with my study note by doing two things:

1. SUMMARY: Write a clear, detailed summary of the key concepts and important points from this note.

2. BEGINNER EXPLANATION: Rewrite the note in simple, beginner-friendly language that explains technical terms.

Please format your response exactly like this:
SUMMARY:
[your summary here]

BEGINNER EXPLANATION:
[your beginner-friendly explanation here]

Here is the note:
${userNote}`
      }
    ];

    console.log("Sending to Bedrock Claude");

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages,
        max_tokens: 1500,
        temperature: 0.5,
      }),
    });

    console.log("About to call Bedrock");
    const response = await bedrock.send(command);
    console.log("Bedrock response received");
    
    const decoded = new TextDecoder().decode(response.body);
    const result = JSON.parse(decoded);
    const fullResponse = result.content?.[0]?.text || result.completion || "No content returned.";

    console.log("Claude response:", fullResponse);

   
    let summary = "";
    let beginnerNote = "";

    
    const summaryMatch = fullResponse.match(/SUMMARY:\s*([\s\S]*?)(?=BEGINNER EXPLANATION:|$)/i);
    const beginnerMatch = fullResponse.match(/BEGINNER EXPLANATION:\s*([\s\S]*?)$/i);

    if (summaryMatch && beginnerMatch) {
      summary = summaryMatch[1].trim();
      beginnerNote = beginnerMatch[1].trim();
    } else {
      
      const lines = fullResponse.split('\n');
      let currentSection = '';
      let summaryLines = [];
      let beginnerLines = [];

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.toLowerCase().includes('summary') && trimmedLine.includes(':')) {
          currentSection = 'summary';
          continue;
        } else if (trimmedLine.toLowerCase().includes('beginner') || 
                   trimmedLine.toLowerCase().includes('explanation')) {
          currentSection = 'beginner';
          continue;
        }

        if (currentSection === 'summary' && trimmedLine) {
          summaryLines.push(trimmedLine);
        } else if (currentSection === 'beginner' && trimmedLine) {
          beginnerLines.push(trimmedLine);
        }
      }

      summary = summaryLines.join(' ').trim() || fullResponse.substring(0, 500);
      beginnerNote = beginnerLines.join(' ').trim() || "Explanation processing...";
    }

   
    summary = summary.replace(/^(Summary|SUMMARY)[:.]?\s*/i, '').trim();
    beginnerNote = beginnerNote.replace(/^(Beginner|BEGINNER|Explanation)[:.]?\s*/i, '').trim();

    console.log("Parsed summary length:", summary.length);
    console.log("Parsed beginner note length:", beginnerNote.length);

    const timestamp = new Date().toISOString();

    const item = {
      id: { S: `${userId}#${timestamp}` },
      userId: { S: userId },
      noteId: { S: timestamp },
      title: { S: noteTitle },
      originalNote: { S: userNote },
      summary: { S: summary },
      beginnerNote: { S: beginnerNote }
    };

    console.log("Saving note to DynamoDB");

    const saveCommand = new PutItemCommand({
      TableName: "ai_notes",
      Item: item
    });

    await dynamo.send(saveCommand);
    
    console.log("Successfully saved to DynamoDB");

    const responseBody = { summary, beginnerNote };
    console.log("Returning response:", JSON.stringify(responseBody));

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(responseBody)
    };

  } catch (error) {
    console.error("Lambda Error:", error);
    console.error("Error stack:", error.stack);
    
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        error: "Failed to generate or store summary.",
        details: error.message 
      })
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

