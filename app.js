'use strict';

const express = require('express');
const app = express();
const port = process.env.port || 3025;
const axios = require('axios')

var cors = require('cors');

require('dotenv').config({
    path: __dirname + '/./.env'
})

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

var minutes = 0.3,
    the_interval = minutes * 60 * 1000;
setInterval(() => {

    if (fs.existsSync(file_path)) {

        console.log("Service is reading " + file_path + " every " + minutes + " minutes");
        readLinesFunc();

    } else {
        console.log('no file available named ' + file_path)
    }

}, the_interval);

var read_data = [];
var filtered = [];

const readLinesFunc = () => {
    var rl = readline.createInterface({
        input: fs.createReadStream(file_path),
        output: process.stdout,
        terminal: false
    });

    rl.on('line', (line) => {
        let origin_timestamp = line.substring(0, 12);

        let barcode = line.substring(line.length - 15);
        let barcode2 = barcode.substring(1, 14);

        read_data.push(origin_timestamp + " " + barcode2);

    }).on('close', () => {
        getLastEntry().then(response => {
            console.log('last entry: ' + response);
            var search_item = response.substr(0, response.indexOf(' '));
            console.log('seaching: ' + search_item);

            if (search_item == '') {
                filtered = read_data;

            } else {
                filtered = read_data.filter(function (value, index, arr) {
                    return value > search_item;
                });
            }
            console.log('filtered array length: ' + filtered.length)
            insertData(filtered);
        });
    });

}

function getLastEntry() {
    return axios.post('http://fcl-bc-02:8181/api/last-insert')
        .then(response => {
            return response.data
        })
        .catch(error => {
            console.log(error);
            return Promise.reject(error);
        });
}

const insertData = (filtered) => {
    axios.post('http://fcl-bc-02:8181/api/barcodes-insert', {
            request_data: filtered
        })
        .then(res => {
            console.log(res.data);
        })
        .catch(error => {
            console.error(error)
        })
}

app.listen(port, function () {
    console.log("Read-barcode-lines service started on port " + port);
})