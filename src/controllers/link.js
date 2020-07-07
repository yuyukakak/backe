const express = require('express');

const { Link } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
    const accountId = 1;
    const links = await Link.findAll({ where: { accountId } });
    return res.jsonOk(links);
});

router.get('/:id', async (req, res) => {
    const accountId = 1;
    const { id } = req.params;

    const link = await Link.findOne({ where: { id, accountId } });
    if (!link) return res.jsonNotFound();

    return res.jsonOk(link);
});

router.post('/', async (req, res) => {
    const accountId = 1;
    const { label, url, isSocial } = req.body;

    const image = 'https://google.com/image.jpg';

    const link = await Link.create({ label, url, isSocial, image, accountId });
    return res.jsonOk(link);
});

router.put('/:id', async (req, res) => {
    const accountId = 1;
    const { id } = req.params;
    const { body } = req;
    const fields = ['label', 'url', 'isSocial'];

    const link = await Link.findOne({ where: { id, accountId } });
    if (!link) return res.jsonNotFound();

    fields.map(fieldName => {
        const newValue = body[fieldName];
        if (newValue != undefined) link[fieldName] = newValue;
    });

    await link.save();

    return res.jsonOk(link);

});

router.delete('/:id', async (req, res) => {
    const accountId = 1;
    const { id } = req.params;
    const link = await Link.findOne({ where: { id, accountId } });
    if(!link) return res.jsonNotFound();

    await link.destroy();
    return res.jsonOk();
});

module.exports = router;