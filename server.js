import mysql2 from 'mysql2';
import express from 'express';

const app = express();
app.use(express.json());

const db = mysql2.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Customer APIs
app.post('/customers/signup', (req, res) => {
  const { first_name, last_name, email, phone } = req.body;
  
  // Check if customer email already exists
  db.execute('SELECT * FROM Customers WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Insert new customer into database
    db.execute('INSERT INTO Customers (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)', 
      [first_name, last_name, email, phone], (err, result) => {
        if (err) {
          console.error('Error creating customer:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Customer created successfully', customerId: result.insertId });
      });
  });
});

app.post('/customers/login', (req, res) => {
  const { email } = req.body;
  
  // Check if customer exists with given email
  db.execute('SELECT * FROM Customers WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.status(200).json({ message: 'Login successful', customer: results[0] });
  });
});

// Product APIs
app.post('/products', (req, res) => {
  const { product_name, category, unit_price } = req.body;
  
  // Insert new product into database
  db.execute('INSERT INTO Products (product_name, category, unit_price) VALUES (?, ?, ?)', 
    [product_name, category, unit_price], (err, result) => {
      if (err) {
        console.error('Error creating product:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Product created successfully', productId: result.insertId });
    });
});

app.get('/products/revenue-by-category', (req, res) => {
  // Calculate revenue by category
  db.execute('SELECT category, SUM(total_amount) AS revenue FROM Orders ' +
             'INNER JOIN OrderItems ON Orders.id = OrderItems.order_id ' +
             'INNER JOIN Products ON OrderItems.product_id = Products.id ' +
             'GROUP BY category', (err, results) => {
    if (err) {
      console.error('Error calculating revenue by category:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(results);
  });
});

app.get('/products/items-sold', (req, res) => {
  // Calculate total number of items sold for each product
  db.execute('SELECT product_id, SUM(quantity) AS total_sold FROM OrderItems ' +
             'GROUP BY product_id', (err, results) => {
    if (err) {
      console.error('Error calculating items sold:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(results);
  });
});

// Order APIs
app.post('/orders', (req, res) => {
  const { customer_id, order_items } = req.body;
  
  // Calculate total amount for the order
  let totalAmount = 0;
  order_items.forEach(item => {
    totalAmount += item.quantity * item.unit_price;
  });

  // Insert order and order items into database in a transaction
  db.beginTransaction(err => {
    if (err) {
      console.error('Error beginning transaction:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    db.execute('INSERT INTO Orders (customer_id, total_amount) VALUES (?, ?)', 
      [customer_id, totalAmount], (err, result) => {
        if (err) {
          db.rollback(() => {
            console.error('Error creating order:', err);
            res.status(500).json({ error: 'Database error' });
          });
        }
        
        const orderId = result.insertId;
        const orderItemsData = order_items.map(item => [orderId, item.product_id, item.quantity, item.unit_price]);
        
        db.execute('INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES ?', 
          [orderItemsData], (err, result) => {
            if (err) {
              db.rollback(() => {
                console.error('Error inserting order items:', err);
                res.status(500).json({ error: 'Database error' });
              });
            }
            
            db.commit(err => {
              if (err) {
                db.rollback(() => {
                  console.error('Error committing transaction:', err);
                  res.status(500).json({ error: 'Database error' });
                });
              }
              res.status(201).json({ message: 'Order created successfully', orderId });
            });
          });
      });
  });
});

app.get('/orders/average-order-value', (req, res) => {
  // Calculate average order value
  db.execute('SELECT AVG(total_amount) AS average_order_value FROM Orders', (err, results) => {
    if (err) {
      console.error('Error calculating average order value:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(results[0]);
  });
});

app.get('/orders/customers-without-orders', (req, res) => {
  // Find customers who have not made any orders
  db.execute('SELECT * FROM Customers ' +
             'LEFT JOIN Orders ON Customers.id = Orders.customer_id ' +
             'WHERE Orders.id IS NULL', (err, results) => {
    if (err) {
      console.error('Error finding customers without orders:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(200).json(results);
  });
});

// Implement other order APIs similarly

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
