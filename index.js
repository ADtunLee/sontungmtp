var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer  = require('multer');


app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.listen(8000);

const { Pool, Client } = require('pg');
const connectionString = 'postgresql://postgres:andrelam123@localhost:5432/sontunmtp';
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const client = new Client({
    connectionString: connectionString,
  });
  
const pool = new Pool({
    connectionString: connectionString,
  });

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/upload')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
 });
  
var upload = multer({ storage: storage }).single('uploadfile');
client.connect();

app.get('/', function(req, res){
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fectching client from pool', err);
        }
        client.query('select * from video', function(err,result){
            done();

            if(err){
                res.end();
                return console.error('error running query', err);
            }
            res.render('home',{data:result});
        });
    });
});

app.get('/video/list', function(req, res){
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fectching client from pool', err);
        }
        client.query('select * from video', function(err,result){
            done();

            if(err){
                res.end();
                return console.error('error running query', err);
            }
            res.render('list',{data:result});
        });
    });
})
app.get('/video/delete/:id', function(req, res){
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fectching client from pool', err);
        }
        client.query('delete from video where id ='+req.params.id, function(err,result){
            done();

            if(err){
                res.end();
                return console.error('error running query', err);
            }
            res.redirect('../list')
        });
    });
})
app.get('/video/add',function(req,res){
    res.render('add');
})
app.post('/video/add',urlencodedParser,function(req,res){
    upload(req, res, function (err) {
        if (err) {
          res.send('lỗi')
        } else {
           if(req.file == undefined){
                res.send('chưa tải file');
           }else{
                pool.connect(function(err, client, done){
                    if(err){
                        return console.error('error fectching client from pool', err);
                    }
                    var sql = "insert into video (id, tieude, mota, key, image) values('"+Math.floor(Math.random() * 300)+"','"+req.body.tieude+"','"+req.body.mota+"','"+req.body.key+"','"+req.file.originalname+"')"
                    client.query(sql, function(err,result){
                        done();
            
                        if(err){
                            res.end();
                            return console.error('error running query', err);
                        }
                        res.redirect('./list')
                    });
                });
           }
        }
    
        // Everything went fine.
      })
})
app.get('/video/edit/:id', function(req, res){
    var id = req.params.id;
    pool.connect(function(err, client, done){
        if(err){
            return console.error('error fectching client from pool', err);
        }
        client.query('select * from video where id ='+id, function(err,result){
            done();

            if(err){
                res.end();
                return console.error('error running query', err);
            }
            res.render('edit', {data: result.rows[0]});
        });
    });
})