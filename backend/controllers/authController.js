const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
require('dotenv').config();

// Centralized Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: false, // Enable debug output
    logger: false, // Log to console for debugging
  });

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to send emails:", success);
  }
});

// Forgot Username
exports.forgotUsername = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Username Retrieval',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <table style="width: 100%; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <tr style="background-color: #1976d2;">
              <td style="padding: 20px; text-align: center;">
                <img src="https://raw.githubusercontent.com/SW-AnubhavShriwastava/localhost/main/logo.png" alt="Company Logo" style="width: 120px; height: auto;">
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <h2 style="color: #1976d2; text-align: center;">Your Username Retrieval</h2>
                <p>Hello ${user.firstName},</p>
                <p>Your username is: <strong>${user.username}</strong></p>
                <p>Thank you,<br>Team SwarupAI</p>
              </td>
            </tr>
            <tr style="background-color: #f7f7f7;">
              <td style="padding: 10px; text-align: center; color: #555;">
                <small>&copy; ${new Date().getFullYear()} SwarupAI. All rights reserved.</small>
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Your username has been sent to your email address.' });
  } catch (error) {
    console.error('Error during username retrieval:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User Signup
exports.signup = async (req, res) => {
  const { firstName, lastName, phone, email, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      username,
      password: hashedPassword,
      credits: 100,
    });

    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during signup:', error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// User Login
exports.login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials: user not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials: incorrect password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'Logged in successfully', credits: user.credits });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <table style="width: 100%; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <tr style="background-color: #1976d2;">
              <td style="padding: 20px; text-align: center;">
                <img src="https://raw.githubusercontent.com/SW-AnubhavShriwastava/localhost/main/logo.png" alt="Company Logo" style="width: 120px; height: auto;">
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <h2 style="color: #1976d2; text-align: center;">Password Reset Request</h2>
                <p>Hello ${user.firstName},</p>
                <p>To reset your password, please click the following link within the next 15 minutes:</p>
                <p style="text-align: center; margin: 20px;">
                  <a href="${resetLink}" style="padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">
                    Reset Password
                  </a>
                </p>
                <p>If you did not request this, please ignore this email.</p>
                <p>Thank you,<br>Support Team</p>
              </td>
            </tr>
            <tr style="background-color: #f7f7f7;">
              <td style="padding: 10px; text-align: center; color: #555;">
                <small>&copy; ${new Date().getFullYear()} SwarupAI. All rights reserved.</small>
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset email sent successfully.' });
  } catch (error) {
    console.error('Error during password reset:', error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};
