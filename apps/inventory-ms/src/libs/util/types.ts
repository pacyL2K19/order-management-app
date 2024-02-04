import { Document, Types } from "mongoose";

export enum OrderStatus {
  PENDING = "pending", // when the order is created, the status should be pending -- default status
  EXECUTED = "executed", // if all the orderItems are executed, then the order status should be executed
  CANCELED = "canceled", // if the order is canceled, then all the line items should be canceled
  PARTIALLY_EXECUTED = "partially_executed", // this is a custom status that we will use to indicate that some orderItems are executed and some are canceled
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

export type InventoryEventType =
  | "inventoryUpdated"
  | "inventoryUpdateFailed"
  | "inventoryCreated"
  | "inventoryCreationFailed";

export type OrderEventType =
  | "orderPlaced"
  | "orderModified"
  | "orderCancelled"
  | "orderPlacementFailed"
  | "orderModificationFailed"
  | "orderCancellationFailed";
