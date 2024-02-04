import { Document, Types } from "mongoose";
export declare enum OrderStatus {
    PENDING = "pending",
    EXECUTED = "executed",
    CANCELED = "canceled",
    PARTIALLY_EXECUTED = "partially_executed"
}
export interface OrderLineItem extends Document {
    product: Types.ObjectId;
    quantity: number;
    price: number;
    status: OrderStatus;
}
export interface Order extends Document {
    user: Types.ObjectId;
    quantity: number;
    price: number;
    status: OrderStatus;
    totalAmount: number;
    lineItems: OrderLineItem[];
}
export interface Inventory extends Document {
    product: Types.ObjectId;
    quantity: number;
}
export interface InventoryEventDataType {
    productId?: string;
    orderId: string;
    unExecutedLineItems?: OrderLineItem[];
}
export type InventoryEventType = "inventoryUpdated" | "inventoryUpdateFailed" | "inventoryCreated" | "inventoryCreationFailed";
export type OrderEventType = "orderPlaced" | "orderModified" | "orderCancelled" | "orderPlacementFailed" | "orderModificationFailed" | "orderCancellationFailed";
