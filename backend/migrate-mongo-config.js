const dotenv = require('dotenv');
dotenv.config();

const fullUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/giu_nexus';

// Extract database name if present in URI
let databaseName = 'giu_nexus';
try {
  const parsed = new URL(fullUri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'http://'));
  const pathname = parsed.pathname.replace('/', '');
  if (pathname) {
    databaseName = pathname.split('?')[0];
  }
} catch (e) {
  // fallback to default
}

const config = {
  mongodb: {
    url: fullUri,
    databaseName: databaseName,
    options: {}
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs'
};

module.exports = config;
