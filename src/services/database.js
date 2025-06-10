import SQLite from 'react-native-sqlite-storage';

// Enable debugging in development
SQLite.DEBUG(true);
// Use the SQLite defaults
SQLite.enablePromise(true);

let database = null;

export const DatabaseInit = async () => {
  if (database) {
    console.log('Database already initialized');
    return database;
  }

  try {
    database = await SQLite.openDatabase({
      name: 'journalapp.db',
      location: 'default',
    });
    
    console.log('Database opened');
    
    // Create tables if they don't exist
    await initTables();
    
    return database;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

const initTables = async () => {
  // Create tables if they don't exist
  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const createJournalTableQuery = `
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      date TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `;

  try {
    await database.executeSql(createUserTableQuery);
    console.log('Users table created');
    
    await database.executeSql(createJournalTableQuery);
    console.log('Journal entries table created');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

export const DatabaseClose = async () => {
  if (database) {
    console.log('Closing database');
    await database.close();
    database = null;
  }
};

// User operations
export const userDb = {
  // Create a new user
  createUser: async (username, password) => {
    try {
      const query = `
        INSERT INTO users (username, password)
        VALUES (?, ?)
      `;
      
      const result = await database.executeSql(query, [username, password]);
      
      if (result && result[0].insertId) {
        return {
          id: result[0].insertId,
          username
        };
      }
      
      throw new Error('Failed to create user');
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Get user by username
  getUserByUsername: async (username) => {
    try {
      const query = `
        SELECT * FROM users WHERE username = ?
      `;
      
      const [result] = await database.executeSql(query, [username]);
      
      if (result.rows.length > 0) {
        return result.rows.item(0);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }
};

// Journal operations
export const journalDb = {
  // Get all entries for a user
  getEntries: async (userId) => {
    try {
      const query = `
        SELECT * FROM journal_entries
        WHERE user_id = ?
        ORDER BY date DESC
      `;
      
      const [result] = await database.executeSql(query, [userId]);
      
      const entries = [];
      for (let i = 0; i < result.rows.length; i++) {
        entries.push(result.rows.item(i));
      }
      
      return entries;
    } catch (error) {
      console.error('Error getting entries:', error);
      throw error;
    }
  },
  
  // Get a single entry
  getEntry: async (id, userId) => {
    try {
      const query = `
        SELECT * FROM journal_entries
        WHERE id = ? AND user_id = ?
      `;
      
      const [result] = await database.executeSql(query, [id, userId]);
      
      if (result.rows.length > 0) {
        return result.rows.item(0);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting entry:', error);
      throw error;
    }
  },
  
  // Create a new entry
  createEntry: async (entry) => {
    try {
      const { title, content, date, userId } = entry;
      
      const query = `
        INSERT INTO journal_entries (title, content, date, user_id)
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await database.executeSql(query, [title, content, date, userId]);
      
      if (result && result[0].insertId) {
        // Return the new entry
        return {
          id: result[0].insertId,
          title,
          content,
          date,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      throw new Error('Failed to create entry');
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  },
  
  // Update an entry
  updateEntry: async (id, entry, userId) => {
    try {
      const { title, content, date } = entry;
      const currentDate = new Date().toISOString();
      
      const query = `
        UPDATE journal_entries
        SET title = ?, content = ?, date = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `;
      
      const result = await database.executeSql(query, [title, content, date, currentDate, id, userId]);
      
      if (result && result[0].rowsAffected > 0) {
        // Return the updated entry
        return {
          id,
          title,
          content,
          date,
          user_id: userId,
          updated_at: currentDate
        };
      }
      
      throw new Error('Failed to update entry or entry not found');
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  },
  
  // Delete an entry
  deleteEntry: async (id, userId) => {
    try {
      const query = `
        DELETE FROM journal_entries
        WHERE id = ? AND user_id = ?
      `;
      
      const result = await database.executeSql(query, [id, userId]);
      
      return result && result[0].rowsAffected > 0;
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  },
  
  // Search entries
  searchEntries: async (keyword, userId) => {
    try {
      const query = `
        SELECT * FROM journal_entries
        WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)
        ORDER BY date DESC
      `;
      
      const searchTerm = `%${keyword}%`;
      const [result] = await database.executeSql(query, [userId, searchTerm, searchTerm]);
      
      const entries = [];
      for (let i = 0; i < result.rows.length; i++) {
        entries.push(result.rows.item(i));
      }
      
      return entries;
    } catch (error) {
      console.error('Error searching entries:', error);
      throw error;
    }
  },
  
  // Get entries by date range (for streak calculation)
  getEntriesByDateRange: async (startDate, endDate, userId) => {
    try {
      const query = `
        SELECT date FROM journal_entries
        WHERE user_id = ? AND date BETWEEN ? AND ?
        ORDER BY date DESC
      `;
      
      const [result] = await database.executeSql(query, [userId, startDate, endDate]);
      
      const entries = [];
      for (let i = 0; i < result.rows.length; i++) {
        entries.push(result.rows.item(i));
      }
      
      return entries;
    } catch (error) {
      console.error('Error getting entries by date range:', error);
      throw error;
    }
  }
}; 