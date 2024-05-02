const express = require('express')
const colors = require('colors')
const connectDB = require('./config/db')
const errorHandler = require('./middlewares/error')
const cors = require('cors')
const Product = require('./models/products.models')
const array = require('./product.array')

const dotenv = require('dotenv')
dotenv.config()

connectDB()

const app = express()



app.use(express.json())
app.use(express.urlencoded({extended : false}))

app.use(cors())

async function productCreate(){
    const products = await Product.find()
    if(products.length === 0 ){
        await Product.create({product : array})
        return;
    }
    return;
}
productCreate()

app.use('/enterprise', require('./routers/enterprise.router'))
app.use('/proxy', require('./routers/proxy.router'))

app.use(errorHandler)



const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`server run on port ${PORT}`.bgBlue)
})  