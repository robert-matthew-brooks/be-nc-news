# Northcoders News API

## Live version:

https://be-nc-news-nvms.onrender.com/api

<small><em>(For a formatted view of the json data in Chrome, press `F12`, choose the `Sources` tab, and click the `api` file icon)</em></small>

## Summary

This API was built as part of the Northcoders software development bootcamp I attended. The project was to build an API which mimics a real world backend service, which could then be used to provide information to front end achitecture. The project was built using node/javascript, and it focussed on some key backend topics from the bootcamp:

- Test Driven Development - the design of the api was centred around testing. Using the `jest` npm package, a test suite describing the required behaviours of the endpoints was created. The api code was then written to satisfy these expected behaviours.

- Express - the project makes use of the `express` npm package. This framework allows the api to responds to different urls as well as processing parameters and queries in the urls.

- Postgres - the test data is stored in a `postgres` database. The data can be manipulated for testing with `jest`, or manually with requests from an api tool like `Insomnia`.

- GitHub - the different endpoints of this api were completed as separate branches on `github`, which were added to the main project branch via pull requests. This allowed different sections of the project to be worked on and reviewed a different times and in a different order to the provided tickets.

## How to use this repo

### 1. Clone the repo

To download and use this repo, first clone the project using the following terminal command:

```
git clone https://github.com/robert-matthew-brooks/be-nc-news.git
```

### 2. Install npm packages

This project is dependent on several npm packages, such as `express` and `jest`. These dependencies will need to be installed by navigating to the project root folder and using the following command:

```
npm install
```

### 3. Create environment variable files

The project will need two test databases: a test database for automated jest testing, and a dev database for manual testing. The following two files will need to be created in the project root folder:

`.env.test`

`.env.development`

Each file will need to contain the following line:

```
PGDATABASE=<database_name>
```

Replace `<database_name>` with the actual database name, which can be found in `db/setup.sql`. The reason these files are not included in the repo is because it is common practice to withhold sensitive information (such as database names) from public projects.

### 4. Create the postgresql databases

The database system for this project is `postgres`, which will need to be installed before the databases can be created. There is a `setup-dbs` script in the `package.json` file. This script can be run using the following terminal command:

```
npm run setup-dbs
```

### 5. Seed the databases

There is a script to populate the dev database, which can be run by the following terminal command:

```
npm run seed
```

The test database will automatically populate before each test when the test suite is run.

### 6. Start the dev server

The server is ready to be started with the dev database using the following terminal command:

```
npm run listen
```

The server will continue to listen on local port 9090 until stopped using `Ctrl+C`. To get a response, send a GET request to the following endpoint using a browser or api tool such as `Insomnia`:

```
http://localhost:9090/api
```

The `/api` endpoint lists the other endpoints on this server, and what request/response data you can be expected to send/receive. For a formatted view of the json data in Chrome, press `F12`, choose the `Sources` tab, and click the `api` file icon.

### 7. Run the test suite

The test suite will automatically populate the test database, as well as creating its own server listener. The tests can be run with the following terminal command:

```
npm test app
```

The `jest` test descriptions and results will be displayed in the terminal.

## Requirements:

This package was built with the following software, and may require these versions to run correctly:

- `node: v18.16.0`
- `postgresql: v14.8`