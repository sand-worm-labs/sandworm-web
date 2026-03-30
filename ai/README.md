# AI Service of Sandworm 

## Concepts

Please read the [documentation]() here to understand the concepts of SandWorm AI Service.

## Setup for Local Development

### Prerequisites

1. **Python**: Install Python 3.12.\*

   - Recommended: Use [`pyenv`](https://github.com/pyenv/pyenv?tab=readme-ov-file#installation) to manage Python versions

2. **Poetry**: Install Poetry 1.8.3

   ```bash
   curl -sSL https://install.python-poetry.org | python3 - --version 1.8.3
   ```

3. **Just**: Install [Just](https://github.com/casey/just?tab=readme-ov-file#packages) command runner (version 1.36 or higher)

### Step-by-Step Setup

1. **Install Dependencies**:

   ```bash
   poetry install
   ```

2. **Generate Configuration Files**:

   ```bash
   just init
   ```

   This creates both `.env.dev` and `config.yaml`. Use `just init --non-dev` to generate only `config.yaml`.

    > For Windows, add the line `set shell:= ["bash", "-cu"]` at the start of the Justfile.

4. **Configure Environment**:

   - Edit `.env.dev` to set environment variables
   - Modify `config.yaml` to configure components, pipelines, and other settings
   - Refer to [AI Service Configuration](./docs/configuration.md) for detailed setup instructions

5. **Set Up Development Environment** (optional):

   - Install pre-commit hooks:

     ```bash
     poetry run pre-commit install
     ```

   - Run initial pre-commit checks:

     ```bash
     poetry run pre-commit run --all-files
     ```

6. **Run Tests** (optional):

   ```bash
   just test
   ```

### Starting the Service

1. **Start Required Containers**:

   ```bash
   just up
   ```

2. **Launch the AI Service**:

   ```bash
   just start
   ```

3. **Access the Service**:

   - API Documentation: `http://WREN_AI_SERVICE_HOST:WREN_AI_SERVICE_PORT` (default: <http://localhost:5556>)
   - User Interface: `http://WREN_UI_HOST:WREN_UI_PORT` (default: <http://localhost:3000>)

4. **Stop the Service**:
   When finished, stop the containers:

   ```bash
   just down
   ```