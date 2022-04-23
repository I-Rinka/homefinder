import Express from "express";
import cors from "cors" 
import { api } from "./api/index.js";
import express from "express";
const app = Express();

app.use(cors());
app.use(express.json({limit: '5mb'}))

app.get('/', (req, res) => res.send('Use /api/ to send request!'));

app.use('/api', api);

let server = app.listen(27727, () => {
    let port = server.address().port;
    console.log(`Application running at: http://localhost:${port}`)
})