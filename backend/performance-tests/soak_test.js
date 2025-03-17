import http from 'k6/http';
import { check, sleep } from 'k6';


const ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDIxOTc4NzQsImV4cCI6MTc0MjIwMTQ3NH0.TfIkHLTPwHPCB_cmNhaNxe19LtOtcTTlXShpWsStht8";

export const options = {
    scenarios: {
        soak: {
            executor: 'constant-vus',
            vus: 70, // Sustained high load
            duration: '20m',
        },
    },
};

const BASE_URL = 'http://localhost:5000';
const USER_CREDENTIALS = {
    username: "admin", // Update with an existing user
    password: "admin1234" // Update with the user's password
};

function loginUser() {
    const payload = JSON.stringify(USER_CREDENTIALS);
    const headers = { 'Content-Type': 'application/json' };

    let res = http.post(`${BASE_URL}/api/auth/login`, payload, { headers });

    check(res, { 'Login - Status is 200': (r) => r.status === 200 });

    if (res.status !== 200) {
        console.log(`❌ Login failed: ${res.status}, Response: ${res.body}`);
        return null;
    }

    let token = JSON.parse(res.body).token;
    //console.log(`✅ Successfully logged in! Token: ${token}`);
    return token;
}


const endpoints = [
    // Data Visualization APIs
    { method: 'GET', path: '/api/dataviz/company-rounds' },
    { method: 'GET', path: '/api/dataviz/student-hiring' },
    { method: 'GET', path: '/api/dataviz/gender-wise-data?company=VIAPLUS' },
    { method: 'GET', path: '/api/dataviz/distinct-companies' },
    { method: 'GET', path: '/api/dataviz/question-count-by-subject/VIAPLUS' },
    { method: 'GET', path: '/api/dataviz/rounds/aptitude' },
    { method: 'GET', path: '/api/dataviz/rounds/technical' },
    { method: 'GET', path: '/api/dataviz/rounds/managerial' },
    { method: 'GET', path: '/api/dataviz/rounds/technical-hr' },
    { method: 'GET', path: '/api/dataviz/rounds/group-discussion' },
    { method: 'GET', path: '/api/dataviz/rounds/online-coding' },
    { method: 'GET', path: '/api/dataviz/rounds/written-coding' },
    { method: 'GET', path: '/api/dataviz/average-salaries' },
    { method: 'GET', path: '/api/dataviz/all-salaries' },

    // Admin APIs
    { method: 'GET', path: '/api/admin/questions' },
    { method: 'GET', path: '/api/admin/distinct/companies' },
    { method: 'GET', path: '/api/admin/distinct/courses' },
    { method: 'GET', path: '/api/admin/users' },
    { method: 'GET', path: '/api/admin/analytics' },
    
    // { method: 'POST', path: '/api/admin/upload-questions' },
    { method: 'GET', path: '/api/admin/download-sample-sheet' },
    { method: 'GET', path: '/api/admin/download-instructions' },

    // Auth APIs
    // { method: 'POST', path: '/api/auth/register' },
    //{ method: 'POST', path: '/api/auth/login' },
    //{ method: 'GET', path: '/api/auth/me' },

    // Curriculum APIs
    { method: 'GET', path: '/api/curriculum/curriculum-analyses' },
    { method: 'GET', path: '/api/curriculum/curriculum-analyses?subject=OS' },
    { method: 'GET', path: '/api/curriculum/distinct-subjects' },

    // Quiz APIs
    { method: 'GET', path: '/api/quiz/distinct' },
    { method: 'GET', path: '/api/quiz/questions' },
    { method: 'GET', path: '/api/quiz/questions/all' },
    {
        method: 'POST',
        path: '/api/quiz/submit',
        payload: {
            answers: [
                { question_id: 1, selectedOption: "OptionA" },
                { question_id: 2, selectedOption: "OptionC" },
                { question_id: 3, selectedOption: "OptionB" }
            ],
            questionIds: [1, 2, 3]
        }
    },
    
    // { method: 'POST', path: '/api/quiz/submit' },

    // Score APIs
    { method: 'GET', path: '/api/scores' },
    { method: 'GET', path: '/api/scores/metrics' },
    // { method: 'POST', path: '/api/scores/clear' }
];



let results = {};

export default function (data = {}) {  
    let token = loginUser();
    if (!token) return;

    let authToken = data.authToken || ADMIN_TOKEN; // Use ADMIN_TOKEN if authToken is missing
    let authHeader = { 
        Authorization: `Bearer ${authToken}`, 
        'Content-Type': 'application/json' 
    };
    //console.log(`🔍 Using Authorization Header: ${JSON.stringify(authHeader)}`);

    endpoints.forEach(({ method, path, payload }) => {
        let res;
        if (method === 'GET') {
            res = http.get(`${BASE_URL}${path}`, { headers: authHeader });
        } else {
            res = http.post(`${BASE_URL}${path}`, JSON.stringify(payload), { headers: authHeader });
        }

        const success = check(res, { 'is status 200/201': (r) => r.status === 200 || r.status === 201 });

        if (!results[path]) {
            results[path] = { success: 0, failure: 0, lastError: '' };
        }

        if (success) {
            results[path].success += 1;
        } else {
            results[path].failure += 1;
            results[path].lastError = `Status: ${res.status}, Response: ${res.body}`;
            console.log(`❌ Request to ${path} failed with status: ${res.status}, Response: ${res.body}`);
            console.log('USER 1 TESTING DONE');
        }
    });

    sleep(1);
}
