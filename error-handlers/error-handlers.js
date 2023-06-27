class ErrorHandlers {
    static fsErrorHandler(err, req, res, next) {
        if (err.code === 'ENOENT') {
            res.status(500).send({ msg: 'file not found' });
        }
        else next(err);
    }

    static psqlErrorHandler(err, req, res, next) {
        if (err.code === '42P01') {
            res.status(500).send({ msg: `table not found` });
        }
        else if (err.code) {
            res.status(500).send({ msg: `unhandled psql error: ${err.code}` });
        }
        else next(err);
    }

    static serverErrorHandler(err, req, res, next) {
        res.status(500).send({ msg: 'unhandled internal server error' });
    }
}

module.exports = ErrorHandlers;