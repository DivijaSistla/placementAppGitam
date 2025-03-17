import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 1, // Number of virtual users
  duration: '10s', // Duration of the test
};

export default function () {
  let baseUrl = 'http://localhost:5000/api/auth';

  // 🟢 REGISTER a new user
  let registerPayload = JSON.stringify({
    username: `testuser${Math.floor(Math.random() * 1000)}`, // Unique username
    password: 'testpassword',
    role: 'student',
  });

  let registerHeaders = { 'Content-Type': 'application/json' };

  let registerRes = http.post(`${baseUrl}/register`, registerPayload, {
    headers: registerHeaders,
  });

  check(registerRes, {
    'Register - Status is 201': (r) => r.status === 201,
    'Register - Response contains token': (r) => JSON.parse(r.body).token !== undefined,
  });

  let token;
  if (registerRes.status === 201) {
    token = JSON.parse(registerRes.body).token; // Extract token if registration is successful
  }

  // 🟢 LOGIN with the registered user
  let loginPayload = JSON.stringify({
    username: 'testuser',
    password: 'testpassword',
  });

  let loginRes = http.post(`${baseUrl}/login`, loginPayload, {
    headers: registerHeaders,
  });

  check(loginRes, {
    'Login - Status is 200': (r) => r.status === 200,
    'Login - Response contains token': (r) => JSON.parse(r.body).token !== undefined,
  });

  if (loginRes.status === 200) {
    token = JSON.parse(loginRes.body).token; // Update token if login is successful
  }

  // 🟢 AUTHENTICATED REQUEST (Example: Get User Profile)
  if (token) {
    let meRes = http.get(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    check(meRes, {
      'Profile - Status is 200': (r) => r.status === 200,
      'Profile - Contains username': (r) => JSON.parse(r.body).username === 'testuser',
    });
  }
}
