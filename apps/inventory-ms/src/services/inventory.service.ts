import Joi from "joi";
import { Model } from "mongoose";
import inventoryModel from "../models/inventory.model";
import { Inventory } from "../libs";

class InventoryService {
  private model: Model<Inventory>;

  constructor(model: Model<Inventory>) {
    this.model = model;
  }

  async createInventory(inventoryData: Inventory): Promise<Inventory> {
    try {
      this.validateInventoryData(inventoryData);
      const inventory = new this.model(inventoryData);
      const createdInventory = await inventory.save();
      return createdInventory;
    } catch (error) {
      throw new Error("Error creating inventory");
    }
  }

  // UPDATE INVENTORY QUANTITY
  async updateInventoryQuantity(
    productId: string,
    quantity: number
  ) {
    try {
      const inventory = await this.model.findOneAndUpdate(
        { product: productId },
        { quantity },
      );

      return inventory;
    } catch (error) {
      throw new Error("Error updating inventory quantity");
    }
  }

  // GET INVENTORY BY PRODUCT ID
  async getInventoryByProductId(productId: string) {
    try {
      const inventory = await this.model.findOne({ product: productId });

      return inventory;
    } catch (error) {
      throw new Error("Error fetching inventory");
    }
  }

  // VALIDATION USING JOI
  private validateInventoryData(inventoryData: Inventory) {
    const schema = Joi.object({
      product: Joi.string().required(),
      quantity: Joi.number().min(0).required(),
    });

    const validationResult = schema.validate(inventoryData);

    if (validationResult.error) {
      throw new Error(validationResult.error.details[0].message);
    }
  }
}

export const inventoryService = new InventoryService(inventoryModel);
export default InventoryService;
