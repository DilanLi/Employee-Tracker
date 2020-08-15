USE employees_db;

INSERT INTO role (title, salary) values ("Salesperson", "80000");
INSERT INTO role (title, salary) values ("Sales Lead", "100000");
INSERT INTO role (title, salary) values ("Software Engineer", "120000");
INSERT INTO role (title, salary) values ("Lead Engineer", "150000");
INSERT INTO role (title, salary) values ("Accountant", "100000");
INSERT INTO role (title, salary) values ("Legal Team Lead", "250000");
INSERT INTO role (title, salary) values ("Lawyer", "190000");

INSERT INTO employee (first_name, last_name, role_id, manager) values ("Dilan","Li", 1, "Karen");
INSERT INTO employee (first_name, last_name, role_id, manager) values ("Mike","Chan", 2, "Karen");
INSERT INTO employee (first_name, last_name, role_id, manager) values ("John","Doe", 3, "Karen");
INSERT INTO employee (first_name, last_name, role_id, manager) values ("Malia","Brown", 4, "Karen");

INSERT INTO department (name) values ("Sales");
INSERT INTO department (name) values ("Engineering");
INSERT INTO department (name) values ("Finance");
INSERT INTO department (name) values ("Legal");

