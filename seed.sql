insert into departments (name)
values ("Sales"),("Engineering"),("Finance"),("Legal"),("HR");

insert into roles (title, salary, department_id)
values ("Sales Lead", 100, 1),
	   ("CTO", 120, 2),
       ("Accountant", 80, 3),
       ("Lawyer", 150, 4),
       ("HR manager", 95, 5);
       
insert into employee (first_name, last_name, role_id)
values ("F1","L1", 1),
	   ("F2","L2", 2),
	   ("F3","L3", 3),
	   ("F4","L4", 4);