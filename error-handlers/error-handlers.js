function appErrorHandler(err, req, res, next) {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg });
    }
    else next(err);
}

function psqlErrorHandler(err, req, res, next) {
    if (err.code === '42P01') {
        res.status(500).send({ msg: `table not found` });
    }
    else if (err.code) {
        res.status(500).send({ msg: `unhandled psql error: ${err.code}` });
    }
    else next(err);
}

function serverErrorHandler(err, req, res, next) {
    res.status(500).send({ msg: 'unhandled internal server error' });
}

module.exports = {
    appErrorHandler,
    psqlErrorHandler,
    serverErrorHandler
};