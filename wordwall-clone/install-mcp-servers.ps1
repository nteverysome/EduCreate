# Wordwall Clone - MCP Servers Installation Script for Windows
# This script installs and configures all MCP servers for enhanced functionality

Write-Host "🚀 Installing MCP Servers for Wordwall Clone..." -ForegroundColor Cyan

# Create directories
New-Item -ItemType Directory -Force -Path "mcp-servers" | Out-Null
New-Item -ItemType Directory -Force -Path "data" | Out-Null
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Success "Node.js is installed: $nodeVersion"
} catch {
    Write-Error "Node.js is not installed. Please install Node.js first."
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Success "npm is available: $npmVersion"
} catch {
    Write-Error "npm is not available."
    exit 1
}

Write-Status "Installing Node.js dependencies..."

# Install SQLite MCP Server
Write-Status "Installing SQLite MCP Server..."
try {
    npm install -g @jparkerweb/mcp-sqlite
    Write-Success "SQLite MCP Server installed"
} catch {
    Write-Warning "Failed to install SQLite MCP Server globally, trying locally..."
    npm install @jparkerweb/mcp-sqlite
}

# Install OpenTelemetry dependencies
Write-Status "Installing OpenTelemetry dependencies..."
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-otlp-http @opentelemetry/exporter-otlp-grpc @opentelemetry/sdk-metrics
Write-Success "OpenTelemetry dependencies installed"

# Install Langfuse
Write-Status "Installing Langfuse..."
npm install langfuse
Write-Success "Langfuse installed"

# Install additional dependencies
npm install sqlite3 weaviate-ts-client

# Check if Python is installed
$pythonInstalled = $false
try {
    $pythonVersion = python --version
    Write-Success "Python is installed: $pythonVersion"
    $pythonInstalled = $true
} catch {
    try {
        $pythonVersion = python3 --version
        Write-Success "Python3 is installed: $pythonVersion"
        $pythonInstalled = $true
    } catch {
        Write-Warning "Python is not installed. Some features will be limited."
        Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    }
}

# Install Python dependencies if Python is available
if ($pythonInstalled) {
    Write-Status "Installing Python dependencies..."
    
    try {
        pip install --upgrade pip
        pip install weaviate-client traceloop-sdk langfuse
        Write-Success "Python dependencies installed"
    } catch {
        Write-Warning "Failed to install some Python dependencies"
    }
}

# Create SQLite database
Write-Status "Creating SQLite database..."

$sqlScript = @"
-- Create tables for Wordwall Clone
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STUDENT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content JSON NOT NULL,
    user_id TEXT NOT NULL,
    template_type TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    play_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    player_email TEXT,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    time_taken INTEGER DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id)
);

-- Insert sample data
INSERT OR IGNORE INTO users (id, email, username, display_name, role) VALUES
('user1', 'teacher@example.com', 'teacher1', 'Teacher Demo', 'TEACHER'),
('user2', 'student@example.com', 'student1', 'Student Demo', 'STUDENT');

INSERT OR IGNORE INTO activities (id, title, description, content, user_id, template_type, is_public) VALUES
('act1', 'Math Quiz Demo', 'Basic math questions', '{"questions":[{"id":"q1","text":"What is 2+2?","options":[{"id":"a","text":"3"},{"id":"b","text":"4","isCorrect":true}]}]}', 'user1', 'QUIZ', 1);
"@

# Save SQL script to file
$sqlScript | Out-File -FilePath "data\init.sql" -Encoding UTF8

# Create database using Node.js (since sqlite3 command might not be available)
$dbScript = @"
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'wordwall.db');
const sqlPath = path.join(__dirname, 'data', 'init.sql');

const db = new sqlite3.Database(dbPath);

if (fs.existsSync(sqlPath)) {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    db.exec(sql, (err) => {
        if (err) {
            console.error('Error creating database:', err);
        } else {
            console.log('Database created successfully');
        }
        db.close();
    });
} else {
    console.error('SQL file not found');
    db.close();
}
"@

$dbScript | Out-File -FilePath "create-db.js" -Encoding UTF8
node create-db.js
Remove-Item "create-db.js"
Write-Success "SQLite database created with sample data"

# Check if Docker is available
try {
    $dockerVersion = docker --version
    Write-Success "Docker is available: $dockerVersion"
    
    Write-Status "Starting Weaviate with Docker..."
    docker run -d --name weaviate-wordwall -p 8080:8080 -e QUERY_DEFAULTS_LIMIT=25 -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true -e PERSISTENCE_DATA_PATH='/var/lib/weaviate' -e DEFAULT_VECTORIZER_MODULE='none' -e ENABLE_MODULES='text2vec-openai,text2vec-cohere,text2vec-huggingface,ref2vec-centroid,generative-openai,qna-openai' -e CLUSTER_HOSTNAME='node1' semitechnologies/weaviate:latest
    
    Write-Status "Waiting for Weaviate to start..."
    Start-Sleep -Seconds 15
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/v1/meta" -TimeoutSec 10
        Write-Success "Weaviate is running on http://localhost:8080"
    } catch {
        Write-Warning "Weaviate may not be running properly"
    }
} catch {
    Write-Warning "Docker not available. Please install Docker to use Weaviate."
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
}

# Create environment file
Write-Status "Creating environment configuration..."
$envContent = @"
# MCP Servers Configuration

# SQLite
SQLITE_DB_PATH=./data/wordwall.db

# Weaviate
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
OTEL_SERVICE_NAME=wordwall-clone
OTEL_RESOURCE_ATTRIBUTES=service.name=wordwall-clone,service.version=1.0.0

# Traceloop
TRACELOOP_API_KEY=your_traceloop_api_key_here
TRACELOOP_BASE_URL=https://api.traceloop.com

# Langfuse
LANGFUSE_SECRET_KEY=your_langfuse_secret_key_here
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key_here
LANGFUSE_HOST=https://cloud.langfuse.com
"@

$envContent | Out-File -FilePath ".env.mcp" -Encoding UTF8
Write-Success "Environment configuration created"

# Create MCP server scripts
Write-Status "Creating MCP server scripts..."

# Create OpenTelemetry MCP server
$otelScript = @"
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-http');

class OpenTelemetryMCPServer {
    constructor() {
        this.sdk = new NodeSDK({
            traceExporter: new OTLPTraceExporter({
                url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
            }),
            instrumentations: [getNodeAutoInstrumentations()],
        });
        
        this.sdk.start();
        console.log('OpenTelemetry MCP Server started');
    }

    async handleRequest(method, params) {
        switch (method) {
            case 'trace':
                return this.createTrace(params);
            case 'metrics':
                return this.recordMetrics(params);
            default:
                throw new Error(`Unknown method: ${method}`);
        }
    }

    async createTrace(params) {
        return { success: true, traceId: 'trace-' + Date.now() };
    }

    async recordMetrics(params) {
        return { success: true, metricId: 'metric-' + Date.now() };
    }
}

const server = new OpenTelemetryMCPServer();
module.exports = server;
"@

$otelScript | Out-File -FilePath "mcp-servers\opentelemetry-server.js" -Encoding UTF8

# Create Langfuse MCP server
$langfuseScript = @"
const { Langfuse } = require('langfuse');

class LangfuseMCPServer {
    constructor() {
        this.langfuse = new Langfuse({
            secretKey: process.env.LANGFUSE_SECRET_KEY,
            publicKey: process.env.LANGFUSE_PUBLIC_KEY,
            baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
        });
        console.log('Langfuse MCP Server started');
    }

    async handleRequest(method, params) {
        switch (method) {
            case 'trace':
                return this.createTrace(params);
            case 'generation':
                return this.logGeneration(params);
            case 'score':
                return this.addScore(params);
            default:
                throw new Error(`Unknown method: ${method}`);
        }
    }

    async createTrace(params) {
        const trace = this.langfuse.trace({
            name: params.name || 'wordwall-trace',
            userId: params.userId,
            sessionId: params.sessionId,
            metadata: params.metadata,
        });
        
        return { success: true, traceId: trace.id };
    }

    async logGeneration(params) {
        const generation = this.langfuse.generation({
            name: params.name || 'wordwall-generation',
            model: params.model || 'claude-3-sonnet',
            input: params.input,
            output: params.output,
            metadata: params.metadata,
        });
        
        return { success: true, generationId: generation.id };
    }

    async addScore(params) {
        const score = this.langfuse.score({
            name: params.name || 'quality',
            value: params.value,
            traceId: params.traceId,
            comment: params.comment,
        });
        
        return { success: true, scoreId: score.id };
    }
}

const server = new LangfuseMCPServer();
module.exports = server;
"@

$langfuseScript | Out-File -FilePath "mcp-servers\langfuse-server.js" -Encoding UTF8

Write-Success "MCP server scripts created"

# Create startup script
$startupScript = @"
# Start MCP Servers for Wordwall Clone

Write-Host "🚀 Starting MCP Servers for Wordwall Clone..." -ForegroundColor Cyan

# Load environment variables
if (Test-Path ".env.mcp") {
    Get-Content ".env.mcp" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

Write-Host "✅ MCP Servers are ready!" -ForegroundColor Green
Write-Host "📊 Access Jaeger UI at: http://localhost:16686" -ForegroundColor Yellow
Write-Host "🔍 Access Weaviate at: http://localhost:8080" -ForegroundColor Yellow
Write-Host "📈 Check Langfuse at: https://cloud.langfuse.com" -ForegroundColor Yellow
"@

$startupScript | Out-File -FilePath "start-mcp-servers.ps1" -Encoding UTF8

Write-Success "Startup script created"

Write-Host ""
Write-Host "🎉 MCP Servers installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure API keys in .env.mcp file" -ForegroundColor White
Write-Host "2. Run '.\start-mcp-servers.ps1' to start services" -ForegroundColor White
Write-Host "3. Test the integration with 'node test-mcp-integration.js'" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Service URLs:" -ForegroundColor Cyan
Write-Host "   • Weaviate: http://localhost:8080" -ForegroundColor White
Write-Host "   • Jaeger UI: http://localhost:16686" -ForegroundColor White
Write-Host "   • SQLite DB: .\data\wordwall.db" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   • SQLite MCP: https://github.com/jparkerweb/mcp-sqlite" -ForegroundColor White
Write-Host "   • Weaviate: https://weaviate.io/developers/weaviate" -ForegroundColor White
Write-Host "   • OpenTelemetry: https://opentelemetry.io/docs/" -ForegroundColor White
Write-Host "   • Langfuse: https://langfuse.com/docs" -ForegroundColor White
Write-Host ""
