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

//Here I use a class constructor to matach all role titles with their IDs
let roleAndIDArray = [];
connection.query("SELECT * FROM role", function(err, res){
  // console.log(res);
  if (err) throw err;
  class RoleAndID {
    constructor(role, id) {
      this.role = role;
      this.id = id;
    };
  }
    for (i = 0; i < res.length; i++ ){
      roleAndIDArray.push(JSON.stringify(new RoleAndID(res[i].title, res[i].id)))
    }
    // console.log("Array: " + roleAndIDArray);
    // console.log(Array.isArray(roleAndIDArray));
    return roleAndIDArray;
})

console.log(roleAndIDArray)



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
      case "Delete employee":
          deleteEmployee();
          break;
      case "Add Department":
          addDepartment();
          break;
      case "Delete Department":
          deleteDepartment();
          break;
      case "Add Role":
          addRole();
          break;
      case "Delete Role":
          deleteRole();
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
  let roleId;
  connection.query(
    "SELECT id FROM role WHERE title = ?", response.role,
    function(err, res) { 
      if (err) throw err;
      roleId = res[0].id;
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
          console.log(" New employee created!\n");
          init();
        }
      );
    
    })
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
      let employeeID;
      connection.query("SELECT * FROM employee", function(err, res){
        for (i =0; i < res.length; i++){
          if (employeeNameArray[0] === res[i].first_name && employeeNameArray[1] === res[i].last_name){
            employeeID = res[i].id;
          }
        }
        // let roleAndIdPairs = roleAndIDArray.filter(function(){
        //   this.title === response.newRole;
        // })
        // console.log(roleAndIdPairs);
        connection.query(
          "UPDATE employee SET ? WHERE ?", 
          [
            {
              role: response.newRole
            },
            {
              id: employeeID
            }
          ],
          function(err, res) {
            if (err) throw err;
            console.log("  Employee role updated! \n");
            init();      
        })
      })

      });  
}

function deleteEmployee(){
  inquirer
  .prompt([
    {
      type: "list",
      name: "employeeToBeDeleted",
      message: "Which employee would you like to delete?",
      choices: employees
    }
  ])
  connection.query(
    "SELECT * FROM employee",
    function(err, res) { 
      if (err) throw err;
      
          init();
        }
      );
    
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

function deleteDepartment(){

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

function deleteRole(){

}