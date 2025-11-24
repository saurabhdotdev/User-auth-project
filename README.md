# user-auth-project
Login and Signup project using ExpressJs ,Postgres , TypeORM

***Features***
Register & Login (password hashing with bcryptjs)
JWT-based authentication
Basic user CRUD (protected routes)
Static frontend pages: login.html, signup.html, dashboard.html
TypeORM entity for User

***Project structure***.
├─ server.js
├─ data-source.js
├─ controllers/
│ └─ auth.controller.js
├─ middleware/
│ └─ authMiddleware.js
├─ routes/
│ └─ auth.js
├─ entities/
│ └─ User.entity.js
├─ static/
│ ├─ login.html
│ ├─ signup.html
│ └─ dashboard.html
├─ package.json
└─ .env.example


***.env***
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=user_service
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10



