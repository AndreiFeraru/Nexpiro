require('dotenv').config();
const fs = require('fs');
const path = require('path');

const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_DATABASE_URL',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_MEASUREMENT_ID',
  'OCR_API_KEY'
];

const baseEnv = {
  firebaseConfig: {
    apiKey: process.env['FIREBASE_API_KEY'],
    authDomain: process.env['FIREBASE_AUTH_DOMAIN'],
    databaseURL: process.env['FIREBASE_DATABASE_URL'],
    projectId: process.env['FIREBASE_PROJECT_ID'],
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'],
    appId: process.env['FIREBASE_APP_ID'],
    measurementId: process.env['FIREBASE_MEASUREMENT_ID'],
  },
  ocrApiKey: process.env['OCR_API_KEY'], // TODO add actual OCR API Key in GitHub Secrets
};

const checkMissingEnvVars = (vars) => {
  const missingVars = vars.filter(envVar => !process.env[envVar]);
  if (missingVars.length > 0) {
    console.error(`Error: Missing the following environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
};

const generateEnvFile = (env, filePath) => {
  const content = `export const environment = ${JSON.stringify(env, null, 2)};\n`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, { flag: 'w' });
  console.log(`${path.basename(filePath)} environment file generated.`);
};

checkMissingEnvVars(requiredEnvVars);

generateEnvFile({ ...baseEnv, production: true }, path.join(__dirname, '../src/environments/environment.prod.ts'));
generateEnvFile({ ...baseEnv, production: false }, path.join(__dirname, '../src/environments/environment.dev.ts'));
