import mongoose, { Schema, Types } from "mongoose";
import { Order, OrderStatus } from "../libs";

/**
 * OrderLineItemSchema is a subdocument schema for the Order model - it is not a model itself - it is used to define the lineItems array in the Order model
 */
const OrderLineItemSchema = new Schema({
  // reference to the Product model, we will mock this for now since we don't have a product service
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },

  quantity: { type: Number, required: true, min: 1 },

  // total price for this line item = quantity * price -- calculated on the client side - product price can change over time -- promotion, discount, etc. - managed from the product service and client side
  price: { type: Number, required: true, min: 0 },

  // the status should exclude the PARTIALLY_EXECUTED status if there is not enough quantity to execute the line item, then the status should be CANCELED
  status: {
    type: String,
    enum: Object.values(OrderStatus).filter(
      (status) => status !== OrderStatus.PARTIALLY_EXECUTED
    ),
    required: true,
    default: OrderStatus.PENDING,
  },
});

const OrderSchema = new Schema(
  {
    // we will use a mock user for now since we don't have a user service, but we will use a real user in the future
    user: { type: Types.ObjectId, required: true, ref: "User" },

    status: { type: String, enum: Object.values(OrderStatus), required: true, default: OrderStatus.PENDING },

    // total amount for the order = sum of all line items total price
    totalAmount: { type: Number, required: true, min: 0 },

    lineItems: [OrderLineItemSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Order>("Order", OrderSchema);
