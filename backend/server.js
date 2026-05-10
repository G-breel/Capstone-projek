const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const { runMigrations } = require('./src/config/migrate');

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
testConnection().then(async () => {
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
  });
});