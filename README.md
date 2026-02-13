## Architecture & Tech Stack

**Frontend**
* **Core:** Vanilla JavaScript (ES6+), HTML5.
* **Styling:** CSS3 Grid, Flexbox, Glassmorphism UI.
* **Optimization:** DOM manipulation without external frameworks.

**Backend**
* **Framework:** ASP.NET Core Web API (.NET 8).
* **Database:** SQL Server via Entity Framework Core.
* **Architecture:** RESTful API design.

**Infrastructure & DevOps**
* **Containerization:** Docker & Docker Desktop for consistent development environments.
* **Cloud Provider:** Microsoft Azure (Azure Web App).
* **CI/CD:** GitHub Actions.

## CI/CD Pipeline

The project utilizes a fully automated DevOps pipeline via GitHub Actions.

**Continuous Integration (`.github/workflows/ci-cd.yml`)**
* Triggers on pull requests and pushes to the `main` branch.
* Restores NuGet dependencies.
* Builds the .NET solution to verify integrity.
* Executes unit tests to ensure code quality.

**Continuous Deployment (`.github/workflows/deploy.yml`)**
* Triggers automatically after successful CI validation.
* Publishes the application artifacts.
* Deploys directly to **Azure Web App** using GitHub Secrets for secure authentication.


[Link ](https://www.loom.com/share/345de5f0fa0a47d19e953101a14a6a96)
