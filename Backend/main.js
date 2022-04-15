import Express from "express";
import { processData } from "../script/upload_data.js"
import { cors } from "./cors.js";

processData("./script/dataset/house_deal.xlsx")


const app = Express();
app.use(cors);

app.get('/', (req, res) => res.send('Hello!'));

let server = app.listen(27727, () => {
    let port = server.address().port;
    console.log(`Application running at: http://localhost:${port}`)
})