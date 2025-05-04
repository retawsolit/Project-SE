<<<<<<< HEAD
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', 
  user: 'root',      
  password: '123456',
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
=======
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
>>>>>>> 334852a5fa0a98959a086e84df9cb7f6f238e7bc
