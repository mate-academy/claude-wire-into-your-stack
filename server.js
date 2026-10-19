// Entry point of the Course API (small express app with users and health routes).
const express = require('express');
const usersRouter = require('./routes/users');
const healthRouter = require('./routes/health');

const app = express();
// Parse JSON request bodies so routes can read them from req.body.
app.use(express.json());

app.use('/health', healthRouter);
app.use('/users', usersRouter);

const PORT = process.env.PORT || 3000;

// Only start listening when run directly (e.g. `npm run dev`), so tests
// can import the app without opening a port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
