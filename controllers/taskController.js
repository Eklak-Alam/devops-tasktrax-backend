const db = require('../config/database');

// Get all tasks
const getAllTasks = (req, res) => {
  console.log('📥 GET /api/tasks - Fetching all tasks');
  
  const query = 'SELECT * FROM tasks ORDER BY created_at DESC';
  
  db.execute(query, (err, results) => {
    if (err) {
      console.error('❌ Database error in getAllTasks:', err.message);
      return res.status(500).json({ 
        success: false,
        error: 'Database connection failed',
        message: 'Unable to fetch tasks from database'
      });
    }
    
    console.log(`✅ Retrieved ${results.length} tasks successfully`);
    res.json({
      success: true,
      data: results,
      count: results.length,
      message: `Found ${results.length} tasks`
    });
  });
};

// Get task by ID
const getTaskById = (req, res) => {
  const taskId = req.params.id;
  console.log(`📥 GET /api/tasks/${taskId} - Fetching task`);
  
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid task ID',
      message: 'Please provide a valid task ID'
    });
  }

  const query = 'SELECT * FROM tasks WHERE id = ?';
  
  db.execute(query, [taskId], (err, results) => {
    if (err) {
      console.error(`❌ Database error fetching task ${taskId}:`, err.message);
      return res.status(500).json({ 
        success: false,
        error: 'Database error', 
        message: 'Unable to fetch task from database'
      });
    }
    
    if (results.length === 0) {
      console.log(`⚠️ Task ${taskId} not found`);
      return res.status(404).json({ 
        success: false,
        error: 'Task not found',
        message: `Task with ID ${taskId} does not exist`
      });
    }
    
    console.log(`✅ Retrieved task ${taskId} successfully`);
    res.json({
      success: true,
      data: results[0],
      message: 'Task retrieved successfully'
    });
  });
};

// Create new task
const createTask = (req, res) => {
  console.log('📝 POST /api/tasks - Creating new task');
  const { title, description, due_date } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ 
      success: false,
      error: 'Validation error',
      message: 'Task title is required and cannot be empty'
    });
  }
  
  if (title.length > 255) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation error',
      message: 'Task title cannot exceed 255 characters'
    });
  }

  const query = 'INSERT INTO tasks (title, description, due_date) VALUES (?, ?, ?)';
  const values = [title.trim(), description ? description.trim() : null, due_date || null];
  
  db.execute(query, values, (err, results) => {
    if (err) {
      console.error('❌ Database error creating task:', err.message);
      return res.status(500).json({ 
        success: false,
        error: 'Database error', 
        message: 'Unable to create task in database'
      });
    }
    
    console.log(`✅ Task created successfully with ID: ${results.insertId}`);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      taskId: results.insertId,
      data: {
        id: results.insertId,
        title: title.trim(),
        description: description ? description.trim() : null,
        due_date: due_date || null,
        is_completed: false
      }
    });
  });
};

// Update task
const updateTask = (req, res) => {
  const taskId = req.params.id;
  console.log(`✏️ PUT /api/tasks/${taskId} - Updating task`);
  const { title, description, due_date, is_completed } = req.body;
  
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid task ID',
      message: 'Please provide a valid task ID'
    });
  }

  // Build dynamic update query
  const updateFields = [];
  const queryParams = [];

  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Task title cannot be empty'
      });
    }
    updateFields.push('title = ?');
    queryParams.push(title.trim());
  }

  if (description !== undefined) {
    updateFields.push('description = ?');
    queryParams.push(description ? description.trim() : null);
  }

  if (due_date !== undefined) {
    updateFields.push('due_date = ?');
    queryParams.push(due_date || null);
  }

  if (is_completed !== undefined) {
    updateFields.push('is_completed = ?');
    queryParams.push(Boolean(is_completed));
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ 
      success: false,
      error: 'Validation error',
      message: 'No fields to update'
    });
  }

  queryParams.push(taskId);
  const query = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;
  
  db.execute(query, queryParams, (err, results) => {
    if (err) {
      console.error(`❌ Database error updating task ${taskId}:`, err.message);
      return res.status(500).json({ 
        success: false,
        error: 'Database error', 
        message: 'Unable to update task in database'
      });
    }
    
    if (results.affectedRows === 0) {
      console.log(`⚠️ Task ${taskId} not found for update`);
      return res.status(404).json({ 
        success: false,
        error: 'Task not found',
        message: `Task with ID ${taskId} does not exist`
      });
    }
    
    console.log(`✅ Task ${taskId} updated successfully`);
    res.json({
      success: true,
      message: 'Task updated successfully',
      affectedRows: results.affectedRows
    });
  });
};

// Delete task
const deleteTask = (req, res) => {
  const taskId = req.params.id;
  console.log(`🗑️ DELETE /api/tasks/${taskId} - Deleting task`);
  
  if (!taskId || isNaN(taskId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid task ID',
      message: 'Please provide a valid task ID'
    });
  }

  const query = 'DELETE FROM tasks WHERE id = ?';
  
  db.execute(query, [taskId], (err, results) => {
    if (err) {
      console.error(`❌ Database error deleting task ${taskId}:`, err.message);
      return res.status(500).json({ 
        success: false,
        error: 'Database error', 
        message: 'Unable to delete task from database'
      });
    }
    
    if (results.affectedRows === 0) {
      console.log(`⚠️ Task ${taskId} not found for deletion`);
      return res.status(404).json({ 
        success: false,
        error: 'Task not found',
        message: `Task with ID ${taskId} does not exist`
      });
    }
    
    console.log(`✅ Task ${taskId} deleted successfully`);
    res.json({
      success: true,
      message: 'Task deleted successfully',
      deletedId: parseInt(taskId)
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