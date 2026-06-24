const express = require('express');
const usersRouter = require('./routes/users');
const healthRouter = require('./routes/health');
const tokensRouter = require('./routes/tokens');
const requireToken = require('./middleware/auth');
const store = require('./db/store');

const app = express();
app.use(express.json());

app.use('/health', healthRouter);
app.use('/tokens', tokensRouter);
app.use(requireToken);
app.use('/users', usersRouter);

const PORT = process.env.PORT || 3000;

// Only start listening when run directly (e.g. `npm run dev`), so the tests
// can import the app without opening a port.
if (require.main === module) {
  const adminValue = process.env.ADMIN_TOKEN;
  const adminToken = store.createToken({ name: 'admin', role: 'admin', value: adminValue });
  if (!adminValue) {
    console.log(`\nAdmin token (save this — shown once): ${adminToken.token}\n`);
  }
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
