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

connection.connect(function (err) {
  if (err) throw err;
  init();
});


let allEmployeeArray = [];
allEmployeeInfoGenerator();

function allEmployeeInfoGenerator() {
  connection.query("SELECT id, first_name, last_name, title, salary, label FROM employee LEFT JOIN role ON employee.role_id = role.label",
    function (err, res) {
      if (err) throw err;

      class AllEmployeeInfo {
        constructor(id, first_name, last_name, title, role_id, salary) {
          this.id = id;
          this.first_name = first_name;
          this.last_name = last_name;
          this.title = title;
          this.role_id = role_id;
          this.salary = salary
        }
      }

      for (i = 0; i < res.length; i++) {
        allEmployeeArray.push(new AllEmployeeInfo(res[i].id, res[i].first_name, res[i].last_name, res[i].title, res[i].label, res[i].salary))
      }

    })

    return allEmployeeArray;

}

let employeeID;

//all roles are retrieved from the database, and then stored to the roles array
function getRolesList(cb){
  const roles = [];
  connection.query("SELECT title FROM role", function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      roles.push(res[i].title);
    }
    cb(roles)
  });  
}


//this function asks what the user would like to do and initiates the other functions
function init() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Welcome to the employee Tracker, what would you like to do?",
        name: "startMenu",
        choices: ["View All employees", "Add an employee", "Delete employee", "Update employee role", "Add Department", "Delete Department", "View All Departments", "Add Role", "Delete Role", "View All Roles", "Exit"]
      }
    ])
    .then(response => {
      switch (response.startMenu) {
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
        case "View All Departments":
          viewDepartments();
          break;
        case "Add Role":
          addRole();
          break;
        case "Delete Role":
          deleteRole();
          break;
        case "View All Roles":
          viewRoles();
          break;
        case "Exit":
          console.log("Thank you for using the Employee Tracker, have a great day.");
          connection.end()
      }
    });
}

function displayEmployees() {
  connection.query("SELECT first_name, last_name, title, salary, manager FROM employee LEFT JOIN role ON employee.role_id = role.label",
    function (err, res) {
      if (err) throw err;
      let employeeInfo = [];
      for (i = 0; i < res.length; i++) {
        employeeInfo.push({
          name: res[i].first_name + " " + res[i].last_name,
          title: res[i].title,
          salary: res[i].salary,
          manager: res[i].manager
        })
      }
      console.table(employeeInfo);
      init();
    });
}

function addEmployee() {
  getRolesList( res => {
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
        choices: res
      },
      {
        type: "input",
        name: "manager",
        message: "Who is the Employee's manager?"
      }
    ]).then(response => {
      createEmployeeinDatabase(response);
    });
  });
}

function createEmployeeinDatabase(response) {
  let roleId;
  connection.query(
    "SELECT label FROM role WHERE title = ?", response.role,
    function (err, res) {
      if (err) throw err;
      roleId = res[0].label;
      connection.query(
        "INSERT INTO employee SET ?",
        {
          first_name: response.first_name,
          last_name: response.last_name,
          role_id: roleId,
          manager: response.manager
        },
        function (err, res) {
          if (err) throw err;
          console.log(" New employee created!\n");
          init();
        }
      );

    })
}

function updateEmployeeRole() {
  const employeesArray = [];
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      employeesArray.push(res[i].first_name + " " + res[i].last_name);
    }
  getRolesList( res => {
      inquirer
      .prompt([
        {
          type: "list",
          name: "selectedEmployee",
          message: "Which employee would you like to update role?",
          choices: employeesArray
        },
        {
          type: "list",
          name: "newRole",
          message: "What is the new role for this employee?",
          choices: res
        }
      ]).then(response => {
        // console.log("all employee array: " + Array.isArray(allEmployeeArray));
        connection.query("SELECT * FROM employee", function (err, res){
          if (err) throw err;
          let selectedEmployee = res.filter(employee => response.selectedEmployee === employee.first_name + " " + employee.last_name);
          employeeID = selectedEmployee[0].id;
  
          connection.query("SELECT * FROM role", function (err, res) {
            if (err) throw err;
            let newRoleID = res.filter(employee => response.newRole === employee.title)[0].label;
    
            //this query updates user selected employee's role into the new selected role
            connection.query(
              "UPDATE employee SET ? WHERE ?",
              [
                {
                  role_id: newRoleID
                },
                {
                  id: employeeID
                }
              ],
              function (err, res) {
                if (err) throw err;
                console.log("  Employee role updated! \n");
                init();
              })
          })
        })
      })
    });  
  });
};

function deleteEmployee() {
  //refresh employee names list in case an employee was just added
  const employeesArray = [];
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      employeesArray.push(res[i].first_name + " " + res[i].last_name);
    }

  //askes user which employee to delete
  inquirer
    .prompt([
      {
        type: "list",
        name: "selectedEmployee",
        message: "Which employee would you like to delete?",
        choices: employeesArray
      }
    ]).then(response => {
        connection.query("SELECT * FROM employee", function (err, res){
          const selectedEmployee = res.filter(employee => response.selectedEmployee === employee.first_name + " " + employee.last_name);
          employeeID = selectedEmployee[0].id
          connection.query(
            "DELETE FROM employee WHERE id = ?", [employeeID],
            function (err, res) {
              if (err) throw err;
              console.log("  \n" + "Employee deleted!" + "\n");
              init();
            })
          })
        }) 
    })
  }


function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "new_department",
        message: "What department would you like to add?"
      }
    ]).then(response => {
      connection.query("INSERT INTO department SET ?",
        {
          name: response.new_department
        },
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + "  New department added! \n");
          init();
        })
    })
}

function deleteDepartment() {
  let departments = [];
  connection.query("SELECT * FROM department", function (err, res) {
    res.forEach(department => departments.push(department.name));
    //askes the user for which department to delete
    inquirer
      .prompt([
        {
          type: "list",
          name: "selectedDepartment",
          message: "Which department would you like to delete?",
          choices: departments
        }
      ]).then(response => {
        //goes into the database and deletes the user-selected department
        connection.query(
          "DELETE FROM department WHERE name = ?", response.selectedDepartment,
          function (err, res) {
            if (err) throw err;
            console.log("\n" + "Department successfully deleted!" + "\n");
            init();
          })
      })
  })
}

function viewDepartments(){
  connection.query("SELECT * FROM department", function (err, res) {
    console.log("\n" + "All Departments" + "\n" + "-------------------------------")
    res.forEach(department => console.log(department.name));
    console.log("-------------------------------" + "\n")
    init();
  })
}


function addRole() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "new_role",
        message: "What role would you like to add?"
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of this role?"
      }
    ]).then(response => {
      connection.query("INSERT INTO role SET ?",
        {
          title: response.new_role,
          salary: response.salary
        },
        function (err, res) {
          if (err) throw err;
          console.log("  New role added! \n");
          init();
        })
    })
}

function deleteRole() {
  getRolesList( res => {
    inquirer
    .prompt([
      {
        type: "list",
        name: "selectedRole",
        message: "Which role would you like to delete?",
        choices: res
      }
    ]).then(response => {
      //goes into the database and deletes the user-selected role
      connection.query( 
        "DELETE FROM role WHERE ?",
        {
          title: response.selectedRole
        },
        function (err, res) {
          if (err) throw err;
          console.log("\n" + "Role deleted!" + "\n")
          init();
        })
    })
  })
}

function viewRoles(){
  connection.query("SELECT * FROM role",
  function (err, res) {
    if (err) throw err;
    console.log(res);
    let roleInfo = [];
    for (i = 0; i < res.length; i++) {
      roleInfo.push({
        title: res[i].title,
        salary: res[i].salary,
      })
    }
    console.table(roleInfo);
    init();
  });
}