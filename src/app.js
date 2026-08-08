import express from 'express'
const app = express()
app.get('/', (req, res) => {
    res.send("Hi this is backend speaking")
})

export {app}