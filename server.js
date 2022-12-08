const inquirer = require('inquirer');
const db = require('./db/connection');
const consoleTable = require('console.table');
const confirm = require('inquirer-confirm');

//once database connects send out start messege
db.connect(function (error) {
    if (error) throw error;
    console.log("Welcome to Employee Manager");

    db.query("SELECT * from role", function (error, res) {
        roles = res.map(role => ({
            name: role.title,
            value: role.id
        }))
    })

    db.query("SELECT * from department", function (error, res) {
        departments = res.map(dep => ({
            name: dep.name,
            value: dep.id
        }))
    })

    db.query("SELECT * from employee", function (error, res) {
        employees = res.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id
        }))
    })
    initialPrompt();
});

//sets the prompts for the question
//value sets the event that we will use later
function initialPrompt() {
    inquirer.prompt({
        type: "list",
        message: "What would you like to do?",
        name: "choices",
        choices: [{
                name: "View All Departments",
                value: "viewAllDepartments"
            },
            {
                name: "View All Roles",
                value: "viewAllRoles"
            },
            {
                name: "View All Employees",
                value: "viewAllEmployees"
            },
            {
                name: "Add A Department",
                value: "addDepartment"
            },
            {
                name: "Add A Role",
                value: "addRole"
            },
            {
                name: "Add An Employee",
                value: "addEmployee"
            },
            {
                name: "Update An Employee Role",
                value: "updateRole"
            },
            {
                name: "End",
                value: "end"
            }
        ]
    }).then(function (res) {
        mainMenu(res.choices)
    });
};


function mainMenu(options) {
    switch (options) {
        case "viewAllDepartments":
            viewAllDepartments();
            break;
        case "viewAllRoles":
            viewAllRoles();
            break;
        case "viewAllEmployees":
            viewAllEmployees();
            break;
        case "addDepartment":
            addDepartment();
            break;
        case "addRole":
            addRole();
            break;
        case "addEmployee":
            addEmployee();
            break;
        case "updateRole":
            updateRole();
            break;
        case "end":
            end();
    };
};

//will return the departments from the database
function viewAllDepartments() {
    db.query("SELECT * FROM department", function (error, res) {
        console.table(res);
        endCheck();
    });
};

//will return the roles from the database
function viewAllRoles() {
    db.query("SELECT * FROM role", function (error, res) {
        console.table(res);
        endCheck();
    });
};

//will return the employees from the database
function viewAllEmployees() {
    db.query("SELECT * FROM employee", function (error, res) {
        console.table(res);
        endCheck();
    });
};

//will add a department to the database
function addDepartment() {
    inquirer.prompt([{
            type: "input",
            message: "What is the new department name?",
            name: "name"
        }])
        .then(function (response) {
            newDepartment(response);
        });
};

function newDepartment(data) {
    db.query("INSERT INTO department SET ?", {
            name: data.name
        },
        function (error, res) {
            if (error) throw error;
        });
        endCheck();
};

//will add a role to the database
function addRole() {
    inquirer.prompt([{
                type: "input",
                message: "What is the name of the new role?",
                name: "title"
            },
            {
                type: "input",
                message: "What is the salary of the new role?",
                name: "salary"

            },
            {
                type: "list",
                message: "Which department is the new role in?",
                name: "id",
                choices: departments
            }
        ])
        .then(function (response) {
            addNewRole(response);
        });
};

function addNewRole(data) {
    db.query("INSERT INTO role SET ?", {
        title: data.title,
        salary: data.salary,
        department_id: data.id
    }, function (error, res) {
        if (error) throw error;
    });
    endCheck();
};

//will add a employees to the database
function addEmployee() {
    inquirer.prompt([{
                type: 'input',
                message: "What is the employee's first name?",
                name: "firstName",
            },
            {
                type: 'input',
                message: "What is the employee's last name?",
                name: "lastName",
            },
            {
                type: "list",
                message: "What is the title of the employee?",
                name: "title",
                choices: roles
            },
            {
                type: "list",
                message: "Who is the manager of the employee?",
                name: "manager",
                choices: employees
            }
        ])
        .then(function (response) {
            newEmployee(response);
        });
};

function newEmployee(data) {
    db.query("INSERT INTO employee SET ?", {
        first_name: data.firstName,
        last_name: data.lastName,
        role_id: data.title,
        manager_id: data.manager
    }, function (error, res) {
        if (error) throw error;
    });
    endCheck();
}

//updates roles
function updateRole() {
    inquirer.prompt([{
                type: "list",
                message: "Which employee is updating their role?",
                name: "employeeID",
                choices: employees
            },
            {
                type: "list",
                message: "What is the new role?",
                name: "titleID",
                choices: roles
            }
        ])
        .then(function (response) {
            updateEmployeesRole(response);
        });
};

function updateEmployeesRole(data) {
    db.query(`UPDATE employee SET role_id = ${data.titleID} WHERE id =${data.employeeID}`,
        function (error, res) {
            if (error) throw error;
        });
        endCheck();
};

//checking to see if someone wants to end the program
function endCheck() {
    confirm("Do you want to continue?")
        .then(function confirmed() {
            initialPrompt();
        }, function cancelled() {
            end();
        });
};
//sends db.end
function end() {
    console.log("Quiting Employee Manager");
    db.end();
    process.exit();
};