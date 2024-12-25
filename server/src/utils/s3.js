import AWS from 'aws-sdk';
import fs from 'fs';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

export const uploadToS3 = async (filePath) => {
  const fileStream = fs.createReadStream(filePath);
  const fileName = filePath.split('/').pop();

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `recordings/${fileName}`,
    Body: fileStream
  };

  try {
    const result = await s3.upload(uploadParams).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
};