# Northcoders News API

## Setup test databases

This project uses two test databases:

1. database for automated jest testing
2. database for manual development testing

The names of the databases must be provided as enviroment variables. The can be done install the `dotenv` npm package and creating the following files in the root folder:

```
.env.test
.env.development
```

The names are stored in these files in the following format:

```
PGDATABASE=<database_name>
```

The actual database names can be found in `db/setup.sql`.