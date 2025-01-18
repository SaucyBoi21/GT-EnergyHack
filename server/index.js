const express = require("express")
const app = express()

const myRoutes = require('./routes/routes')
const port = 3000

app.use('/', myRoutes)
app.use(express.json)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
