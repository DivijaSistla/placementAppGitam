const jwt = require("jsonwebtoken");
const secret = "quizappv0";  // Replace with actual backend secret

const token = jwt.sign(
    { user_id: 4, role: "admin" },
    secret,
    { expiresIn: "1h" }
);

console.log("New Admin/Student Token:", token);



