import express from "express";

const router = express.Router();

router.get("/status", (_req, res) => {
    res.json({
        connected: false,
        provider: "SimpleFIN",
        lastSync: null,
        accounts: []
    });
});

export default router;
