const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', 
  user: 'root',      
  password: 'root',
  database: 'car_fragments', 
  multipleStatements: true 
});

connection.connect(function(err) {    
  if (err) {
    console.error('Connect Error:', err);
    throw err;    
  }    
  console.log('Connect Success!'); 
}); 

module.exports = connection;

