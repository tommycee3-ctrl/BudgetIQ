import express from "express";

const router = express.Router();

router.get("/status", (_req, res) => {

    res.json({
        connected: false,
        provider: "SimpleFIN",
        lastSync: null,
        accounts: [],
        message: "Bank connection not configured."
    });

});

router.post("/connect", (_req, res) => {

    res.status(501).json({
        ok: false,
        message: "SimpleFIN connection not implemented yet."
    });

});

router.post("/sync", (_req, res) => {

    res.status(501).json({
        ok: false,
        message: "Bank sync not implemented yet."
    });

});

export default router;