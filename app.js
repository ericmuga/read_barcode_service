const express = require('express');
const app = express();
const port = process.env.port || 3020;

var sql = require("mssql");
var cors = require('cors');


// Body Parser Middleware
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.use(cors());

const readline = require('readline');
const fs = require('fs');
var file = 'C:\\Users\\EKaranja\\OneDrive - Farmers Choice Limited\\Documents\\DataMax\\log\\codeLog_20210805.txt';

var minutes = 1,
    the_interval = minutes * 60 * 1000;
setInterval(function () {

    var rl = readline.createInterface({
        input: fs.createReadStream(file),
        output: process.stdout,
        terminal: false
    });

    console.log("I am reading every 6 seconds");
    readLinesFunc(rl);

}, the_interval);

var rl = readline.createInterface({
        input: fs.createReadStream(file),
        output: process.stdout,
        terminal: false
    });

const data = [];

function readLinesFunc(rl) {
    rl.on('line', function (line) {
        let origin_timestamp = line.substring(0, 12);

        let barcode = line.substring(line.length - 15);
        let barcode2 = barcode.substring(1, 14);

        data.push(origin_timestamp+" "+barcode2); 
    });
    

    //Initializing connection string
    var dbConfig = {
        user: "sa",
        password: "switcher@Dev12",
        server: "localhost",
        port: 1433,
        database: "calibra",
        stream: false,
        options: {
            trustedConnection: true,
            encrypt: true,
            enableArithAbort: true,
            trustServerCertificate: true,

        },
    };

    var dbConn = new sql.ConnectionPool(dbConfig);
    dbConn.connect().then(function () {
 
        console.log("Connected to db");
            
        for(let i = 0; i < data.length; i++){ 
            // console.log(data[i]);
            var k1 = data[i].substring(0, 12);
            var k2 = data[i].substring(13, 28);
            var k3 = "'"+k1+"'";

            var sql = "INSERT INTO sausage_entries (origin_timestamp, barcode) VALUES ("+k3+", "+k2+")";
            dbConn.query(sql, function (err, result) {
                if (err) {
                    console.log(err);
                }
                console.log("1 record inserted");
            });
            
        }
        
    });

}

app.listen(port, function () {
    console.log("Read-barcode-lines service started on port " + port);
})