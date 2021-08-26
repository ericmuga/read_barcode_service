'use strict';

const express = require('express');
const app = express();
const port = process.env.port || 3020;

require('dotenv').config({
    path: __dirname + '/./.env'
})



var {
    sql,
    dbConnect
} = require('./db.connect');
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
var file_name = 'codeLog_' + today + '.txt';
var file_path = 'C:\\Users\\EKaranja\\OneDrive - Farmers Choice Limited\\Documents\\DataMax\\log\\' + file_name;


var minutes = 0.1,
    the_interval = minutes * 60 * 1000;
setInterval(() => {

    if (fs.existsSync(file_path)) {

        console.log("Service is reading " + file_path + " every " + minutes + " minutes");
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

    rl.on('line', (line) => {
        let origin_timestamp = line.substring(0, 12);

        let barcode = line.substring(line.length - 15);
        let barcode2 = barcode.substring(1, 14);

        data.push(origin_timestamp + " " + barcode2);

    }).on('close', () => {
        insert();
    });

}

const insert = () => {
    dbConnect()
        .then(function (pool) {
            for (let i = 0; i < data.length; i++) {
                var k1 = data[i].substring(0, 12) + ' ' + today;
                var k2 = data[i].substring(13, 28);

                var k3 = "'" + k1 + "'";

                // console.log(k1, k3);

                var stmt = "INSERT INTO sausage_entries (origin_timestamp, barcode) VALUES (" + k3 + ", " + k2 + ") ";
                // console.log('before insert');
                var request = new sql.Request(pool);
                request.query(stmt, function (err, result) {

                    if (err) {
                        // console.log(err);
                        return;
                    }
                    // console.log('result', result);
                    if (i == 1) {
                        // console.log('started inserting .....');

                    } else if (i == (data.length - 1)) {
                        console.log('done inserting');
                    }
                });

            }
        }).catch(function () {
            console.log('error from connection');
        });
}

app.listen(port, function () {
    console.log("Read-barcode-lines service started on port " + port);
})