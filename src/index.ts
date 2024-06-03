// Import required packages
import * as restify from "restify";
import { app } from './app/app';
import { TeamsAdapter } from "@microsoft/teams-ai";

// Create HTTP server.
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\nBot Started, ${server.name} listening to ${server.url}`);
});

// Listen for incoming requests.
server.post("/api/messages", async (req, res) => {
  await (app.adapter as TeamsAdapter).process(req, res as any, async (context) => {
    await app.run(context);
  });
});


