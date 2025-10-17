const db = require('../config/database');

// Get all tasks
const getAllTasks = (req, res) => {
  const query = 'SELECT * FROM tasks ORDER BY created_at DESC';
  
  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
};

// Get task by ID
const getTaskById = (req, res) => {
  const taskId = req.params.id;
  const query = 'SELECT * FROM tasks WHERE id = ?';
  
  db.execute(query, [taskId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  });
};

// Create new task
const createTask = (req, res) => {
  const { title, description, due_date } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const query = 'INSERT INTO tasks (title, description, due_date) VALUES (?, ?, ?)';
  
  db.execute(query, [title, description, due_date], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      taskId: results.insertId
    });
  });
};

// Update task
const updateTask = (req, res) => {
  const taskId = req.params.id;
  const { title, description, due_date, is_completed } = req.body;
  
  const query = `
    UPDATE tasks 
    SET title = ?, description = ?, due_date = ?, is_completed = ?
    WHERE id = ?
  `;
  
  db.execute(query, [title, description, due_date, is_completed, taskId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({
      success: true,
      message: 'Task updated successfully'
    });
  });
};

// Delete task
const deleteTask = (req, res) => {
  const taskId = req.params.id;
  const query = 'DELETE FROM tasks WHERE id = ?';
  
  db.execute(query, [taskId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  });
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};