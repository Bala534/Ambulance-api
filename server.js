let admin = require("firebase-admin");
let serviceAccount = require('./arched-jetty-288812-firebase-adminsdk-vlyx6-3ae0e48ef8.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let express = require("express");
let app = express();
let mongodb = require("mongodb");
let mongojs = require("mongojs");
let FCM = require("fcm-node");
let serverKey = require('./arched-jetty-288812-firebase-adminsdk-vlyx6-3ae0e48ef8.json')
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
    db.users.find({token:data.token},(err,docs) => {
        var len = docs.length
        if(len==1){
            var search = {
                token: data.token
            }
            var upr = {$set: {role:data.role}}
            var upn = {$set: {name:data.name}}
            // updating in database
            db.users.update(search,upr); // role
            db.users.update(search,upn); // name
            res.send('updated role and name')
        }else{
            db.users.insert(data,function(err,docs){
            	if(err){
            		res.send('Something went wrong');
            	}
            	else{
            		res.send('Data inserted');
            	}
            })
        }
    })
})

app.post('/alertdriver', (req,res) => {
    let data = {
        name:req.body.name,
        title:req.body.title,
        body:req.body.body
    }
    db.users.find({role:'driver',name:data.name},(err,docs) => {
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
                token: tok
                };
            messaging.send(payload)
            .then((result) => {
                console.log(result)
            })
        }
    })
})

app.post('/alertpolice', (req,res) => {
    let data = {
        title:req.body.title,
        body:req.body.body
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
                    token: tok
                    };
                messaging.send(payload1)
                .then((result) => {
                    console.log(result)
                })
            }
        }
    })
})

app.post('/alertpatient', (req,res) => {
    let data = {
        name:req.body.name,
        title:req.body.title,
        body:req.body.body
    }
    db.users.find({role:'patient',name:data.name},(err,docs) => {
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
                token: tok
                };
            messaging.send(payload)
            .then((result) => {
                console.log(result)
            })
        }
    })
})

app.listen(8000,(req,res)=>{
    console.log('running')
})
