import { Request, Response, Router } from "express";
import OrderController from "../controllers/order.controller";

const orderController = new OrderController();
const router = Router();

router.post("/", (req: Request, res: Response) => {
  orderController.placeOrder(req, res);
});

router.get("/", (req: Request, res: Response) => {
  orderController.listOrders(req, res);
});

router.patch("/:orderId", (req: Request, res: Response) => {
  orderController.updateOrder(req, res);
});

router.delete("/:orderId", (req: Request, res: Response) => {
  orderController.deleteOrder(req, res);
});

// ADDITIONAL ROUTES HERE

export default router;
