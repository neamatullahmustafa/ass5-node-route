-- Insert Dummy Data into Customers Table
INSERT INTO Customers (first_name, last_name, email, phone) VALUES 
('John', 'Doe', 'john.doe@example.com', '1234567890'),
('Jane', 'Smith', 'jane.smith@example.com', '0987654321'),
('Alice', 'Johnson', 'alice.johnson@example.com', '1231231234'),
('Bob', 'Brown', 'bob.brown@example.com', '9879879876');

-- Insert Dummy Data into Products Table
INSERT INTO Products (product_name, category, unit_price) VALUES 
('Laptop', 'Electronics', 1200.00),
('Smartphone', 'Electronics', 800.00),
('Table', 'Furniture', 150.00),
('Chair', 'Furniture', 75.00);

-- Insert Dummy Data into Orders Table
INSERT INTO Orders (customer_id, total_amount) VALUES 
(1, 2000.00),
(2, 150.00),
(3, 875.00),
(1, 75.00);

-- Insert Dummy Data into OrderItems Table
INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES 
(1, 1, 1, 1200.00),
(1, 2, 1, 800.00),
(2, 3, 1, 150.00),
(3, 2, 1, 800.00),
(3, 4, 1, 75.00),
(4, 4, 1, 75.00);
