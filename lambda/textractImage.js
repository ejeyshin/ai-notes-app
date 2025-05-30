const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');

const textract = new TextractClient({ region: 'us-east-1' });

exports.handler = async (event) => {
  console.log('Textract request:', JSON.stringify(event));

  try {
    const { imageData } = JSON.parse(event.body || '{}');

    if (!imageData) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Image data is required' })
      };
    }

    console.log('Processing image with Textract...');

    
    const imageBuffer = Buffer.from(imageData, 'base64');

    
    if (imageBuffer.length > 5 * 1024 * 1024) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Image too large. Maximum size is 5MB.' })
      };
    }

    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: imageBuffer
      }
    });

    const response = await textract.send(command);
    console.log('Textract response received');

    
    let extractedText = '';
    if (response.Blocks) {
      
      const lines = response.Blocks
        .filter(block => block.BlockType === 'LINE')
        .sort((a, b) => {
          
          const topDiff = a.Geometry.BoundingBox.Top - b.Geometry.BoundingBox.Top;
          if (Math.abs(topDiff) > 0.01) return topDiff;
          return a.Geometry.BoundingBox.Left - b.Geometry.BoundingBox.Left;
        });

      extractedText = lines.map(block => block.Text).join('\n');
    }

    console.log(`Extracted text length: ${extractedText.length} characters`);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        extractedText: extractedText,
        confidence: response.Blocks ? 
          Math.round(response.Blocks
            .filter(block => block.BlockType === 'LINE')
            .reduce((sum, block) => sum + (block.Confidence || 0), 0) / 
            response.Blocks.filter(block => block.BlockType === 'LINE').length
          ) : 0
      })
    };

  } catch (error) {
    console.error('Textract Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ 
        error: 'Failed to extract text from image',
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