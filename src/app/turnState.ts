import { DefaultConversationState, TurnState } from "@microsoft/teams-ai";
import { Order, ProductEx } from "../northwindDB/model";


// Strongly type the applications turn state
export interface ConversationState extends DefaultConversationState {
    greeted: boolean;
    nextId: number;
    orders: Order[];
    products: ProductEx[];
}

export type ApplicationTurnState = TurnState<ConversationState>;