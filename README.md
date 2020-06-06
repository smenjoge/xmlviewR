# xmlviewR
SQL Homework

1) Employee tracker is a command-line application to manage information about a company's employees. 
2) Dependencies: MQSQL and Inquier 
    Before starting to use the application, run command 'npm Install' to make sure all dependencies are installed. 
3) The application can be started using command 'npm index.js' on the command line. 
4) First User will be asked to select one of the options for VIEW/UPDATE/DELETE Departments data, Roles Data or Employee Data. 
    User can also choose to EXIT the application. 
5) Based on the user choice, respective function is performed by reading/updating/inserting/deleting data from database. 
6) Please make note of few rules for below functions: 
    a) Add Roles: New roles can only be added to existing Department.
    b) Add Employee: New employee can only be added with existing roles mapped to one of the existing Departments.
    c) Update Employee Role: New Role for the employee can only be one of the existins Role values. 
    d) Update Employee Manager: Manager for any employee can be someon other than the employee himself. 
    e) Delete Role: When a particualr Role is deleted, the employees mapped to that role are also deleted. User needs to confirm this action '
        before data can be updated in the database. 