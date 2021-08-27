'use strict';


var sql = require("mssql");
var dbPool;

var dbConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    stream: false,
    options: {
        trustedConnection: true,
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: true,

    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 10000
    },
};
const dbConnect = () => {
    return new Promise(function (resolve, reject) {

        if (dbPool === undefined) {
            var dbConn = new sql.ConnectionPool(dbConfig);
            dbConn.connect()
                .then(function (pool) {
                    dbPool = pool;
                    console.log("Connected to db");
                    resolve(dbPool);
                })
                .catch(function () {
                    console.log('Error occured in db connection');
                    reject();
                });

        } else {
            console.log('already connected');
            resolve(dbPool);
        }

    });

}

module.exports = {
    sql,
    dbConnect
};