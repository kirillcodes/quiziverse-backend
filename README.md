<img src="https://i.ibb.co/vXyRLvv/quiziverse-backend-github.png" alt="quiziverse-backend-github" border="0" width="420px">

<h1>Overview</h1>

Server part of the testing system for students of educational institutions

<h2>Features</h2>

- Search courses by keywords or ID
- Create and delete a course
- Subscribe to the course
- Create a test with date and timer
- Passing the test
- View the results of test participants
- Upload a unique course cover

<h2>Take a look</h2>

```
yarn install
yarn run start:dev
```

<h2>Environment (.env)</h2>

You can use own environment settings

```env
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:8000
PORT=8000

POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

SECRET_KEY=

TEACHER_EMAIL_DOMAIN=teacher.domain.com
STUDENT_EMAIL_DOMAIN=student.domain.com

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

<h2>Related repositories</h2>

[Quiziverse Frontend](https://github.com/kirillcodes/quiziverse)

<h2>LICENSE</h2>

[LICENSE](https://github.com/kirillcodes/quiziverse-backend?tab=MIT-1-ov-file#)
