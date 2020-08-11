var mysql = require("mysql");
var inquirer = require("inquirer");
var password = require("./Assets/password.js");
const cTable = require('console.table');

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: password.password,
  database: "employees_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  init();
});

function init() {
  inquirer
  .prompt([
      {
      type: "list",
      message: "Welcome to the employee Tracker, what would you like to do?",
      name: "startMenu",
      choices: ["View employees", "Add an employee", "Update an employee", "Exit"]
      }
  ])
  .then( response => {
      switch(response.startMenu) {
      case "View employees":
          displayEmployees();
          break;
      case "Add an employee":
          addEmployee();
          break;
      case "Update an employee":
          updateEmployee();
          break;
      case "Exit":
          console.log("Thank you for using the Employee Tracker, have a great day.");
          connection.end();
          //necessary?
          return;
      }
    });
  }

function displayEmployees(){
  connection.query("SELECT * FROM employee", function(err, res) {
    if (err) throw err;
    // console.log(res);
    let displayInfo = [];
    for (i = 0; i < res.length; i++){
       displayInfo.push({
         name: res[i].first_name + " " + res[i].last_name,
         role: res[i].role_id,
         manager: res[i].manager_id
       })
    }
    console.table(displayInfo);
    init();
  });
}

function addEmployee(){
    inquirer
    .prompt([
        {
        type: "input",
        name: "first_name",
        message: "What is the Employee's first name?"
        },
    {
        type: "input",
        name: "last_name",
        message: "What is the Employee's last name?"
    },
    {
        type: "number",
        name: "role_id",
        message: "What is the Employee's role id?"
    },
    {
        type: "number",
        name: "manager_id",
        message: "What is the Employee's manager id?"
    }
    ]).then( response => {
        createEmployeeinDatabase(response);
        init();
      });
}

function createEmployeeinDatabase(response){
  console.log("Inserting a new employee...\n");
  var query = connection.query(
    "INSERT INTO employee SET ?",
    {
      first_name: response.first_name,
      last_name: response.last_name,
      role_id: response.role_id,
      manager_id: response.manager_id
    },
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " New employee created!\n");
    }
  );
}

function updateEmployee(){

}

