import express from "express";
import { bankConnectionService } from "../../services/BankConnectionService";

const router = express.Router();

/*
 * GET /api/bank/status/:userId
 */
router.get("/status/:userId", (req, res) => {

    try {

        const userId = Number(req.params.userId);

        const connections =
            bankConnectionService.getConnections(userId);

        res.json({
            ok: true,
            connections
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            message: "Unable to retrieve bank connections."
        });

    }

});

/*
 * POST /api/bank/connect
 *
 * Body
 * {
 *    userId,
 *    setupToken,
 *    friendlyName
 * }
 */
router.post("/connect", async (req, res) => {

    try {

        const {
            userId,
            setupToken,
            friendlyName
        } = req.body;

        if (!userId || !setupToken) {

            return res.status(400).json({
                ok: false,
                message: "Missing required fields."
            });

        }

        const result =
            await bankConnectionService.connectBank(
                Number(userId),
                setupToken,
                friendlyName
            );

        res.json({
            ok: true,
            ...result
        });

    }
    catch (error: any) {

        console.error(error);

        res.status(500).json({
            ok: false,
            message: error.message
        });

    }

});

/*
 * GET /api/bank/accounts/:connectionId
 */
router.get("/accounts/:connectionId", (req, res) => {

    try {

        const connectionId =
            Number(req.params.connectionId);

        const accounts =
            bankConnectionService.getAccounts(
                connectionId
            );

        res.json({
            ok: true,
            accounts
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            message: "Unable to retrieve accounts."
        });

    }

});

export default router;