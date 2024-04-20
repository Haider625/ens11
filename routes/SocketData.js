const express = require('express');

const {

    getMessageSocket,
    getsMessageSocket,
    createMessageSocket,
    deleteMessageSocket,
    updateMessageSocket
} = require('../serves/SocketData');

const auth = require('../serves/auth');

const router = express.Router();

router.use(auth.protect);

router.route('/')
.get(getsMessageSocket)
.post(createMessageSocket);

router.route('/:id')
.get(getMessageSocket)
.delete(deleteMessageSocket)
.put(updateMessageSocket)

module.exports = router;