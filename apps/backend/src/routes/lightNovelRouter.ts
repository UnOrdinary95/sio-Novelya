import { Router } from "express";
import { getLightNovels, getLightNovelById, deleteLightNovelById, createLightNovel, updateLightNovelById, uploadCoverById, getLightNovelsByGenre, searchLightNovelByName } from "../controllers/lightNovelController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { uploadCoverMiddleware } from "../middlewares/uploadCoverMiddleware.js";

const lightNovelRouter = Router();

// CREATE
lightNovelRouter.post("/", authMiddleware, createLightNovel);

// READ
lightNovelRouter.get("/", getLightNovels);
lightNovelRouter.get("/search/:name", searchLightNovelByName);
lightNovelRouter.get("/genre/:genre", getLightNovelsByGenre);
lightNovelRouter.get("/:id", getLightNovelById);

// UPDATE
lightNovelRouter.put("/:id", authMiddleware, updateLightNovelById);
lightNovelRouter.patch("/:id/cover", authMiddleware, uploadCoverMiddleware, uploadCoverById);

// DELETE
lightNovelRouter.delete("/:id", authMiddleware, deleteLightNovelById);

export default lightNovelRouter;
