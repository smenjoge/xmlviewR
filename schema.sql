DROP DATABASE IF EXISTS employee_db;

-- Creates the "favorite_db" database --
CREATE DATABASE employee_db;

-- Make it so all of the following code will affect favorite_db --
use employee_db;

-- Creates the table "favorite_foods" within favorite_db --
CREATE TABLE departments (
  id int auto_increment ,
  name varchar(30) not null,
  primary key (id)
);

CREATE TABLE roles (
  id int auto_increment ,
  title varchar(30) not null,
  salary decimal (10,2) NOT NULL,
  department_id int NOT NULL,
  primary key (id)
);

CREATE TABLE employee (
  id int auto_increment ,
  first_name varchar(30) not null ,
  last_name varchar(30) ,
  role_id int not null,
  manager_id int,
  primary key (id)
);