const jwt = require('jsonwebtoken');

// Mock credentials definition as requested
const MOCK_USERS = [
  { id: '1', email: 'admin@test.com', password: '1234', role: 'admin', name: 'Admin User' },
  { id: '2', email: 'proponent@company.com', password: 'proponent123', role: 'applicant', name: 'Test Proponent' }
];

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Validate credentials against mocks
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate a JWT Token valid for 1 hour
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Return the token in the response
  return res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
};

module.exports = { login };
