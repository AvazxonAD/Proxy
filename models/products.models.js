const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    product : [{
        type : String
    }]
}, {timestamps : true}
)

module.exports = mongoose.model('product', productSchema)