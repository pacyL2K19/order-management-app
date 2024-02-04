import mongoose, { Schema, Types } from "mongoose";
import { Inventory } from "../libs";

const InventorySchema = new Schema(
  {
    // reference to the Product model, we will mock this for now since we don't have a product service
    product: { type: Types.ObjectId, required: true, ref: "Product" },

    quantity: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Inventory>("Inventory", InventorySchema);
