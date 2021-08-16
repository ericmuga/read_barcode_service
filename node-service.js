const Service = require('node-windows').Service

const svc = new Service({
    name: "Read-Barcodes-Service",
    description: "Read barcodes lines Node Service",   
    script: "D:\\projects\\fcl\\read-scale-nodejs\\app.js"
})

svc.on('install', function(){
    svc.start()
})

svc.install()