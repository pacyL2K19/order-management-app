import Joi from "joi";
import { Model } from "mongoose";

import orderModel from "../models/order.model";
import {
  DEFAULT_SKIP,
  DEFAULT_LIMIT,
  ERROR_DELETING_ORDER,
  ORDER_ALREADY_CANCELLED,
  ORDER_ALREADY_EXECUTED,
  ORDER_CREATION_FAILED,
  ORDER_PARTIALLY_EXECUTED,
  ORDER_UPDATE_FAILED,

  // types
  Order,
  OrderStatus,
} from "../libs";

class OrderService {
  private model: Model<Order>;

  constructor(model: Model<Order>) {
    this.model = model;
  }

  async createOrder(orderData: Order): Promise<Order> {
    try {
      this.validateOrderData(orderData);

      const order = new this.model(orderData);
      const createdOrder = await order.save();
      return createdOrder;
    } catch (error) {
      throw new Error(ORDER_CREATION_FAILED);
    }
  }

  /**
   * @description Get all orders by status (default status is executed) with pagination
   */
  async getAllOrdersByStatus(
    skip = DEFAULT_SKIP,
    limit = DEFAULT_LIMIT,
    status: OrderStatus = OrderStatus.EXECUTED
  ): Promise<Order[]> {
    try {
      // validate the skip and limit values
      if (skip < 0) {
        skip = DEFAULT_SKIP;
      }
      if (limit < 0) {
        limit = DEFAULT_LIMIT;
      }

      const orders = await this.model
        .find({ status })
        .skip(skip)
        .limit(limit)
        .exec();
      return orders;
    } catch (error) {
      throw new Error("Error fetching orders");
    }
  }

  async updateOrder(
    orderId: string,
    updatedOrderData: Partial<Order>
  ): Promise<Order | null> {
    try {
      const updatedOrder = await this.model.findByIdAndUpdate(
        orderId,
        updatedOrderData,
        { new: false }
      );
      return updatedOrder;
    } catch (error) {
      throw new Error(ORDER_UPDATE_FAILED);
    }
  }

  /**
   * @description Delete order by id (soft delete)
   */
  async deleteOrder(orderId: string): Promise<void> {
    try {
      const order = await this.findOrderById(orderId);

      switch (order.status) {
        case OrderStatus.EXECUTED:
          throw new Error(ORDER_ALREADY_EXECUTED);
        case OrderStatus.PARTIALLY_EXECUTED:
          throw new Error(ORDER_PARTIALLY_EXECUTED);
        case OrderStatus.CANCELED:
          throw new Error(ORDER_ALREADY_CANCELLED);
        default:
          await this.cancelOrder(order);
          break;
      }
    } catch (error) {
      throw new Error(ERROR_DELETING_ORDER);
    }
  }

  async findOrderById(orderId: string): Promise<Order> {
    const order = await this.model.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  private async cancelOrder(order: Order): Promise<void> {
    order.lineItems.forEach((lineItem) => {
      lineItem.status = OrderStatus.CANCELED;
    });

    order.status = OrderStatus.CANCELED;
    await order.save();
  }

  // VALIDATION
  private validateOrderData(orderData: Order): void {
    const schema = Joi.object({
      lineItems: Joi.array().items(
        Joi.object({
          product: Joi.string().required(),
          quantity: Joi.number().min(1).required(),
          price: Joi.number().min(0).required(),
        })
      ),
      totalAmount: Joi.number().min(0).required(),
      user: Joi.string().required(),
    });

    const validationResult = schema.validate(orderData);

    if (validationResult.error) {
      throw new Error(validationResult.error.details[0].message);
    }
  }
}

export const orderService = new OrderService(orderModel);
export default OrderService;
