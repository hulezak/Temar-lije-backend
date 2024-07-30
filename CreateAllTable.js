
const mysql = require("mysql2/promise");

// Create a connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "hulezak",
  password: "1593",
  database: "edu",
  connectionLimit: 10,
});

// Function to create tables
async function createTables() {
  try {
    const connection = await pool.getConnection();

    // Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Users (
        userId INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255),
        UserType VARCHAR(50),
        Email VARCHAR(255),
        Password VARCHAR(255)
      );
    `);

    // Create Schools Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Schools (
        schoolId INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(255),
        Location VARCHAR(255),
        PrincipalId INT,
        FOREIGN KEY (PrincipalId) REFERENCES Users(userId)
      );
    `);

    // Create Students Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Students (
        StudentId INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        Class VARCHAR(50),
        SchoolId INT,
        ParentId INT,
        FOREIGN KEY (userId) REFERENCES Users(userId),
        FOREIGN KEY (SchoolId) REFERENCES Schools(schoolId),
        FOREIGN KEY (ParentId) REFERENCES Users(userId)
      );
    `);

    // Create Parents Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Parents (
        parentId INT PRIMARY KEY,
        KidsId INT,
        FOREIGN KEY (parentId) REFERENCES Users(userId),
        FOREIGN KEY (KidsId) REFERENCES Students(StudentId)
      );
    `);

    // Create Teachers Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Teachers (
        TeacherId INT PRIMARY KEY,
        Subject VARCHAR(50),
        Email VARCHAR(255),
        Phone VARCHAR(20),
        Address VARCHAR(255),
        FOREIGN KEY (TeacherId) REFERENCES Users(userId)
      );
    `);

    // Create Class Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Class (
        ClassId INT AUTO_INCREMENT PRIMARY KEY,
        Grade VARCHAR(10),
        Section VARCHAR(10),
        ClassTeacherId INT,
        FOREIGN KEY (ClassTeacherId) REFERENCES Teachers(TeacherId)
      );
    `);

    console.log("Tables created successfully");
    connection.release();
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    pool.end();
  }
}

const addClasses = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Courses (
        class_id INT AUTO_INCREMENT PRIMARY KEY,
        course_name VARCHAR(255)
      );
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Students (
        StudentId INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        Class INT,
        ParentId INT,
        FOREIGN KEY (userId) REFERENCES Users(userId),
        FOREIGN KEY (Class) REFERENCES Courses(class_id),
        FOREIGN KEY (ParentId) REFERENCES Parents(parentId)
      );
    `);
    console.log("Class added successfully");
    connection.release();
  } catch (error) {
    console.log(error);
  }
};

// Uncomment the following line to create tables
// createTables();

// Uncomment the following line to add classes
// addClasses();


addClasses()