const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Token = require('../models/Token');
const crypto = require('crypto');
require('dotenv').config();

// Centralized Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: false,
  logger: false,
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to send emails:", success);
  }
});

// Export functions directly
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
    res.json({ 
      token, 
      message: 'Logged in successfully',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

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
          </table>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset email sent successfully.' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
};

exports.resetPassword = async (req, res) => {
  console.log('Reset password endpoint hit');
  console.log('Request body:', req.body);
  
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    console.log('Missing required fields');
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', { id: decoded.id });

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found for id:', decoded.id);
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    console.log('Password updated successfully');

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Password reset link has expired' });
    }
    res.status(500).json({ message: 'Error resetting password' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      credits: user.credits
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
};

exports.forgotUsername = async (req, res) => {
  const { email } = req.body;
  console.log('Forgot username request for email:', email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('No user found with email:', email);
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
                <img src="https://raw.githubusercontent.com/SW-AnubhavShriwastava/localhost/main/logo2_2.png" alt="Company Logo" style="width: 120px; height: auto;">
              </td>
            </tr>
            <tr>
              <td style="padding: 20px;">
                <h2 style="color: #1976d2; text-align: center;">Your Username Retrieval</h2>
                <p>Hello ${user.firstName},</p>
                <p>Your username is: <strong>${user.username}</strong></p>
                <p>You can use this username to log in to your account.</p>
                <p>If you did not request this information, please ignore this email.</p>
                <p>Thank you,<br>Support Team</p>
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    console.log('Sending email to:', user.email);
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    res.status(200).json({ message: 'Your username has been sent to your email address.' });
  } catch (error) {
    console.error('Error during username retrieval:', error);
    res.status(500).json({ message: 'Failed to send username. Please try again.' });
  }
};

// Generate a new token
exports.createToken = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Token name is required' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    
    const newToken = new Token({
      userId: req.user._id,
      name,
      token,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
    });

    await newToken.save();
    console.log('Token created:', newToken);
    res.status(201).json(newToken);
  } catch (error) {
    console.error('Error creating token:', error);
    res.status(500).json({ message: 'Error creating token: ' + error.message });
  }
};

// Get all tokens for a user
exports.getTokens = async (req, res) => {
  try {
    console.log('Fetching tokens for user:', req.user._id);
    const tokens = await Token.find({ userId: req.user._id });
    console.log('Found tokens:', tokens.length);
    res.json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ message: 'Error fetching tokens: ' + error.message });
  }
};

// Delete a token
exports.deleteToken = async (req, res) => {
  try {
    const token = await Token.findOne({
      _id: req.params.tokenId,
      userId: req.user._id
    });

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    await token.remove();
    res.json({ message: 'Token deleted successfully' });
  } catch (error) {
    console.error('Error deleting token:', error);
    res.status(500).json({ message: 'Error deleting token' });
  }
};

// Update token usage
exports.updateTokenUsage = async (tokenString) => {
  try {
    const token = await Token.findOne({ token: tokenString });
    if (token) {
      token.lastUsed = new Date();
      token.usageCount += 1;
      await token.save();
    }
  } catch (error) {
    console.error('Error updating token usage:', error);
  }
};
