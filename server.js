let admin = require("firebase-admin");
let serviceAccount = require('./ambulance-2-e9b86-firebase-adminsdk-z4mvm-d92b82d770.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let express = require("express");
let app = express();
let mongodb = require("mongodb");
let mongojs = require("mongojs");
let FCM = require("fcm-node");
let serverKey = require('./ambulance-2-e9b86-firebase-adminsdk-z4mvm-d92b82d770.json')
let fcm = new FCM(serverKey)
let bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// database setup
const cs="mongodb://balamahesh:balamahesh@ac-ksc2ibe-shard-00-00.5bnlukb.mongodb.net:27017,ac-ksc2ibe-shard-00-01.5bnlukb.mongodb.net:27017,ac-ksc2ibe-shard-00-02.5bnlukb.mongodb.net:27017/ambulance?ssl=true&replicaSet=atlas-5kgaa4-shard-0&authSource=admin&retryWrites=true&w=majority"
const db=mongojs(cs,["users"])

app.get('/', (req,res) => {
    res.send('Welcome to api')
})

app.post('/saveuser', (req,res) => {
    let data = {
		role:req.body.role,
		name:req.body.name,
		token:req.body.token
	} 
    db.users.find({name:data.name,role:data.role},(err,docs) => {
        db.users.remove({name:data.name,role:data.role})
        db.users.insert(data,function(err,docs){
            res.send('Data inserted')
        })
    })
    db.users.find({token:data.token}, (err,docs) => {
        db.users.remove({token:data.token})
        db.users.insert(data,function(err,docs){
            console.log('Data inserted')
        })
    })
})

app.post('/alertdriver', (req,res) => {
    let data = {
        name:req.body.name,
        title:req.body.title,
        body:req.body.body,
        id:req.body.id
    }
    console.log(req.body)
    db.users.find({role:'driver',name:data.name},(err,docs) => {
        if(err){
            res.send('Something went wrong');
        }else{
            let tok = docs[0].token
            console.log(tok)
            let messaging = admin.messaging()
            var payload = {
                notification: {
                    title: data.title,
                    body: data.body
                },
                data: {
                    id: data.id,
                },
                token: tok
                };
            messaging.send(payload)
            .then((result) => {
                console.log(result)
            })
            res.send("Done")
        }
    })
})

app.post('/alertpolice', (req,res) => {
    let data = {
        title:req.body.title,
        body:req.body.body,
        id:req.body.id
    }
    db.users.find({role:'police'},(err,docs) => {
        if(err){
            res.send('Something went wrong');
        }else{
            let len = docs.length
            for(let i=0;i<len;i++){
                let tok = docs[i].token
                let messaging = admin.messaging()
                var payload1 = {
                    notification: {
                        title: data.title,
                        body: data.body
                    },
                    data: {
                        id: data.id,
                    },
                    token: tok
                    };
                messaging.send(payload1)
                .then((result) => {
                    console.log(result)
                })
                res.send("Done")
            }
        }
    })
})

app.post('/alertpatient', (req,res) => {
    let data = {
        name:req.body.name,
        title:req.body.title,
        body:req.body.body,
        id:req.body.id
    }
    db.users.find({role:'user',name:data.name},(err,docs) => {
        if(err){
            res.send('Something went wrong');
        }else{
            let tok = docs[0].token
            let messaging = admin.messaging()
            var payload = {
                notification: {
                    title: data.title,
                    body: data.body
                },
                data: {
                    id: data.id,
                },
                token: tok
                };
            messaging.send(payload)
            .then((result) => {
                console.log(result)
            })
            res.send("Done")
        }
    })
})

app.listen(8000,(req,res)=>{
    console.log('running')
})
