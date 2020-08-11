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

const employees = [];
connection.query("SELECT first_name, last_name FROM employee", function(err, res) {
  if (err) throw err;
  // console.log(res)
  for (i=0; i<res.length; i++){
    employees.push(res[i].first_name + " " + res[i].last_name);
  }
});

//construct an object of employee info from database
// class Employee {
//   constructor
// }

//this function asks what the user would like to do and initiates the other functions
function init() {
  inquirer
  .prompt([
      {
      type: "list",
      message: "Welcome to the employee Tracker, what would you like to do?",
      name: "startMenu",
      choices: ["View All employees", "Add an employee", "Update employee role", "Add Department", "Add Role","Exit"]
      }
  ])
  .then( response => {
      switch(response.startMenu) {
      case "View All employees":
          displayEmployees();
          break;
      case "Add an employee":
          addEmployee();
          break;
      case "Update employee role":
          updateEmployeeRole();
          break;
      case "Add Department":
          addDepartment();
          break;
      case "Add Role":
          addRole();
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
      });
}

function createEmployeeinDatabase(response){
  console.log("   New employee created! \n");
  let roleId;
  connection.query(
    "SELECT * FROM role WHERE title = " + response.role, 
    function(err, res) {
      if (err) throw err;
      console.log(res)
      roleId = res.id
    });
  connection.query(
    "INSERT INTO employee SET ?",
    {
      first_name: response.first_name,
      last_name: response.last_name,
      role_id: roleId,
      manager: response.manager
    },
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " New employee created!\n");
      init();
    }
  );
}

function updateEmployeeRole(){
    inquirer
    .prompt([
        {
        type: "list",
        name: "selectedEmployee",
        message: "Which employee would you like to update role?",
        choices: employees
        },
        {
        type: "list",
        name: "newRole",
        message: "What is the new role for this employee?",
        choices: roles
        }
    ]).then( response => {
      employeeNameArray = response.selectedEmployee.split(" ");
        connection.query(
          "UPDATE employee SET ? WHERE ?", 
          [
            {
              role: response.newRole
            },
            {
              last_name: employeeNameArray[1]
            }
          ],
          function(err, res) {
            if (err) throw err;
            console.log("  Employee role updated! \n");
            init();      
        })
      });  

}

function addDepartment(){
  inquirer
  .prompt([
    {
      type: "input",
      name: "new_department",
      message: "What department would you like to add?"
    }
  ]).then( response => {
    connection.query("INSERT INTO department SET ?",
    {
      name: response.new_department
    },
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + "  New department added! \n");
      init();
    })
  })
}

function addRole(){
  inquirer
  .prompt([
    {
      type: "input",
      name: "new_role",
      message: "What role would you like to add?"
    }
  ]).then( response => {
    connection.query("INSERT INTO role SET ?",
    {
      title: response.new_role
    },
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + "  New role added! \n");
      init();
    })
  })
}
