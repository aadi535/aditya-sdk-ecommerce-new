## APEX PREMIUM GADGETS – E-Commerce System

This is a complete full-stack online store project, created as the final capstone assignment for the Software Developer Kit course.
The application lets customers browse products, register accounts, place orders, and track their order status.
It also includes an admin panel where store administrators can view and manage all customer orders, including changing their status.

## Project Features

## Customer Features 
•	Browse the full product catalog 
•	View detailed information about each product 
•	Add products to the shopping cart 
•	Register a new account and log in 
•	Place orders (available only to logged-in users) 
•	View personal order history

## Admin Features 
•	View all orders placed by customers 
•	Update the status of any order 
•	Manage the complete order process

## Order Status Flow
Pending → Confirmed → Delivered
or
Pending → Confirmed → Cancelled

## Technologies Used
## Frontend 
•	HTML5 
•	CSS3 
•	Vanilla JavaScript (no frameworks) 
•	Vite development server
## Backend Microservices 
•	Python + FastAPI → Users & Authentication service 
•	Java + Spring Boot → Orders service 
•	PHP + Slim → Products service
## Database 
•	PostgreSQL
## Infrastructure 
•	Docker 
•	Docker Compose
## Version Control 
•	Git & GitHub

##  System Architecture
The project follows a microservices architecture.
The frontend connects separately to three backend services: 
•	Users Service → handles authentication and user accounts 
•	Orders Service → manages order creation, tracking, and status updates 
•	Products Service → provides product catalog and details
All three services use the same PostgreSQL database.

## How to Run the Project
## Requirements 
•	Docker 
•	Docker Compose
## Steps to start the application 
1.	Open a terminal in the project folder 
2.	Run the following command: docker compose up --build

## After the services start, open these addresses in your browser:
•	Main website (frontend):
http://localhost:5173 
•	Users' service API documentation:
http://localhost:8000/docs 
•	Orders service endpoint:
http://localhost:8083/orders

## Admin Account Setup
The system does not have a public admin registration form.
Admin rights must be assigned manually in the database.
Example SQL command:
UPDATE "User"
SET role = 'admin'
WHERE email = 'admin@email.com';

After updating the role and logging in with that account, the Admin Panel button will become visible in the interface.

## Screenshots : 

### HOME PAGE
<img width="900" height="952" alt="Screenshot 2026-03-12 182306" src="https://github.com/user-attachments/assets/526e27c6-65b3-41c5-823b-c37df1c22956" />

### LOGIN, SIGNUP, USERVALIDATION
<img width="450" height="430" alt="Screenshot 2026-03-12 184105" src="https://github.com/user-attachments/assets/9a41c3fe-8c5f-423e-ae12-ef379c0da329" />
<img width="466" height="445" alt="Screenshot 2026-03-12 182333" src="https://github.com/user-attachments/assets/0ce29892-98bf-4559-8ac4-5c22a175c7c0" />
<img width="457" height="433" alt="Screenshot 2026-03-12 182715" src="https://github.com/user-attachments/assets/9855e055-d5a2-4383-8b4b-192c5c0c29e3" />

### PRODUCT DETAILS
<img width="900" height="1079" alt="Screenshot 2026-03-12 183710" src="https://github.com/user-attachments/assets/e5b9af15-3db6-4656-a7e6-8ca9615630a9" />
<img width="900" height="1025" alt="image" src="https://github.com/user-attachments/assets/368e74e6-7c29-4296-9e12-23e97e07d35e" />

### SHOPPING CART
<img width="900" height="965" alt="Screenshot 2026-03-12 183917" src="https://github.com/user-attachments/assets/b4bbd86d-10d1-4f10-96cc-6acd57aafad9" />

### USER ORDERS
<img width="900" height="965" alt="Screenshot 2026-03-12 183917" src="https://github.com/user-attachments/assets/98e30afd-493b-4091-88e2-aaa6b46bbfc5" />
<img width="900" height="403" alt="Screenshot 2026-03-12 183941" src="https://github.com/user-attachments/assets/12509cf3-72f0-44ae-b1e5-1a35e8fa5f4e" />

### ADMIN PANEL
<img width="900" height="726" alt="Screenshot 2026-03-12 184451" src="https://github.com/user-attachments/assets/2c1e7bee-4211-4bf1-8ccf-481bdcb38ca9" />


## Author
 Aditya Raj 





