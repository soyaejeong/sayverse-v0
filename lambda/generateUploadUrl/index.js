const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({ region: 'us-east-1' });
const BUCKET_NAME = 'sayverse-audio-storage';

exports.handler = async (event) => {
  try {
    const fileKey = `${uuidv4()}.opus`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: 'audio/opus',
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // URL expires in 5 minutes
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        uploadUrl,
        fileKey,
      }),
    };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate upload URL' }),
    };
  }
};
