const express = require('express');
const bcrypt = require('bcrypt');
const { Account } = require('../models');
const { accountSignUp, accountSignIn } = require('../validators/account');
const { getMessage } = require('../helpers/messages');
const { generateJwt, generateRefreshJwt } = require('../helpers/jwt');

const router = express.Router();
const saltOrRound = 10;

router.post('/sign-in', accountSignIn, async (req, res) => {
    const { email, password } = req.body;

    const account = await Account.findOne({ where: { email } });

    //Validate password
    const match = account ? bcrypt.compareSync(password, account.password) : null;
    if(!match) return res.jsonBadRequest(null, getMessage('account.signin.invalid'));

    const token = generateJwt({ id: account.id });
    const refreshToken = generateRefreshJwt({ id: account.id });

    return res.jsonOk(account, getMessage('account.signin.success'), {token, refreshToken});
});

router.post('/sign-up', accountSignUp, async (req, res) => {

    const { email, password } = req.body;

    const account = await Account.findOne({ where: { email } });

    if (account) return res.jsonBadRequest(null, getMessage('account.signup.email_exists'));

    const hash = bcrypt.hashSync(password, saltOrRound);
    const newAccount = await Account.create({ email, password: hash });

    return res.jsonOk(newAccount, getMessage('account.signup.success'), { token, refreshToken });
});

module.exports = router;