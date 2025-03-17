const app = require('./index');
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = server; // Exporting server for potential shutdown in tests
