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

const choices = [new inquirer.Separator("------Departments------"),
                "View_Departments", 
                "View_Department_Budget", 
                "Add_Department",
                new inquirer.Separator("------Roles------"),
                "View_Roles", 
                "Add_Role", 
                "Delete_Role", 
                new inquirer.Separator("------Employees------"),
                "View_Employees", 
                "View_Employees_By_Manager", 
                "Add_Employee", 
                "Update_Employee_role", 
                "Update_Employee_manager",                           
                "Delete_Employee", 
                new inquirer.Separator("------Exit------"),
                "Exit"
                ];

async function start() {
    let userResp;
    userResp = await inquirer.prompt(
            {
                type: "list",
                name: "userChoice",
                message: "What would you like to do:",
                choices: choices
            }
    );

    switch (userResp.userChoice) {
        case ("View_Departments"): 
            await getDepartments();
            break;
        case ("View_Department_Budget"):
            await getBudgetByDepartment();
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
        case ("Delete_Role"):
            await delRole();
            break;
        case ("View_Employees"): 
            await getEmployees();
            break;
        case ("View_Employees_By_Manager"):
            await getEmployeesByManager();
            break;
        case ("Add_Employee"): 
            await addEmployee();
            break;
        case ("Update_Employee_role"): 
            await updEmployeeRole();
            break;
        case ("Update_Employee_manager"): 
            await updEmployeeManager();
            break;
        case ("Delete_Employee"):
            await delEmployee();
            break;
        default:
            connection.end();
    }
};
    
function getDepartments() {
    connection.query("select name from departments", function(err, results){
        if (err) throw err;
        console.table(results);
        start();
    })
};

function getBudgetByDepartment() {
    connection.query (`select * from departments `, async function(err, departmentsTable) {
            const departments = departmentsTable.map ( (department) => ({name: department.name, value: department.id}));

            const departmentToView = await inquirer.prompt(
                {
                    type: "list",
                    name: "department_id",
                    message: "Select which Department's Budget you want to view?",
                    choices: departments
                }
            )

            connection.query (`select departments.name, IFNULL(Budget,0) as Budget from departments  
                                left join 
                                (select department_id, SUM(salary) as Budget from roles
                                 inner join employee on  employee.role_id = roles.id group by department_id ) as deptBudget
                                on departments.id = deptBudget.department_id
                                where departments.id = ${departmentToView.department_id}`, 
                async function(err, departmentBudget) {
                    if (err) throw err;
                    console.log(`Total Budget for ${departmentBudget[0].name} Department = ${departmentBudget[0].Budget}`);
                    start();
                }
            )
        }
    );
};

function getRoles() {
    connection.query(`select title, salary, name as Dept_Name from roles
                        inner join departments
                        on roles.department_id = departments.id `, 
        function(err, results){
            if (err) throw err;
            console.table(results);
            start();
        }
    )
};

function delRole() {
    connection.query ("select * from roles", async function(err, rolesTable) {
        const roles = rolesTable.map ( (role) => ({name: role.title , value: role.id}));

        const roleToDel = await inquirer.prompt(
            {
                type: "list",
                name: "role_id",
                message: "Select Which Role you want to delete:",
                choices: roles
            }
        )

        connection.query (`select a.first_name, a.last_name, title, salary, name as Dept_Name, IFNULL(concat(b.first_name, ' ', b.last_name), 'N/A') as Manager from employee a
                            inner join roles on a.role_id = roles.id 
                            inner join departments on roles.department_id = departments.id
                            left join employee b on a.manager_id = b.id
                            where a.role_id = ${roleToDel.role_id}`, 
            async function(err, empForRole) {
                if (err) throw err;
                console.table(empForRole);
                let userConfirm = await inquirer.prompt(
                    {
                        type: "confirm",
                        name: "Proceed",
                        message: "Deleting this Role will also delete above employees. OK to proceed? "
                    }
                )
                
                if (userConfirm.Proceed) {
                    connection.query (`DELETE FROM employee where role_id = ${roleToDel.role_id}`, async function(err, result) {
                        if (err) throw err;
                        connection.query (`DELETE FROM roles where id = ${roleToDel.role_id}`, async function(err, result) {
                            if (err) throw err;
                            console.log("Employees and Role Deleted");
                            start();
                        })
                    })
                }
            }
        )
    });
};

function getEmployees() {
    connection.query(`select a.first_name, a.last_name, title, salary, name as Dept_Name, IFNULL(concat(b.first_name, ' ', b.last_name), 'N/A') as Manager from employee a
                        inner join roles on a.role_id = roles.id 
                        inner join departments on roles.department_id = departments.id
                        left join employee b on a.manager_id = b.id`, 
        function(err, results){
            if (err) throw err;
            console.table(results);
            start();
        }
    );
};

function getEmployeesByManager() {
    connection.query (`select a.* from employee a
                        inner join employee b 
                        on a.id = b.manager_id
                        and b.manager_id is not null`, 
        async function(err, managerTable) {
            const managers = managerTable.map ( (manager) => ({name: `${manager.first_name} ${manager.last_name}`, value: manager.id}));

            const managerToView = await inquirer.prompt(
                {
                    type: "list",
                    name: "manager_id",
                    message: "Select which Manager's Employees you want to view?",
                    choices: managers
                }
            )
            
            connection.query (`select first_name, last_name, title, salary, name as Dept_Name from employee 
                                inner join roles on employee.role_id = roles.id 
                                inner join departments 
                                on roles.department_id = departments.id
                                where manager_id = ${managerToView.manager_id}`, 
                async function(err, employeeResult) {
                    if (err) throw err;
                    console.table(employeeResult);
                    start();
                }
            )
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

function addRole() {
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

function addEmployee() {
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

function updEmployeeRole() {
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
                    [
                        {
                            role_id: employeeNewRole.role_id
                        },
                        {
                            id: employeeNewRole.employee_id
                        }
                    ],
                function(err, res) {
                    if (err) throw err;
                    console.log(`Role updated for employee with id = ${employeeNewRole.employee_id}`);
                    start();
                }
            )
        })
    });
};

function updEmployeeManager() {
    connection.query ("select * from employee", async function(err, employeeTable) {
        const employees = employeeTable.map ( (employee) => ({name: `${employee.first_name} ${employee.last_name}`, value: employee.id}));

            const employeeToUpd = await inquirer.prompt(
                {
                    type: "list",
                    name: "employee_id",
                    message: "Which Employee's manager would you like to change?",
                    choices: employees
                }
            )
        
        let employeeID = parseInt(employeeToUpd.employee_id);

        connection.query (`select * from employee where id <> ${employeeID}`, async function(err, managerTable) {
            if (err) throw err;
            const managers = managerTable.map((manager) => ({name: `${manager.first_name} ${manager.last_name}`, value: manager.id}));

            const managerNewID = await inquirer.prompt(
                {
                    type: "list",
                    name: "manager_id",
                    message: "Who do you want to set as Manager for selected employee?",
                    choices: managers
                }
            )

            connection.query("UPDATE employee SET ? WHERE ?",
                [
                    {
                        manager_id: managerNewID.manager_id
                    },
                    {
                        id: employeeID
                    }
                ],
                function(err, res) {
                    if (err) throw err;
                    console.log(`Manager updated for employee with id = ${employeeID}`);
                    start();
                }
            )
        })
    });
};

function delEmployee() {
    connection.query ("select * from employee", async function(err, employeeTable) {
        const employees = employeeTable.map ( (employee) => ({name: `${employee.first_name} ${employee.last_name}`, value: employee.id}));

        const employeeToDel = await inquirer.prompt(
            {
                type: "list",
                name: "employee_id",
                message: "Select Employee to delete:",
                choices: employees
            }
        )

        connection.query (`DELETE FROM employee where id = ${employeeToDel.employee_id}`, async function(err, result) {
            if (err) throw err;
            console.log(`Employee with id = ${employeeToDel.employee_id} deleted.`);
            start();
        })
    });
};