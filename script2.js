const fs = require('fs');

// Fix 1: ProtectedRoute.jsx
let protectedRouteContent = fs.readFileSync('frontend/src/components/ProtectedRoute.jsx', 'utf8');
const target1 = `if (isAuthenticated) {\r\n    return <Navigate to="/" replace />;\r\n  }`;
const replace1 = `if (isAuthenticated) {\r\n    return <Navigate to="/dashboard" replace />;\r\n  }`;

protectedRouteContent = protectedRouteContent.replace(target1, replace1);
protectedRouteContent = protectedRouteContent.replace(target1.replace(/\r/g, ''), replace1.replace(/\r/g, ''));
fs.writeFileSync('frontend/src/components/ProtectedRoute.jsx', protectedRouteContent);

// Fix 2: LoginPage.jsx
let loginPageContent = fs.readFileSync('frontend/src/pages/LoginPage.jsx', 'utf8');
const target2 = `if (path.startsWith('/') && !path.startsWith('//')) return path;`;
const replace2 = `if (path.startsWith('/') && !path.startsWith('//') && path !== '/') return path;`;

loginPageContent = loginPageContent.replace(target2, replace2);
fs.writeFileSync('frontend/src/pages/LoginPage.jsx', loginPageContent);
