'use strict';

const express = require('express');
const app = express();
const port = process.env.port || 3020;

require('dotenv').config({path:__dirname+'/./.env'})

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

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = yyyy + mm + dd;
var file_name = 'codeLog_'+ today + '.txt';
var file_path = 'C:\\Users\\EKaranja\\OneDrive - Farmers Choice Limited\\Documents\\DataMax\\log\\'+  file_name;


var minutes = 0.1,
    the_interval = minutes * 60 * 1000;
setInterval(function () {

    if (fs.existsSync(file_path)) {

        console.log("Service is reading "+ file_path +" every "+ minutes +" minutes");
        readLinesFunc();
        
    } else {
        console.log('no file available')
    }

}, the_interval);



const data = [];

function readLinesFunc() {
    var rl = readline.createInterface({
        input: fs.createReadStream(file_path),
        output: process.stdout,
        terminal: false
    });

    rl.on('line', function (line) {
        let origin_timestamp = line.substring(0, 12);

        let barcode = line.substring(line.length - 15);
        let barcode2 = barcode.substring(1, 14);

        data.push(origin_timestamp+" "+barcode2); 
    });

    //Initializing connection string
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
    };

    var dbConn = new sql.ConnectionPool(dbConfig);
    dbConn.connect().then(function () {
 
        console.log("Connected to db");
            
        for(let i = 0; i < data.length; i++) { 
            // console.log(data[i]);
            var k1 = data[i].substring(0, 12) + ' ' + today;
            var k2 = data[i].substring(13, 28);

            var k3 = "'"+k1+"'";

            var sql = "INSERT INTO sausage_entries (origin_timestamp, barcode) VALUES ("+k3+", "+k2+") ";
            dbConn.query(sql, function (err, result) {
                if (err) {
                    // console.log(err);
                }
                
                if(i == 1){
                    console.log('started inserting .....');  

                } else if (i == (data.length - 1)) {
                    console.log('done inserting'); 
                }
            });
                       
        }
        
    });

}

app.listen(port, function () {
    console.log("Read-barcode-lines service started on port " + port);
})