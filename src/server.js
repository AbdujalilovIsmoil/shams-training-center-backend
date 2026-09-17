const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
  console.log(`Shams Blog API http://localhost:${env.port} portida ishga tushdi`);
});
