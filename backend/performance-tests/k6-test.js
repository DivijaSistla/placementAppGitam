import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 10 }, // Ramp-up: 10 users in 10 sec
    { duration: '30s', target: 50 }, // Hold: 50 users for 30 sec
    { duration: '10s', target: 0 },  // Ramp-down: 0 users in 10 sec
  ],
};

const BASE_URL = 'http://localhost:5000'; // Update if deployed

export default function () {
  let endpoints = [
    // Data Visualization APIs
    '/api/dataviz/company-rounds',
    '/api/dataviz/student-hiring',
    '/api/dataviz/gender-wise-data?company=VIAPLUS',
    '/api/dataviz/distinct-companies',
    '/api/dataviz/question-count-by-subject/VIAPLUS',
    '/api/dataviz/rounds/aptitude',
    '/api/dataviz/rounds/technical',
    '/api/dataviz/rounds/managerial',
    '/api/dataviz/rounds/technical-hr',
    '/api/dataviz/rounds/group-discussion',
    '/api/dataviz/rounds/online-coding',
    '/api/dataviz/rounds/written-coding',
    '/api/dataviz/average-salaries',
    '/api/dataviz/all-salaries',

    // Admin APIs
    '/api/admin/questions',
    '/api/admin/distinct/companies',
    '/api/admin/distinct/courses',
    '/api/admin/users',
    '/api/admin/analytics',
    '/api/admin/upload-questions',
    '/api/admin/download-sample-sheet',
    '/api/admin/download-instructions',

    // Auth APIs
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/me',

    // Curriculum APIs
    '/api/curriculum',
    '/api/curriculum?subject=math',
    '/api/curriculum/distinct-subjects',

    // Quiz APIs
    '/api/quiz/distinct',
    '/api/quiz/questions',
    '/api/quiz/questions/all',
    '/api/quiz/submit',

    // Score APIs
    '/api/scores',
    '/api/scores/metrics',
    '/api/scores/clear',
  ];

  for (let path of endpoints) {
    let res = http.get(`${BASE_URL}${path}`);

    check(res, {
      [`GET ${path} - Status 200`]: (r) => r.status === 200,
      [`GET ${path} - Response Time < 200ms`]: (r) => r.timings.duration < 200,
    });
  }

  sleep(1);
}
