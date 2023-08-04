var express = require('express')
var cors = require('cors')
var app = express()

var bodyParser = require("body-parser")
var jsonParser = bodyParser.json()

const dbCon = require('./config/db');
const bcrypt = require('bcrypt');


const saltRounds = 10


var jwt = require('jsonwebtoken')
const secretKey = "fullstack-login-2021"    // คีย์ลับที่ปลอดภัยเพื่อเซ็นต์และถอดรหัส JWT

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// homepage route
app.get('/', (req, res) => {
    return res.send({ 
        error: false, 
        message: 'Welcome to RESTful CRUD API with NodeJS, Express, MYSQL',
        written_by: 'yongyut',
    })
})

app.post('/register' ,(req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let fname = req.body.fname;
    let lname = req.body.lname;

    // validation data
    if (!email || !password || !fname || !lname) {
        return res.status(400).send({
            error: true,
            message: "Please input data."});      
    } else {
        bcrypt.hash(password , saltRounds, function(err, hash) {
            dbCon.query('insert into users (email,password,fname,lname) values(?,?,?,?)', [email, hash , fname, lname], (error, results, fields) => {
                res.json({status:"OK register success "})
                console.log(results); // results contains rows returned by server
                if (error){
                    res.json({status: "error", message: err})
                    return  
                }
            })           
        })
    }

});
   
app.post('/login',jsonParser, function (req, res, next) {
    dbCon.query('select * from users where email = ?',[req.body.email],function(err, users, fields) {
        if (err){res.json({status: "error", message: err}); return }
            if (users.length == 0 ){
                res.json({status:"error",mesage: "no user found"}); return}
                bcrypt.compare(req.body.password, users[0].password, function(err, islogin) {
                    if (islogin){
                        // ข้อมูลที่ต้องการเก็บใน Token
                        const payload = {email:users[0].email }
                        // ตัวเลือกสำหรับ JWT (เช่น เวลาหมดอายุ)
                        const options = {expiresIn: '1h',};
                        // สร้าง Token
                        const token = jwt.sign(payload, secretKey , options);
                        //const token = jwt.sign({ email:users[0].email },secretKey);
                        console.log(token);
                        res.json({status: "ok", message: "login success", token})
                        // res.status(200).json({
                        //     message : "login success",
                        //     datatoken : token
                        // })
                    } else {
                    res.json({status: "error",message: "login failed"})
                    }
                });
        }
    );
});


//ทำการ verifly token
app.post('/authen',jsonParser, function (req, res, next) {
    try{
        const token = req.headers.authorization.split(' ')[1]
        let decoded = jwt.verify(token,secretKey) 
        res.json({status: "ok", decoded})
        //console.log(decoded)

    } catch(err){
        res.json({status:"error", message: err.message})//ต้องการส่งผลลัพธ์กลับไปเป็น JSON 
    }
    //res.json({token})

});
app.listen(5000, function () {
  console.log('CORS-enabled web server listening on port 5000')
})
