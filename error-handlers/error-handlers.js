class ErrorHandlers {
    static psqlErrorsHandler(err, req, res, next) {
        if (err.code === '42P01') {
            res.status(500).send({ msg: `table not found` });
        }
        else if (err.code) {
            res.status(500).send({ msg: `unhandled psql error: ${err.code}` });
        }
        else next(err);
    }

    static serverErrorsHandler(err, req, res, next) {
        res.status(500).send({ msg: 'unhandled internal server error' });
    }
}

module.exports = ErrorHandlers;