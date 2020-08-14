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
      console.log("allEmployeeArray: " + allEmployeeArray);

    })

    return allEmployeeArray;

}


let employeeID;

//all roles are retrieved from the database, and then stored to the roles array
const roles = [];
connection.query("SELECT title FROM role", function (err, res) {
  if (err) throw err;
  for (i = 0; i < res.length; i++) {
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
        choices: ["View All employees", "Add an employee", "Delete employee", "Update employee role", "Add Department", "Delete Department", "Add Role", "Delete Role", "Exit"]
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

function displayEmployees() {
  connection.query("SELECT first_name, last_name, title, salary FROM employee LEFT JOIN role ON employee.role_id = role.label",
    function (err, res) {
      if (err) throw err;
      let employeeInfo = [];
      for (i = 0; i < res.length; i++) {
        employeeInfo.push({
          name: res[i].first_name + " " + res[i].last_name,
          title: res[i].title,
          salary: res[i].salary
        })
      }
      console.table(employeeInfo);
      init();
    });
}

function addEmployee() {
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
    ]).then(response => {
      createEmployeeinDatabase(response);
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
        choices: roles
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

};

function deleteEmployee() {

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
      for (i = 0; i < allEmployeeArray.length; i++) {
        if (allEmployeeArray[i].first_name + " " + allEmployeeArray[i].last_name === response.selectedEmployee) {
          employeeID = allEmployeeArray[i].id;
        }
        console.log(employeeID);
        connection.query(
          "DELETE FROM employee WHERE id = ?", employeeID,
          function (err, res) {
            if (err) throw err;
            console.log("  Employee deleted!");
            init();
          })
      }
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
            init();
          })
      })
  })
}

function addRole() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "new_role",
        message: "What role would you like to add?"
      }
    ]).then(response => {
      connection.query("INSERT INTO role SET ?",
        {
          title: response.new_role
        },
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + "  New role added! \n");
          init();
        })
    })
}

function deleteRole() {
  let roles = [];
  connection.query("SELECT * FROM role", function (err, res) {
    res.forEach(role => roles.push(role.title));

  //askes the user for which Role to delete
  inquirer
    .prompt([
      {
        type: "list",
        name: "selectedRole",
        message: "Which role would you like to delete?",
        choices: roles
      }
    ]).then(response => {
      //goes into the database and deletes the user-selected role
      connection.query(
        "DELETE FROM role WHERE title = ?", response.selectedRole,
        function (err, res) {
          if (err) throw err;
          init();
        })
    })
  })

}