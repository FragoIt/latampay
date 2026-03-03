"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = (0, express_1.Router)();
// Mock database for now
var invoices = [];
router.post('/', function (req, res) {
    var _a = req.body, amount = _a.amount, currency = _a.currency, description = _a.description, client = _a.client;
    if (!amount || !currency) {
        return res.status(400).json({ error: 'Amount and currency are required' });
    }
    var newInvoice = {
        id: "inv_".concat(Date.now()),
        amount: amount,
        currency: currency,
        description: description,
        client: client,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
    invoices.push(newInvoice);
    res.status(201).json(newInvoice);
});
router.get('/:id', function (req, res) {
    var id = req.params.id;
    var invoice = invoices.find(function (inv) { return inv.id === id; });
    if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
});
exports.default = router;
