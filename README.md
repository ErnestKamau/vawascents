# VawaScents

VawaScents is a perfume e-commerce application project. The repository is
organized as a monorepo containing a Laravel API backend and an Expo
React Native mobile application.

## Project Structure

```text
vawascents/
├── README.md
├── .gitignore
├── backend/                 # Laravel 13 API
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── tests/
│   ├── .env.example
│   ├── artisan
│   └── composer.json
└── mobile/                  # Expo / React Native
    ├── src/
    ├── assets/
    ├── app.json
    ├── package.json
    └── package-lock.json
```

## Technology Stack

### Backend
- PHP 8.4
- Laravel 13
- MySQL 8
- Composer
- Laravel migrations and automated tests

### Mobile
- React Native
- Expo SDK 57
- TypeScript
- Expo Router
- npm

## Prerequisites

Install the following tools before setting up the project:

- Git
- PHP 8.4 with the required Laravel extensions
- Composer
- MySQL 8
- Node.js and npm
- Expo Go on a compatible mobile device, or an Android emulator

Verify your tools:

```bash
git --version
php -v
composer --version
mysql --version
node --version
npm --version
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ErnestKamau/vawascents.git
cd vawascents
```

### 2. Set up the Laravel backend

Install PHP dependencies:

```bash
cd backend
composer install
```

Create your local environment file if it does not already exist:

```bash
cp .env.example .env
```

If you already have a configured `.env` file, do not overwrite it.

Generate an application key only if `APP_KEY` is empty:

```bash
php artisan key:generate
```

### 3. Configure the database

Create a MySQL database named `vawascents` if it does not already exist:

```sql
CREATE DATABASE vawascents
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;
```

Configure the following variables in `backend/.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vawascents
DB_USERNAME=your_database_username
DB_PASSWORD="your_database_password"
```

Replace the username and password with your local MySQL credentials.
Do not commit real credentials to Git.

Run the database migrations:

```bash
php artisan migrate
```

Start the Laravel development server:

```bash
php artisan serve
```

The default local address is:

http://127.0.0.1:8000

Keep this terminal open while using the backend.

### 4. Set up the mobile application

Open a second terminal and run:

```bash
cd /mnt/data/development/Builds/vawascents/mobile
npm install
npx expo start
```

Follow the Expo CLI instructions to open the app in Expo Go or an emulator.

For a physical device, ensure your computer and phone can reach each other
over the network. If needed, configure the development API URL to use your
computer's LAN IP address instead of `127.0.0.1`.

## Development Workflow

- Backend code belongs in `backend/`.
- Mobile application code belongs in `mobile/`.
- Keep local environment variables and credentials out of version control.
- Use Laravel migrations to manage database schema changes.
- Run backend tests from the `backend/` directory:

```bash
php artisan test
```

- Run mobile tooling from the `mobile/` directory:

```bash
npx expo start
```

- Commit related changes with clear Git commit messages.
- Push completed work to the `main` branch when appropriate.

## Git Commands

Run these commands from the repository root:

```bash
git status
git add .
git commit -m "Describe your changes"
git push
```

Before committing, review staged files and confirm that secrets,
environment files, and generated dependencies are excluded.

## Security Notes

- Never commit `backend/.env` or other files containing secrets.
- Keep real database credentials out of documentation and source code.
- Use separate credentials for local development and production.
- Do not deploy the development server as a production server.
- Review dependency and security warnings before upgrading packages.

## Project Status

The initial monorepo structure is committed to GitHub. The Laravel backend
and Expo mobile application have been initialized. E-commerce features,
including product catalog, inventory, cart, orders, authentication, and
payments, will be implemented in subsequent development phases.

## Repository

https://github.com/ErnestKamau/vawascents
