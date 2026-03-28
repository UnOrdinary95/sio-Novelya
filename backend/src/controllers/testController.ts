import { Request, Response } from "express";

export const sayHello = (req: Request, res: Response): void => {
    res.json({ message: 'Hello World depuis le contrôleur ! 👋' });
};