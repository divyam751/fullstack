const { routes } = require("express");

const app = routes();

app.get("/",(req,res)=>{
    res.send("")
})