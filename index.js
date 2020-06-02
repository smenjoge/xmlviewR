const mysql = require("mysql");
const inquirer = require("inquirer");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_db"
});

connection.connect(function(err){
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    start();
});


async function start() {
    let userResp;
    userResp = await inquirer.prompt(
            {
                type: "list",
                name: "userChoice",
                message: "What would you like to do:",
                choices: ["View_Departments", 
                          "Add_Department",
                          "View_Roles", 
                          "Add_Role", 
                          "View_Employees", 
                          "Add_Employee", 
                          "Update_Employee_role", 
                          "Exit"]
            }
    );

    switch (userResp.userChoice) {
        case ("View_Departments"): 
            await getDepartments();
            break;
        case ("Add_Department"): 
            await addDepartment();
            break;
        case ("View_Roles"): 
            await getRoles();
            break;
        case ("Add_Role"): 
            await addRole();
            break;
        case ("View_Employees"): 
            await getEmployees();
            break;
        case ("Add_Employee"): 
            await addEmployee();
            break;
        case ("Update_Employee_role"): 
            await updEmployeeRole();
            break;
        default:
            connection.end();
        }
};

    
async function getDepartments() {
    connection.query("select name from departments", function(err, results){
        if (err) throw err;
        console.table(results);
    })
    start();
};


async function getRoles() {
    connection.query(`select title, salary, name as Dept_Name from roles
                        inner join departments
                        on roles.department_id = departments.id `, 
        function(err, results){
            if (err) throw err;
            console.table(results);
        }
    )
    start();
};

async function getEmployees() {
    connection.query(`select first_name, last_name, title, salary, name as Dept_Name from employee 
                        inner join roles on employee.role_id = roles.id 
                        inner join departments 
                        on roles.department_id = departments.id`, 
        function(err, results){
            if (err) throw err;
            console.table(results);
            start();
        }
    );
};

async function addDepartment() {
    const newDept = await inquirer.prompt(
        {
            type: "input",
            name: "newDeptName",
            message: "Please enter name of the new Department: "
        }
    );

    connection.query ("INSERT INTO departments SET ?",
            {
                name: newDept.newDeptName
            },
            function (err, res) {
                if (err) throw err;
                console.log(`${res.affectedRows} new Department ${newDept.newDeptName} Added.`);
                start();
            }
    )
};

async function addRole() {
    connection.query ("select * from departments", async function(err, deptTable) {
        const departments = deptTable.map ( (department) => ({name: department.name, value: department.id}));
        const newRole = await inquirer.prompt(
            [
                {
                    type: "input",
                    name: "title",
                    message: "What is the title for new Role?"
                },
                {
                    type: "input",
                    name: "salary",
                    message: "What is the salary for new Role?"
                },
                {
                    type: "list",
                    name: "department_id",
                    message: "Which Department does the role belong to?",
                    choices: departments 
                }
            ]
        )
        connection.query ("INSERT INTO roles SET ?",
                {
                    title: newRole.title,
                    salary: newRole.salary,
                    department_id: newRole.department_id
                },
                function (err, res) {
                    if (err) throw err;
                    console.log(`${res.affectedRows} new Role ${newRole.title} Added.`);
                    start();
                }
        )
    })
};

async function addEmployee() {
    connection.query ("select * from roles", async function(err, rolesTable) {
        const roles = rolesTable.map ( (role) => ({name: role.title, value: role.id}));
        const newEmpInfo = await inquirer.prompt(
            [
                {
                    type: "input",
                    name: "first_name",
                    message: "What is Employee's First Name?"
                },
                {
                    type: "input",
                    name: "last_name",
                    message: "What is Employee's Last Name?"
                },
                {
                    type: "list",
                    name: "role_id",
                    message: "What is new Employee's role?",
                    choices: roles
                }
            ]
        )
        connection.query ("INSERT INTO employee SET ?",
                {
                    first_name: newEmpInfo.first_name,
                    last_name: newEmpInfo.last_name,
                    role_id: newEmpInfo.role_id
                },
                function (err, res) {
                    if (err) throw err;
                    console.log(`${res.affectedRows} new Employee ${newEmpInfo.first_name} ${newEmpInfo.last_name} Added.`);
                    start();
                }
        )
    })
};

async function updEmployeeRole() {
    connection.query ("select * from employee", function(err, employeeTable) {
        connection.query ("select * from roles", async function(err, rolesTable) {
            const roles = rolesTable.map((role) => ({name: role.title, value: role.id}));
            const employees = employeeTable.map ( (employee) => ({name: `${employee.first_name} ${employee.last_name}`, value: employee.id}));

            const employeeNewRole = await inquirer.prompt(
                [
                    {
                        type: "list",
                        name: "employee_id",
                        message: "Which Employee would you like to update?",
                        choices: employees
                    },
                    {
                        type: "list",
                        name: "role_id",
                        message: "What would be the new role be for this employee?",
                        choices: roles
                    }
                ]
            )

            connection.query("UPDATE employee SET ? WHERE ?",
                    {
                        role_id: employeeNewRole.role_id
                    },
                    {
                        id: employeeNewRole.employee_id
                    },
                    function(err, res) {
                        if (err) throw err;
                        console.log(`Role updated for employee with id = ${employeeNewRole.employee_id}`);
                        start();
                    }
            )
        })
    });
}