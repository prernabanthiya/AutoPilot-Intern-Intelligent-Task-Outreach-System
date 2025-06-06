# AutoPilot-Intern-Intelligent-Task-Outreach-System

A full-stack tool that automates outreach for student clubs and NGOs. Users upload CSVs, send personalized emails, and track task progress via a simple button click in the email. Built ML models to predict task completion and used NLP to classify email replies (from historical data). Backend built with Node.js and Express, integrated with REST APIs, email tracking, and analytics.

## Project Setup and Running

This project consists of three main components: a Node.js backend, a React frontend, and a Python ML service. Follow these steps to set up and run the project locally.

### Prerequisites

Make sure you have the following installed:

*   Node.js and npm (or yarn)
*   Python 3.6+ and pip
*   PostgreSQL database server and pgAdmin
*   Git

### 1. Database Setup

1.  **Install PostgreSQL and pgAdmin:** If you don't have them installed, download them from [https://www.postgresql.org/download/](https://www.postgresql.org/download/).
2.  **Open pgAdmin:** Launch pgAdmin and connect to your PostgreSQL server.
3.  **Create a Database:** Right-click on "Databases" in the browser tree, select "Create" > "Database...". Enter a name for your database (e.g., `autopilot`) and click "Save".
4.  **Open Query Tool:** Right-click on your newly created database in the browser tree and select "Query Tool".
5.  **Run SQL Schema:** Paste the following SQL code into the Query Tool and click the "Execute/Refresh" button (the lightning bolt icon) to create all necessary tables and their relationships.

    ```sql
    -- Members Table
    CREATE TABLE members (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tasks Table
    CREATE TABLE tasks (
      id SERIAL PRIMARY KEY,
      member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      deadline DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP WITH TIME ZONE
    );

    -- Email Logs Table
    CREATE TABLE email_logs (
        id SERIAL PRIMARY KEY,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        task_id INTEGER REFERENCES tasks(id),
        subject VARCHAR(255),
        body TEXT,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50), -- e.g., 'sent', 'failed', 'opened', 'replied'
        follow_up_count INTEGER DEFAULT 0
    );

    -- Email Templates Table
    CREATE TABLE email_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        subject VARCHAR(255),
        body TEXT
    );

    -- Groups Table
    CREATE TABLE groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
    );

    -- Group Members Junction Table
    CREATE TABLE group_members (
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
        PRIMARY KEY (group_id, member_id)
    );

    -- Replies Table (used for logging task completion button clicks)
    CREATE TABLE replies (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        reply_classification VARCHAR(50) DEFAULT 'general',
        task_id INTEGER REFERENCES tasks(id),
        member_id INTEGER REFERENCES members(id),
        email_log_id INTEGER REFERENCES email_logs(id)
    );

    -- Add indexes for performance
    CREATE INDEX IF NOT EXISTS idx_replies_received_at ON replies(received_at);
    CREATE INDEX IF NOT EXISTS idx_replies_classification ON replies(reply_classification);
    CREATE INDEX IF NOT EXISTS idx_tasks_member_id ON tasks(member_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_email_logs_member_id ON email_logs(member_id);
    CREATE INDEX IF NOT EXISTS idx_email_logs_task_id ON email_logs(task_id);
    CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
    CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
    CREATE INDEX IF NOT EXISTS idx_groups_name ON groups(name);
    ```

### 2. Backend Server Setup and Start (Node.js/Express)

1.  **Navigate to the project root:** Open your terminal and change the directory to the root of the project.
2.  **Install Dependencies:** Install the necessary Node.js packages.

    ```bash
    npm install
    # or yarn install
    ```
3.  **Create Environment File:** Create a `.env` file in the project root based on the `.env.sample` file. Fill in your database credentials, email configuration, and the URLs for your backend and ML service.

    ```env
    # Database Configuration
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=autopilot # Replace with your database name

    # Email Configuration
    EMAIL_SERVICE=your_email_service # e.g., gmail
    EMAIL_USER=your_email_address
    EMAIL_PASSWORD=your_email_password # Use an app password if using Gmail

    # Application URLs
    BACKEND_URL=http://localhost:5000
    ML_SERVICE_URL=http://localhost:5001
    ```
4.  **Start the Backend Server:** Run the following command in the project root.

    ```bash
    npm start
    # or node server.js
    ```

    The backend server should start and run on `http://localhost:5000` (or the port specified in your `.env`).

### 3. Frontend Setup and Start (React)

1.  **Navigate to the frontend directory:** Open a new terminal window and change the directory to `autopilot-client`.

    ```bash
    cd autopilot-client
    ```
2.  **Install Dependencies:** Install the necessary React packages.

    ```bash
    npm install
    # or yarn install
    ```
3.  **Start the Frontend Development Server:** Run the following command.

    ```bash
    npm run dev
    # or yarn dev
    ```

    The frontend development server should start, usually on `http://localhost:5173` (or a similar port).

### 4. Python ML Service Setup and Start (Flask)

1.  **Navigate to the ML directory:** Open a new terminal window and change the directory to `ml-part`.

    ```bash
    cd ml-part
    ```
2.  **Create a Python Virtual Environment (Recommended):**

    ```bash
    python -m venv venv
    # On Windows
    # venv\Scripts\activate
    # On macOS/Linux
    # source venv/bin/activate
    ```
3.  **Install Dependencies:** Install the necessary Python packages. You can create a `requirements.txt` file in the `ml-part` directory with the following packages listed:

    ```
    pandas
    scikit-learn
    Flask
    Flask-Cors
    psycopg2-binary
    python-dotenv
    sqlalchemy
    ```

    Then run:

    ```bash
    pip install -r requirements.txt
    ```
4.  **Create ML Environment File:** Create a `.env` file in the `ml-part` directory based on the project root's `.env` to provide database credentials.

    ```env
    # Database Configuration
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=autopilot # Replace with your database name
    ```
5.  **Start the Python ML Service:** Run the Flask application. Make sure your virtual environment is activated if you created one.

    ```bash
    python ml_api.py
    ```

    The Python ML service should start and run on `http://localhost:5001`.

### Accessing the Application

Once all three servers are running, you can access the frontend application in your web browser, typically at `http://localhost:5173`.

---






