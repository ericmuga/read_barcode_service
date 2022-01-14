const Service = require('node-windows').Service

const svc = new Service({
    name: "Read-Barcodes-Service",
    description: "Read Barcode Lines Service",
    script: "D:\\projects\\fcl\\nodejs-read-barcode-lines\\app.js"
})

svc.on('install', function () {
    svc.start()
})

svc.install()