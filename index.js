const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const path = require("path");
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const app = express();
const db = new sqlite3.Database('./database/client.db');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./')));
app.use(fileUpload());
db.run('CREATE TABLE IF NOT EXISTS client(name TEXT, amount TEXT,imageUrl TEXT)');

app.get('/', function(req,res){
    res.sendFile(path.join(__dirname,'./index.html'));
  });
app.post('/add', function(req,res){
      // console.log(req.body);
   let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.file;
  uploadPath = __dirname + '/images/' + sampleFile.name;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(uploadPath, function(err) {
    if (err)
      return res.status(500).send(err);

    
  });
   db.serialize(()=>{
    db.run('INSERT INTO client(name,amount,imageUrl) VALUES(?,?,?)', [req.body.first_name, req.body.amount,sampleFile.name], function(err) {
      if (err) {
        return console.log(err.message);
      }
      console.log("New client has been added");
      res.sendFile(path.join(__dirname,'./index.html'));
    });
});
   
  });
app.get('/view',async (req,res)=>{
    const response = await selectAll();
    if(response){
         console.log(response)
        res.setHeader('Content-Type','application/json')
        res.status(200).send(JSON.stringify(response));
    }
    
})
async function selectAll() {
    return new Promise((resolve, reject) => {
        const dataset = []
        try {
            db.serialize(function () {
                db.each("SELECT name, amount ,imageUrl FROM client ", function (err, row) {
                    dataset.push(row)
                },
                    (err, rowCount) => {
                        if (err) reject(err);
                        resolve(dataset);
                    }
                );
            });
        } catch (error) {
            
            reject();
        }
    });
}
app.listen(8050,()=>console.log('listning on port 8050'));
