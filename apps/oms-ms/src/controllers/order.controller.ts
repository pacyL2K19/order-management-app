import { Request, Response } from "express";

import OrderService from "../services/order.service";
import OrderProducer from "../kafka/order.producer";
import orderModel from "../models/order.model";

import { APIResponse } from "../libs/util/api-response";

import {
  CREATED_CODE,
  INVALID_REQUEST,
  NOT_FOUND_CODE,
  ORDER_CREATION_FAILED,
  ORDER_DELETION_FAILED,
  ORDER_DELETION_SUCCESSFUL,
  ORDER_MODIFICATION_SUCCESSFUL,
  ORDER_NOT_FOUND,
  ORDER_PLACEMENT_SUCCESSFUL,
  ORDER_RETREIVAL_SUCCESSFUL,
  ORDER_UPDATE_FAILED,
  SUCCESS_CODE,
} from "../libs/index";

import { OrderStatus } from "../libs/util/types";

class OrderController {
  private orderService: OrderService;
  private orderProducer: OrderProducer;

  constructor() {
    this.orderService = new OrderService(orderModel);
    this.orderProducer = OrderProducer.getInstance();
  }

  async placeOrder(req: Request, res: Response) {
    try {
      const orderData = req.body;
      const createdOrder = await this.orderService.createOrder(orderData);

      await this.orderProducer.publishOrderPlacedEvent(createdOrder);

      const response = APIResponse.success(
        createdOrder,
        ORDER_PLACEMENT_SUCCESSFUL
      );

      res.status(CREATED_CODE).json(response.toJSON());
    } catch (error: any) {
      console.log("Error placing order", error);

      const response = APIResponse.error(
        error?.message.toString() ?? ORDER_CREATION_FAILED
      );

      res.status(400).json(response.toJSON());
    }
  }

  async listOrders(req: Request, res: Response) {
    try {
      const { skip = "0", limit = "10", status = OrderStatus.EXECUTED } = req.query;
      const orders = await this.orderService.getAllOrdersByStatus(
        parseInt(skip.toString(), 10),
        parseInt(limit.toString(), 10),
        status as OrderStatus,
      );

      const response = APIResponse.success(orders, ORDER_RETREIVAL_SUCCESSFUL);

      res.status(SUCCESS_CODE).json(response.toJSON());
    } catch (error: any) {
      const response = APIResponse.error(
        error?.message.toString() ?? INVALID_REQUEST
      );

      res.status(400).json(response.toJSON());
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const updatedOrderData = req.body;
      const updatedOrder = await this.orderService.updateOrder(
        orderId,
        updatedOrderData
      );

      if (!updatedOrder) {
        const response = APIResponse.error(ORDER_NOT_FOUND);
        res.status(NOT_FOUND_CODE).json(response.toJSON());
        return;
      }

      await this.orderProducer.publishOrderModifiedEvent(updatedOrder);

      const response = APIResponse.success(
        updatedOrder,
        ORDER_MODIFICATION_SUCCESSFUL
      );

      res.status(SUCCESS_CODE).json(response.toJSON());
    } catch (error: any) {
      const response = APIResponse.error(
        error?.message.toString() ?? ORDER_UPDATE_FAILED
      );

      res.status(400).json(response.toJSON());
    }
  }

  async deleteOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      await this.orderService.deleteOrder(orderId);

      const response = APIResponse.success(
        {},
        ORDER_DELETION_SUCCESSFUL,
      );

      res.status(SUCCESS_CODE).json(response.toJSON());
    } catch (error: any) {
      const response = APIResponse.error(
        error?.message.toString() ?? ORDER_DELETION_FAILED
      );

      res.status(400).json(response.toJSON());
    }
  }
}

export default OrderController;
