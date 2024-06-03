
// See https://aka.ms/teams-ai-library to learn more about the Teams AI library.
import { Application, ActionPlanner, OpenAIModel, PromptManager, TeamsAdapter, FeedbackLoopData, AI } from "@microsoft/teams-ai";
import { ActivityTypes, MemoryStorage, TurnContext, ConfigurationServiceClientCredentialFactory, MessagingExtensionQuery, CardFactory } from "botbuilder";
import * as path from "path";
import debug from 'debug';
import config from "../config";
import productSearchCommand from "../messageExtensions/productSearchCommand";
import discountedSearchCommand from "../messageExtensions/discountSearchCommand";
import revenueSearchCommand from "../messageExtensions/revenueSearchCommand";
import actionHandler from "../adaptiveCards/cardHandler";
import cardHandler from "../adaptiveCards/cardHandler";
import exampleCard from "../adaptiveCards/exampleCardActivity.json";
import * as ACData from "adaptivecards-templating";
import { getProduct } from '../messageExtensions/productMap';
import { handleCancelOrder, handleCreateOrder, handleGetOrder } from "./actions";
import { ApplicationTurnState } from "./turnState";
import { searchProducts } from "../northwindDB/products";

const error = debug('azureopenai:app:error');
error.log = console.log.bind(console);

//
// Define AI model to use
//
const model = new OpenAIModel({
  azureApiKey: config.azureOpenAIKey,
  azureDefaultDeployment: config.azureOpenAIDeploymentName,
  azureEndpoint: config.azureOpenAIEndpoint,
  azureApiVersion: '2024-02-15-preview',
  useSystemMessages: true,
  logRequests: true,
});

const prompts = new PromptManager({
  promptsFolder: path.join(__dirname, "../prompts"),
});

const planner = new ActionPlanner({
  model,
  prompts,
  defaultPrompt: async () => {
    const template = await prompts.getPrompt('chat');

    //
    // Use the Azure AI Search data source for RAG over documents
    //
    const dataSources = (template.config.completion as any)['data_sources'];

    if (dataSources && dataSources.length > 0) {
      dataSources.forEach((dataSource: any) => {
        if (dataSource.type === 'azure_search' && dataSource.parameters) {
          dataSource.parameters.authentication.key = config.azureSearchKey;
          dataSource.parameters.endpoint = config.azureSearchEndpoint;
        }
      });
    } else {
      console.error('dataSources is empty');
    }

    return template;
  }
});

const storage = new MemoryStorage();
export const app = new Application<ApplicationTurnState>({
  storage,
  ai: {
    planner: planner,
    enable_feedback_loop: true
  },
  adapter: new TeamsAdapter(
    {},
    new ConfigurationServiceClientCredentialFactory({
      MicrosoftAppId: config.botId,
      MicrosoftAppPassword: config.botPassword,
      MicrosoftAppType: 'MultiTenant'
    })
  )
});

// 
// Register Teams AI Library actions
//
app.ai.action("createOrder", handleCreateOrder);
app.ai.action("getOrder", handleGetOrder);
app.ai.action("cancelOrder", handleCancelOrder);
app.ai.action("getProduct", handleGetProduct);

//
// Action handler for getProduct
//
export async function handleGetProduct(context: TurnContext, state: ApplicationTurnState, parameters: any) {
  const products = await searchProducts(parameters.productName, '', '', '', '');
  if (products.length > 0) {
      const firstProduct = products[0];
      const resultCard = cardHandler.getEditCard(firstProduct, false);
      const attachment = { ...resultCard };

      await context.sendActivity({
        attachments: [attachment], 
        channelData: { feedbackLoopEnabled: true },
        entities: [{ 
          type: "https://schema.org/Message",
          "@type": "Message",
          "@context": "https://schema.org",
          "@id": "",
          additionalType: ["AIGeneratedContent"],
          usageInfo: {
            name: "Northwind Confidentional",
            description: "Please don't share outside of the company.",
          },
        }]
      });

      return AI.StopCommandName;
  } else {
      return `No product found for ${parameters.productName}. think about your next action`;
  }
}

// Copilot plugin handoff
app.handoff(async (context: TurnContext, state: ApplicationTurnState, continuation: string) => {
  await context.sendActivities([
    {
      type: ActivityTypes.Message,
      text: "Continuing conversation from Copilot...",
    },
    { type: ActivityTypes.Typing },
    { type: "delay", value: 1000 },
  ]);

  // For demonstration, just send a card for this example product to the user.
  const adaptiveCard = CardFactory.adaptiveCard(new ACData.Template(exampleCard).expand({}));
  
  await context.sendActivity({ 
    attachments: [adaptiveCard], 
    channelData: { feedbackLoopEnabled: true },
    entities: [{ 
      type: "https://schema.org/Message",
      "@type": "Message",
      "@context": "https://schema.org",
      "@id": "",
      additionalType: ["AIGeneratedContent"],
      usageInfo: {
        name: "Northwind Confidentional",
        description: "Please don't share outside of the company.",
      },
    }]
  });
});

// Handle feedback loop
app.feedbackLoop(async (context: TurnContext, state: ApplicationTurnState, feedback: FeedbackLoopData) => {
  console.log('Feedback received:', feedback);
});

// Handle message extension queries
app.messageExtensions.query(productSearchCommand.COMMAND_ID, async (context: TurnContext, state: ApplicationTurnState, query) => {
  let messageExtensionQuery: MessagingExtensionQuery = {
    parameters: Object.keys(query.parameters).map(key => ({ name: key, value: query.parameters[key] })),
    commandId: productSearchCommand.COMMAND_ID
  }
  return productSearchCommand.handleTeamsMessagingExtensionQuery(context, messageExtensionQuery);
});

app.messageExtensions.query(discountedSearchCommand.COMMAND_ID, async (context: TurnContext, state: ApplicationTurnState, query) => {
  let messageExtensionQuery: MessagingExtensionQuery = {
    parameters: Object.keys(query.parameters).map(key => ({ name: key, value: query.parameters[key] })),
    commandId: discountedSearchCommand.COMMAND_ID
  }
  return discountedSearchCommand.handleTeamsMessagingExtensionQuery(context, messageExtensionQuery);
});

app.messageExtensions.query(revenueSearchCommand.COMMAND_ID, async (context: TurnContext, state: ApplicationTurnState, query) => {
  let messageExtensionQuery: MessagingExtensionQuery = {
    parameters: Object.keys(query.parameters).map(key => ({ name: key, value: query.parameters[key] })),
    commandId: revenueSearchCommand.COMMAND_ID
  }
  return revenueSearchCommand.handleTeamsMessagingExtensionQuery(context, messageExtensionQuery);
});

// Handle adaptive card actions
app.adaptiveCards.actionExecute("ok", async (context: TurnContext, state: ApplicationTurnState) => {
  return actionHandler.handleTeamsCardActionUpdateStock(context);
});

app.adaptiveCards.actionExecute("restock", async (context: TurnContext, state: ApplicationTurnState) => {
  return actionHandler.handleTeamsCardActionRestock(context);
});

app.adaptiveCards.actionExecute("cancel", async (context: TurnContext, state: ApplicationTurnState) => {
  return actionHandler.handleTeamsCardActionCancelRestock(context);
});

app.error(async (context: TurnContext, err: Error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  error(`[onTurnError] unhandled error: ${err}`);
  error(err);

  if (err.message) {
    console.error(err.message);
    console.error(err.stack);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendTraceActivity(
      'OnTurnError Trace',
      `${err.message}`,
      'https://www.botframework.com/schemas/error',
      'TurnError'
    );
  }
});

export default app;