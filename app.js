const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const pool = mysql.createPool({
  host: "localhost",
  user: "hulezak",
  password: "1593",
  database: "edu",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
  } catch (err) {
    console.error("Error initializing database:", err.message);
    process.exit(1);
  }
})();

app.get("/", (req, res) => {
  res.end("Hello");
});

app.post("/signup", async (req, res) => {
  console.log("sign up recieved");
  const { username, email, password, userType, schoolName, location } =
    req.body;

  try {
    // const hashedPassword = await bcrypt.hash(password, 10);
    const userInsertResult = await pool.query(
      "INSERT INTO users (Name, email, password, userType) VALUES (?, ?, ?, ?)",
      [username, email, password, userType]
    );

    const principalId = userInsertResult[0].insertId;

    if (userType === "principal") {
      await pool.query(
        "INSERT INTO schools (Name, location,principalId) VALUES (?, ?, ?)",
        [schoolName, location, principalId]
      );
    }

    console.log("User registered successfully");
    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error("Error registering user:", err.message);
    res.status(500).send("Internal server error");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = (?)", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).send("no email.");
    }

    const { Name, userId, UserType, Email, Password } = users[0];
    const user = { userId, Name, UserType, Email };

    console.log(user);

    const databasePassword = parseInt(Password);
    const passwordMatch = password == databasePassword;

    if (!passwordMatch) {
      return res.status(401).send("Invalid email or password.");
    }

    res.status(200).send({ message: "Successful login", User: user });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).send("Internal server error");
  }
});
// add teacher

app.post("/addTeachers", async (req, res) => {
  const { name, email, subject, address, phone } = req.body;

  const password = "0000";
  const userType = "teacher";
  res.send(req.body);
  try {
    // const hashedPassword = await bcrypt.hash(password, 10);
    const userInsertResult = await pool.query(
      "INSERT INTO users (Name, email, password, userType) VALUES (?, ?, ?, ?)",
      [name, email, password, userType]
    );

    const teacherId = userInsertResult[0].insertId;

    await pool.query(
      "INSERT INTO teachers (TeacherId, phone,email, address, subject) VALUES (?, ?, ?, ?, ?)",
      [teacherId, phone, email, address, subject]
    );
    console.log("Teacher added successfully");
    res.status(201).send("Teacher added successfully");
  } catch (err) {
    console.error("Error adding teacher:", err.message);
    res.status(500).send("Internal server error");
  }
});

// fetch teacher
app.get("/fetch/teachers", async (req, res) => {
  console.log("fetrching users");
  try {
    const [teachers] = await pool.query(
      "SELECT t.*, u.* FROM teachers t JOIN users u ON t.TeacherId = u.UserId"
    );

    res.status(200).send(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err.message);
    res.status(500).send("Internal server error");
  }
});

// Add class
app.post("/addClasses", async (req, res) => {
  console.log(" adding new class");
  const { grade, section, roomteacher, social_natural } = req.body;
  // const principalId = ;
  console.log(req.body);
  try {
    await pool.query(
      "INSERT INTO class (grade,section,ClassTeacherId, social_natural) VALUES (?, ?, ?, ?)",
      [grade, section, roomteacher, social_natural]
    );
  } catch (err) {
    console.error("Error adding class:", err.message);
    res.status(500).send("Internal server error");
  }
});

// fetch class
app.get("/fetch/classes", async (req, res) => {
  console.log("fetrching classes");
  try {
    const [teachers] = await pool.query(
      "SELECT t.*, u.* FROM class t JOIN users u ON t.ClassTeacherId = u.UserId"
    );

    res.status(200).send(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err.message);
    res.status(500).send("Internal server error");
  }
});

// required data for student registration
app.get("/fetch/studentregistration", async (req, res) => {
  try {
    console.log("Fetching classes...");
    const myQuery = `SELECT grade,ClassId, section, social_natural FROM class`;
    const [classes] = await pool.query(myQuery);
    console.log("Classes fetched:", classes);
    res.status(200).json(classes); // Assuming you want to send the classes as JSON response
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).send("Error fetching classes"); // Send an error response
  }
});

// assign Teacher
app.post("/assignteachers", async (req, res) => {
  console.log("request received");

  const {
    maths,
    biology,
    chemistry,
    physics,
    agriculture,
    english,
    ict,
    history,
    geography,
    economics,
  } = req.body[0];

  const classid = req.body[1];

  console.log(req.body);

  try {
    const sqlQuery = `
      INSERT INTO courses (class_id,  maths_teacher_id, biology_teacher_id, chemistry_teacher_id, physics_teacher_id, agriculture_teacher_id, english_teacher_id, ict_teacher_id, history_teacher_id, geography_teacher_id, economics_teacher_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sqlQuery, [
      classid,
      maths,
      biology,
      chemistry,
      physics,
      agriculture,
      english,
      ict,
      history,
      geography,
      economics,
    ]);

    res.status(200).send("Teachers assigned successfully.");
  } catch (error) {
    console.error("Error assigning teachers:", error);
    res.status(500).send("Error assigning teachers.");
  }
});

// fetch Class teacher
app.get("/fetch/classTeachers", async (req, res) => {
  console.log("Class teachers are being fetched...");

  try {
    const classId = req.query.clasid; // Get classId from query parameter or default to 4

    // Join courses and users tables to get teacher information
    const getTeachersQuery = ` SELECT * from courses where class_id=?`;

    const [response] = await pool.query(getTeachersQuery, [classId]);

    const teacherDic = response[0];

    const finalresponse = [];

    for (let key in teacherDic) {
      x = teacherDic[key];

      if (x > 5) {
        console.log(x);

        const teacherinfo = `
        SELECT
            u.name,
            u.email,
            t.phone,
            t.subject
        FROM
            users u
        LEFT JOIN
            teachers t ON u.userId = t.teacherid
        WHERE
            u.userId = ?
        `;
        const [teacherDetails] = await pool.query(teacherinfo, [x, x]);

        if (teacherDetails.length > 0) {
          const { name, email, phone, subject } = teacherDetails[0];
          finalresponse.push({ name, email, phone, subject });
          console.log(name, email, phone, subject);
        }
      }
    }

    res.status(200).json(finalresponse);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching class teachers"); // Send an error response if there's an issue
  }
});

// Add students
app.post("/addStudents", async (req, res) => {
  console.log("adding studets please wait ...");

  const { name, parent_name, Student_phone, parent_phone, Class, section } =
    req.body;
  const password = "0000";
  let userType = "parent";
  console.log(req.body);
  try {
    // adding parents to user table.
    const userInsertResult = await pool.query(
      "INSERT INTO users (Name, email, password, userType) VALUES (?, ?, ?, ?)",
      [parent_name, parent_phone, password, userType]
    );

    const parentId = userInsertResult[0].insertId;

    // adding student to user
    userType = "student";

    const studentInsertedId = await pool.query(
      "INSERT INTO users (Name, email, password, userType) VALUES (?, ?, ?, ?)",
      [name, Student_phone, password, userType]
    );

    const studentId = studentInsertedId[0].insertId;

    const addStudentTable = await pool.query(
      `Insert into students (class,userId,parentId) Values(?,?,?)`,
      [Class, studentId, parentId]
    );

    console.log("Student added successfully");
    res.status(201).send("Student added successfully");
  } catch (error) {
    console.log(error);
  }
});
// fetch students
app.get("/fetch/students", async (req, res) => {
  console.log("fetching students");

  try {
    const fetchStudent = `SELECT 
  students.userId,
  users.name,
  users.email,
  students.Class,
  class.Grade,
  class.Section
FROM 
  students
INNER JOIN 
  users ON students.userId = users.userId
INNER JOIN 
  class ON students.Class = class.ClassId;
`;

    const [response] = await pool.query(fetchStudent);
    console.log(response);
    res.status(202).send(response);
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
});

app.get("/fetch/mykids", async (req, res) => {
  const ParentUserId = 31;
  const mysqlQuery = `
    SELECT 
      s.StudentId,
      s.userId,
      s.Class,
      s.ParentId,
      u.Name AS studentName,
      u.email AS studentEmail,
      c.Grade,
      c.Section,
      c.ClassTeacherId
    FROM 
      students s
      INNER JOIN users u ON s.userId = u.userid
      INNER JOIN class c ON s.Class = c.ClassId
    WHERE 
      s.ParentId = ?`;

  try {
    const [response] = await pool.query(mysqlQuery, [ParentUserId]);

    if (response.length === 0) {
      res.send("No kids were found");
    } else {
      for (let i = 0; i < response.length; i++) {
        const ClassTeacherId = response[i].ClassTeacherId;
        console.log("room Teacher ID", ClassTeacherId);
        const roomTeacherQuery = `
        SELECT 
          u.Name AS roomTeacherName, 
          t.phone AS roomTeacherPhone
        FROM 
          users u
          INNER JOIN teachers t ON u.userId = t.teacherId
        WHERE 
          u.userId = ?`;

        const [roomTeacher] = await pool.query(roomTeacherQuery, [
          ClassTeacherId,
        ]);

        console.log("room teacher respon", roomTeacher);

        // Check if roomTeacher exists before adding it to the response
        if (roomTeacher) {
          response[i]["roomTeacher"] = roomTeacher[i];
        }
      }

      res.send(response);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
