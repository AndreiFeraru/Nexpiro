require('dotenv').config();

const fs = require('fs');
const path = require('path');

const env = {
  production: true,
  firebaseConfig: {
    apiKey: process.env['FIREBASE_API_KEY'] || 'default_api_key',
    authDomain: process.env['FIREBASE_AUTH_DOMAIN'] || 'default_auth_domain',
    databaseURL: process.env['FIREBASE_DATABASE_URL'] || 'default_database_url',
    projectId: process.env['FIREBASE_PROJECT_ID'] || 'default_project_id',
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || 'default_storage_bucket',
    messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'] || 'default_messaging_sender_id',
    appId: process.env['FIREBASE_APP_ID'] || 'default_app_id',
    measurementId: process.env['FIREBASE_MEASUREMENT_ID'] || 'default_measurement_id',
  }
};

const content = `export const environment = ${JSON.stringify(env, null, 2)};\n`;

const filePath = path.join(__dirname, '../src/environments/environment.prod.ts');
fs.mkdirSync(path.dirname(filePath), { recursive: true });
fs.writeFileSync(filePath, content, { flag: 'w' });

console.log('Production environment file generated.');

env.production = false;
const contentDev = `export const environment = ${JSON.stringify(env, null, 2)};\n`;

const filePathDev = path.join(__dirname, '../src/environments/environment.dev.ts');
fs.mkdirSync(path.dirname(filePathDev), { recursive: true });
fs.writeFileSync(filePathDev, contentDev, { flag: 'w' });

console.log('Development environment file generated.');
