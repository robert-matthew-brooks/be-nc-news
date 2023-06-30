function appErrorHandler(err, req, res, next) {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg });
    }
    else next(err);
}

function psqlErrorHandler(err, req, res, next) {
    if (err.code === '42P01') {
        res.status(500).send({ msg: 'undefined table' });
    }

    else if (err.code === '22P02') {
        res.status(400).send({ msg: 'invalid text representation' });
    }

    else if (err.code === '23503') {
        res.status(400).send({ msg: 'foreign key violation' });
    }

    else if (err.code) {
        res.status(500).send({ msg: `unhandled psql error: ${err}` });
    }
    else next(err);
}

function serverErrorHandler(err, req, res, next) {
    res.status(500).send({ msg: `unhandled internal server error: ${err}` });
}

module.exports = {
    appErrorHandler,
    psqlErrorHandler,
    serverErrorHandler
};