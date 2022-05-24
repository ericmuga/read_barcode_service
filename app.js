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
const {
    set
} = require('express/lib/application');

let getFilePath = () => {
    let today = new Date().toLocaleDateString().replaceAll('/', '_')
    let filePath = 'D:\\BarcodeLogs\\codeLog-' + today + '.txt';
    return filePath;
}


var minutes = 1,
    the_interval = minutes * 60 * 1000;
setInterval(() => {

    var file_path = getFilePath();

    if (fs.existsSync(file_path)) {

        console.log("Service is reading " + file_path + " every " + minutes + " minutes");
        readLinesFunc(file_path);

    } else {
        console.log('no file available named ' + file_path)
    }

}, the_interval);

const readLinesFunc = (file_path) => {
    var read_data = [];
    var filtered = [];

    var rl = readline.createInterface({
        input: fs.createReadStream(file_path),
        output: process.stdout,
        terminal: false
    });

    rl.on('line', (line) => {
        let line_splits = line.split(" ")
        let origin_timestamp = line_splits[0];
        let scanner_ip = line_splits[1];

        let barcode = line_splits[2];
        // let barcode2 = barcode.substring(1, 14);

        read_data.push(origin_timestamp + " " + scanner_ip + " " + barcode);

    }).on('close', () => {
        getLastEntry().then(response => {
            console.log('last entry: ' + response);

            if (response == '') {
                filtered = read_data;

            } else {
                filtered = read_data.filter(function (value, index, arr) {
                    return value > response;
                });
            }
            console.log('filtered array length: ' + filtered.length)
            insertData(filtered);
        });
    });
}

function getLastEntry() {
    // return axios.post('http://fcl-bc-02:8181/api/last-insert')
    return axios.post('http://localhost:8181/api/last-insert')
        .then(response => {
            return response.data
        })
        .catch(error => {
            console.log(error);
            return Promise.reject(error);
        });
}

const insertData = (filtered) => {
    // axios.post('http://fcl-bc-02:8181/api/barcodes-insert', {
    axios.post('http://localhost:8181/api/barcodes-insert', {
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
    console.log(`Read-barcode-lines service running on port ${port}`);
})