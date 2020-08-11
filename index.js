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
  init();
});

//all roles are retrieved from the database, and then stored to the roles array
const roles = [];
connection.query("SELECT title FROM role", function(err, res) {
  if (err) throw err;
  // console.log(res)
  for (i=0; i<res.length; i++){
    roles.push(res[i].title);
  }
});

//this function asks what the user would like to do and initiates the other functions
function init() {
  inquirer
  .prompt([
      {
      type: "list",
      message: "Welcome to the employee Tracker, what would you like to do?",
      name: "startMenu",
      choices: ["View employees", "Add an employee", "Update employee role", "Exit"]
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
      case "Update employee role":
          updateEmployee();
          break;
      case "Exit":
          console.log("Thank you for using the Employee Tracker, have a great day.");
          connection.end();
      }
    });
  }

function displayEmployees(){
  connection.query("SELECT * FROM employee", function(err, res) {
    if (err) throw err;
    // console.log(res);
    let employeeInfo = [];
    for (i = 0; i < res.length; i++){
       employeeInfo.push({
         name: res[i].first_name + " " + res[i].last_name,
         role: res[i].role,
         manager: res[i].manager
       })
    }
    console.table(employeeInfo);
    init();
  });
}

function addEmployee(){
  // console.log(roles)
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
        type: "list",
        name: "role",
        message: "What is the Employee's role?",
        //roles are retrieved from the roles array
        choices: roles
    },
    {
        type: "input",
        name: "manager",
        message: "Who is the Employee's manager?"
    }
    ]).then( response => {
        createEmployeeinDatabase(response);
        init();
      });
}

function createEmployeeinDatabase(response){
  console.log("   New employee created! \n");
  connection.query(
    "INSERT INTO employee SET ?",
    {
      first_name: response.first_name,
      last_name: response.last_name,
      role: response.role,
      manager: response.manager
    },
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " New employee created!\n");
    }
  );
}

// function updateEmployee(){
//   const employees = [];
//   const role_id = [];
//     inquirer
//     .prompt([
//         {
//         type: "list",
//         name: "selectedEmployee",
//         message: "Which employee would you like to update?",
//         choices: employees
//         },
//         {
//         type: "list",
//         name: "newRole",
//         message: "What is the new role for this employee?",
//         choices: roles
//         }
//     ]).then( response => {
//       console.log("success")
//         // connection.query(
//         //   "UPDATE employee SET ? WHERE?", 
//         //   [
//         //     {
//         //       role_id: 
//         //     },
//         //     {
//         //       name: selectedEmployee
//         //     }
//         //   ],
//         //   function(err, res) {

//         // })
//       });  

// }

