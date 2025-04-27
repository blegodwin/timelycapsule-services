# timelycapsule

TimelyCapsule is a web-based application that empowers users to create, seal, and send time-locked messages or media capsules. These capsules unlock at a specified date and time and can include text, images, videos, or cryptocurrency payments. The application is designed to provide an engaging and customizable experience while maintaining flexibility for both registered and guest users.

NB: .env is currently commited to the repo containing the required development credentials.

## Features

- Create and send time-locked messages or media capsules
- Support for text, images, videos, and cryptocurrency payments
- Engaging and customizable user experience
- Accessibility for recipients without requiring an account
- Hybrid Web2 and Web3 architecture

## Architecture

TimelyCapsule utilizes a hybrid architecture:

- **Web2**: Capsule integrity and storage management
- **Web3**: Handling subscription payments, in-app purchases, and optional cryptocurrency gifting

## Getting Started

To get started with TimelyCapsule, follow the instructions below.

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Setting Up the Project

### Installing/Updating Docker

1. **For Ubuntu/Debian:**

   ```sh
   # Remove old versions
   sudo apt-get remove docker docker-engine docker.io containerd runc

   # Install latest version
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. **For Windows/Mac:**

   - Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

3. **For other systems:**
   - Follow the [official Docker installation guide](https://docs.docker.com/engine/install/)

## Starting the Development Environment

1. **Clone the Repository**

   ```sh
   git clone <repository-url>
   cd <repository-folder>
   ```
2. **Copy env variable**

   Create an `.env` file in the root folder and copy the contents of the  `.env.example into it.

   Alternatively, run this command in your terminal:

   ```bash
   cp .env.example .env
   ```

3. **Build and Start Services**

   To build and run the entire development environment, use the following command:

   ```sh
   docker compose up --build
   ```

   This command will:

   - Start the backend and PostgreSQL database containers.

4. **Access the Application**

   - **Backend API**: Accessible at [http://localhost:3000](http://localhost:3000).
   - **PostgreSQL Database**: Accessible at `localhost:27017` (make sure to use the `MONGO_USER`, `DB_NAME` and `MONGO_PASSWORD` from the `.env` file).

To stop the development server and remove the docker containers and volume run:

```bash
docker compose down -v

# ✔ Container timelycapsule-backend                   Removed               0.0s
# ✔ Container timelycapsule-db                        Removed               0.0s
 # ✔ Volume timelycapsule-services_db_data             Removed               0.0s
# ✔ Network timelycapsule-services_timelycapsule-net  Removed               0.2s

```
