import { Router } from "express";
import { sayHello } from "../controllers/testController.js";

const testRouter = Router();

testRouter.get("/", sayHello);

export default testRouter;