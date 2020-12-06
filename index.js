'use strict'; 

const mysql = require('mysql');
const express = require('express');
const Q = require('q');
const bodyParser = require('body-parser')

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const mysqlHost = process.env.MYSQL_HOST || 'localhost';
const mysqlPort = process.env.MYSQL_PORT || '3306';
const mysqlUser = process.env.MYSQL_USER || 'root';
const mysqlPass = process.env.MYSQL_PASS || 'admin';
const mysqlDB   = process.env.MYSQL_DB   || 'node_db';

const connectionOptions = {
host: mysqlHost,
port: mysqlPort,
user: mysqlUser,
password: mysqlPass,
database: mysqlDB
};

const connection = mysql.createConnection(connectionOptions);
connection.connect();

initializeDatabase(connection).then(() => {

   app.get('/', async function(req,res){
      if (!req.query || !req.query.name) {
         res.redirect('?name=anonymous');
      } else {
         let responseStr = 'Name      |      Surname      |      Password <br>';

         try {
            const user = req.query.name;
            const login = `SELECT * FROM users WHERE name='${user}'`;
            const logged_user = await Q.npost(connection, 'query', [login]);   
            
            if(logged_user[0][0] != null) {
               console.log(logged_user[0]);
               for(let i = 0; i < logged_user[0].length; i++) {
                  responseStr += logged_user[0][i].name + '      |      ' + logged_user[0][i].surname + 
                  '      |      ' + logged_user[0][i].password + '<br>';
               }
            } 

            responseStr += '<br><br><br><br><br><br><br><br><br><br><br><br>';
            
            responseStr += 'Este puerto se corresponde con la segunda banera.' 
               + '<br>Es más avanzado y complejo que el anterior, así que captura primero la anterior.';

            res.status(200).send(responseStr);
         } catch(err) {
            console.error(err);
            res.status(200).send(responseStr);
         }
      }
   });   
   
   app.listen(port, function(){
       console.log('Sample mySQL app listening on port ' + port);
   });
}).catch((err) => {
   console.log(err);
});


async function initializeDatabase(connection) {
   const droptable = "DROP TABLE IF EXISTS users";
   await connection.query(droptable);
   
   const createTable = "CREATE TABLE users (name VARCHAR(255), surname VARCHAR(255), password VARCHAR(255), email VARCHAR(255))";
   await connection.query(createTable);
   
   const insert0 = "INSERT INTO users VALUES ('Anonymous', 'Nothing', '012345', 'johndoe@rafaeldrs.com')";
   await connection.query(insert0);

   const insert1 = "INSERT INTO users VALUES ('John', 'Doe', '123456', 'johndoe@rafaeldrs.com')";
   await connection.query(insert1);
   
   const insert2 = "INSERT INTO users VALUES ('Patrick', 'Williams', '567890', 'patrick@rafaeldrs.com')";
   await connection.query(insert2);
   
   const insert3 = "INSERT INTO users VALUES ('admin345', 'admin345', 'v1V4H4ck1nG3t1C0', 'admin@rafaeldrs.com')";
   await connection.query(insert3);
}