const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');

const polly = new PollyClient({ region: 'us-east-1' });

exports.handler = async (event) => {
  console.log('Text-to-Speech request:', JSON.stringify(event));

  try {
    const { text } = JSON.parse(event.body || '{}');

    if (!text || text.trim().length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    
    if (text.length > 3000) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Text too long (max 3000 characters)' })
      };
    }

    console.log(`Generating speech for ${text.length} characters`);

    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: 'Brian', 
      Engine: 'neural',  
      TextType: 'text'
    });

    const response = await polly.send(command);
    console.log('Polly response received');
    
    
    const chunks = [];
    for await (const chunk of response.AudioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString('base64');

    console.log(`Generated audio: ${audioBase64.length} base64 characters`);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audioData: audioBase64,
        contentType: 'audio/mpeg'
      })
    };

  } catch (error) {
    console.error('Polly Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        error: 'Failed to generate speech',
        details: error.message 
      })
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}