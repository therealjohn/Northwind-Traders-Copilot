import { TurnContext } from "botbuilder";
import { Order, ProductEx } from "../northwindDB/model";
import { getAllProductsEx, searchProducts } from "../northwindDB/products";
import { AI, DefaultConversationState } from "@microsoft/teams-ai";
import cardHandler from "../adaptiveCards/cardHandler";
import { ApplicationTurnState, ConversationState } from "./turnState";
  
export async function handleCreateOrder(context: TurnContext, state: ApplicationTurnState, parameters: Order) {
    const conversation = await ensureStateInitialized(state);
    parameters.OrderID = conversation.nextId++;
    conversation.orders.push(parameters);
    return `order ${parameters.OrderID} created. think about your next action`;
}

export async function handleGetOrder(context: TurnContext, state: ApplicationTurnState, parameters: Order) {
    const conversation = await ensureStateInitialized(state);
    const order = conversation.orders.find((x) => x.OrderID == parameters.OrderID);
    if (order) {
        return `order ${order}. think about your next action`;
    }
    else {
        return `No order found. think about your next action`;
    }
}

export async function handleCancelOrder(context: TurnContext, state: ApplicationTurnState, parameters: Order) {
    const conversation = await ensureStateInitialized(state);
    const order = conversation.orders.find((x) => x.OrderID == parameters.OrderID);
    if (order) {
        // Remove the order
        conversation.orders = conversation.orders.filter((x) => x.OrderID != parameters.OrderID);
    }
    return `order ${parameters.OrderID} canceled. think about your next action`;
}

/**
 * This method is used to make sure that the conversation state is initialized.
 * @param {ApplicationTurnState} state The application turn state.
 * @returns {ConversationState} The conversation state
 */
async function ensureStateInitialized(state: ApplicationTurnState): Promise<ConversationState> {
    if (state.conversation.nextId == undefined) {
        state.conversation.nextId = 1;
    }
    if (!Array.isArray(state.conversation.orders)) {
        state.conversation.orders = [];
    }
    if (!Array.isArray(state.conversation.products)) {
        state.conversation.products = await getAllProductsEx();
    }
    return state.conversation;
}