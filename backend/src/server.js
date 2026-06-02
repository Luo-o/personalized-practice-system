require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 8088;

const server = app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("HTTP server error:", error);
});
