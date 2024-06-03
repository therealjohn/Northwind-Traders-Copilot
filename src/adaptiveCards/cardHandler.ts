import {
    TurnContext,
    CardFactory,
    Activity
} from "botbuilder";
import { updateProduct, getProductEx } from "../northwindDB/products";
import { ProductEx } from '../northwindDB/model';
import editCard from './editCard.json';
import editCardHandoff from './editCardHandoff.json';
import successCard from './successCard.json';
import * as ACData from "adaptivecards-templating";

import { CreateActionErrorResponse, CreateAdaptiveCardInvokeResponse, getInventoryStatus } from './utils';
import config from "../config";
import { v4 as uuidv4 } from 'uuid';
import { setProduct } from '../messageExtensions/productMap';

function getEditCard(product: ProductEx, includeHandoff: boolean = false): any {

    // Save the product in the productMap with the continuationToken as the key
    var continuationToken = uuidv4();
    setProduct(continuationToken, product);

    var template = includeHandoff ? new ACData.Template(editCardHandoff) : new ACData.Template(editCard);
    var card = template.expand({
        $root: {
            productName: product.ProductName,
            unitsInStock: product.UnitsInStock,
            productId: product.ProductID,
            categoryId: product.CategoryID,
            imageUrl: product.ImageUrl,
            supplierName: product.SupplierName,
            supplierCity: product.SupplierCity,
            categoryName: product.CategoryName,
            inventoryStatus: product.InventoryStatus,
            unitPrice: product.UnitPrice,
            quantityPerUnit: product.QuantityPerUnit,
            unitsOnOrder: product.UnitsOnOrder,
            reorderLevel: product.ReorderLevel,
            unitSales: product.UnitSales,
            inventoryValue: product.InventoryValue,
            revenue: product.Revenue,
            averageDiscount: product.AverageDiscount,
            northwindUrl: includeHandoff ? getHandoffUrl(continuationToken) : ""
        }
    });    

    return CardFactory.adaptiveCard(card);
}

async function handleTeamsCardActionUpdateStock(context: TurnContext) {

    const request = context.activity.value;
    const data = request.action.data;
    console.log(`🎬 Handling update stock action, quantity=${data.txtStock}`);

    if (data.txtStock && data.productId) {
        
        const product = await getProductEx(data.productId);
        product.UnitsInStock = Number(data.txtStock);
        await updateProduct(product);
        
        var template = new ACData.Template(successCard);
        var card = template.expand({
            $root: {
                productName: product.ProductName,
                unitsInStock: product.UnitsInStock,
                productId: product.ProductID,
                categoryId: product.CategoryID,
                imageUrl: product.ImageUrl,
                supplierName: product.SupplierName,
                supplierCity: product.SupplierCity,
                categoryName: product.CategoryName,
                inventoryStatus: getInventoryStatus(product),
                unitPrice: product.UnitPrice,
                quantityPerUnit: product.QuantityPerUnit,
                unitsOnOrder: product.UnitsOnOrder,
                reorderLevel: product.ReorderLevel,
                unitSales: product.UnitSales,
                inventoryValue: product.UnitsInStock * product.UnitPrice,
                revenue: product.Revenue,
                averageDiscount: product.AverageDiscount,
                // Card message
                message: `Stock updated for ${product.ProductName} to ${product.UnitsInStock}!`
            }
        });
       
        return card;

    } else {
       
        //return CreateActionErrorResponse(400,0, "Invalid request");
    }
}
async function handleTeamsCardActionCancelRestock(context: TurnContext) {

    const request = context.activity.value;
    const data = request.action.data;
    console.log(`🎬 Handling cancel restock action`)

    if (data.productId) {

        const product = await getProductEx(data.productId);
        product.UnitsOnOrder = 0;
        await updateProduct(product);

        var template = new ACData.Template(successCard);
        var card = template.expand({
            $root: {
                productName: product.ProductName,
                unitsInStock: product.UnitsInStock,
                productId: product.ProductID,
                categoryId: product.CategoryID,
                imageUrl: product.ImageUrl,
                supplierName: product.SupplierName,
                supplierCity: product.SupplierCity,
                categoryName: product.CategoryName,
                inventoryStatus: getInventoryStatus(product),
                unitPrice: product.UnitPrice,
                quantityPerUnit: product.QuantityPerUnit,
                unitsOnOrder: product.UnitsOnOrder,
                reorderLevel: product.ReorderLevel,
                unitSales: product.UnitSales,
                inventoryValue: product.UnitsInStock * product.UnitPrice,
                revenue: product.Revenue,
                averageDiscount: product.AverageDiscount,
                // Card message                
                message: `Restock cancelled for ${product.ProductName}.`
            }
        });       
        return card;

    } else {
        //return CreateActionErrorResponse(400,0, "Invalid request");
    }
}
async function handleTeamsCardActionRestock(context: TurnContext) {
    const request = context.activity.value;
    const data = request.action.data;
    console.log(`🎬 Handling restock action, quantity=${data.txtStock}`)
    if (data.productId) {

        const product = await getProductEx(data.productId);
        product.UnitsOnOrder = Number(product.UnitsOnOrder) + Number(data.txtStock);
        await updateProduct(product);

        var template = new ACData.Template(successCard);
        var card = template.expand({
            $root: {
                productName: product.ProductName,
                unitsInStock: product.UnitsInStock,
                productId: product.ProductID,
                categoryId: product.CategoryID,
                imageUrl: product.ImageUrl,
                supplierName: product.SupplierName,
                supplierCity: product.SupplierCity,
                categoryName: product.CategoryName,
                inventoryStatus: getInventoryStatus(product),
                unitPrice: product.UnitPrice,
                quantityPerUnit: product.QuantityPerUnit,
                unitsOnOrder: product.UnitsOnOrder,
                reorderLevel: product.ReorderLevel,
                unitSales: product.UnitSales,
                inventoryValue: product.UnitsInStock * product.UnitPrice,
                revenue: product.Revenue,
                averageDiscount: product.AverageDiscount,
                // Card message
                message: `Restocking ${product.ProductName} placed order for ${data.txtStock ?? 0} units.`
            }
        });
        return card;

    } else {
        //return CreateActionErrorResponse(400,0, "Invalid request");
    }
}

function getHandoffUrl(continuationToken: string): string {
    return `https://teams.microsoft.com/l/chat/0/0?users=28:${config.botId}&continuation=${continuationToken}`;
}

export default { getEditCard, handleTeamsCardActionUpdateStock, handleTeamsCardActionRestock, handleTeamsCardActionCancelRestock }
