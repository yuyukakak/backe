const express = require('express');
const bcrypt = require('bcrypt');
const { Account } = require('../models');
const { accountSignUp, accountSignIn } = require('../validators/account');
const { getMessage } = require('../helpers/messages');
const { generateJwt, generateRefreshJwt, getTokenFromHeaders, verifyRefreshJwt, verifyJwt } = require('../helpers/jwt');

const router = express.Router();
const saltOrRound = 10;

router.post('/sign-in', accountSignIn, async (req, res) => {
    const { email, password } = req.body;

    const account = await Account.findOne({ where: { email } });

    //Validate password
    const match = account ? bcrypt.compareSync(password, account.password) : null;
    if (!match) return res.jsonBadRequest(null, getMessage('account.signin.invalid'));

    const token = generateJwt({ id: account.id });
    const refreshToken = generateRefreshJwt({ id: account.id, version: account.jwtVersion });

    return res.jsonOk(account, getMessage('account.signin.success'), { token, refreshToken });
});

router.post('/sign-up', accountSignUp, async (req, res) => {

    const { email, password } = req.body;

    const account = await Account.findOne({ where: { email } });

    if (account) return res.jsonBadRequest(null, getMessage('account.signup.email_exists'));

    const hash = bcrypt.hashSync(password, saltOrRound);
    const newAccount = await Account.create({ email, password: hash });

    const token = generateJwt({ id: newAccount.id });
    const refreshToken = generateRefreshJwt({ id: newAccount.id, version: newAccount.jwtVersion });

    return res.jsonOk(newAccount, getMessage('account.signup.success'), { token, refreshToken });
});

router.post('/refresh', async (req, res) => {
    const token = getTokenFromHeaders(req.headers);
    if (!token) return res.jsonUnauthorized(null, 'Invalid token');

    try {
        const decoded = verifyRefreshJwt(token);
        const account = await Account.findByPk(decoded.id);

        if (!account) return res.jsonUnauthorized(null, 'Invalid token');

        if (decoded.version !== account.jwtVersion) {
            return res.jsonUnauthorized(null, 'Invalid token');
        }

        const meta = {
            token: generateJwt({ id: account.id })
        }

        return res.jsonOk(null, null, meta);

    } catch (error) {
        return res.jsonUnauthorized(null, error.message);
    }

});

module.exports = router;