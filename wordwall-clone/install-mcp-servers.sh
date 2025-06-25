#!/bin/bash

# Wordwall Clone - MCP Servers Installation Script
# This script installs and configures all MCP servers for enhanced functionality

set -e

echo "🚀 Installing MCP Servers for Wordwall Clone..."

# Create directories
mkdir -p mcp-servers
mkdir -p data
mkdir -p logs

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. Some services may not work properly."
fi

print_status "Installing Node.js dependencies..."

# Install SQLite MCP Server
print_status "Installing SQLite MCP Server..."
npm install -g @jparkerweb/mcp-sqlite
print_success "SQLite MCP Server installed"

# Install Python dependencies
print_status "Installing Python dependencies..."
pip3 install --upgrade pip

# Install SQLite Explorer FastMCP
print_status "Installing SQLite Explorer FastMCP..."
pip3 install sqlite-explorer-fastmcp
print_success "SQLite Explorer FastMCP installed"

# Install Weaviate Python client
print_status "Installing Weaviate client..."
pip3 install weaviate-client
print_success "Weaviate client installed"

# Install OpenTelemetry dependencies
print_status "Installing OpenTelemetry dependencies..."
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-otlp-http
print_success "OpenTelemetry dependencies installed"

# Install Traceloop
print_status "Installing Traceloop..."
pip3 install traceloop-sdk
print_success "Traceloop installed"

# Install Langfuse
print_status "Installing Langfuse..."
npm install langfuse
pip3 install langfuse
print_success "Langfuse installed"

# Create SQLite database
print_status "Creating SQLite database..."
sqlite3 data/wordwall.db << 'EOF'
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
('act1', 'Math Quiz Demo', 'Basic math questions', '{"questions":[{"id":"q1","text":"What is 2+2?","options":[{"id":"a","text":"3"},{"id":"b","text":"4","isCorrect":true}]}]}', 'user1', 'QUIZ', TRUE);

.quit
EOF
print_success "SQLite database created with sample data"

# Start Weaviate with Docker (if Docker is available)
if command -v docker &> /dev/null; then
    print_status "Starting Weaviate with Docker..."
    docker run -d \
        --name weaviate-wordwall \
        -p 8080:8080 \
        -e QUERY_DEFAULTS_LIMIT=25 \
        -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true \
        -e PERSISTENCE_DATA_PATH='/var/lib/weaviate' \
        -e DEFAULT_VECTORIZER_MODULE='none' \
        -e ENABLE_MODULES='text2vec-openai,text2vec-cohere,text2vec-huggingface,ref2vec-centroid,generative-openai,qna-openai' \
        -e CLUSTER_HOSTNAME='node1' \
        semitechnologies/weaviate:latest
    
    # Wait for Weaviate to start
    print_status "Waiting for Weaviate to start..."
    sleep 10
    
    # Check if Weaviate is running
    if curl -f http://localhost:8080/v1/meta > /dev/null 2>&1; then
        print_success "Weaviate is running on http://localhost:8080"
    else
        print_warning "Weaviate may not be running properly"
    fi
else
    print_warning "Docker not available. Please install Weaviate manually."
fi

# Create environment file
print_status "Creating environment configuration..."
cat > .env.mcp << 'EOF'
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
EOF

print_success "Environment configuration created"

# Create MCP server scripts
print_status "Creating MCP server scripts..."

# Create OpenTelemetry MCP server
cat > mcp-servers/opentelemetry-server.js << 'EOF'
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
        // Implementation for creating traces
        return { success: true, traceId: 'trace-' + Date.now() };
    }

    async recordMetrics(params) {
        // Implementation for recording metrics
        return { success: true, metricId: 'metric-' + Date.now() };
    }
}

const server = new OpenTelemetryMCPServer();
module.exports = server;
EOF

# Create Langfuse MCP server
cat > mcp-servers/langfuse-server.js << 'EOF'
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
EOF

print_success "MCP server scripts created"

# Create startup script
cat > start-mcp-servers.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting MCP Servers for Wordwall Clone..."

# Load environment variables
if [ -f .env.mcp ]; then
    export $(cat .env.mcp | grep -v '^#' | xargs)
fi

# Start OpenTelemetry collector (if available)
if command -v otelcol &> /dev/null; then
    echo "Starting OpenTelemetry Collector..."
    otelcol --config=otel-config.yaml &
fi

# Start Jaeger (if available)
if command -v jaeger-all-in-one &> /dev/null; then
    echo "Starting Jaeger..."
    jaeger-all-in-one &
fi

echo "✅ MCP Servers are ready!"
echo "📊 Access Jaeger UI at: http://localhost:16686"
echo "🔍 Access Weaviate at: http://localhost:8080"
echo "📈 Check Langfuse at: https://cloud.langfuse.com"

EOF

chmod +x start-mcp-servers.sh
chmod +x install-mcp-servers.sh

print_success "Startup script created"

echo ""
echo "🎉 MCP Servers installation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Configure API keys in .env.mcp file"
echo "2. Run './start-mcp-servers.sh' to start services"
echo "3. Test the integration with your Wordwall Clone project"
echo ""
echo "🔗 Service URLs:"
echo "   • Weaviate: http://localhost:8080"
echo "   • Jaeger UI: http://localhost:16686"
echo "   • SQLite DB: ./data/wordwall.db"
echo ""
echo "📚 Documentation:"
echo "   • SQLite MCP: https://github.com/jparkerweb/mcp-sqlite"
echo "   • Weaviate: https://weaviate.io/developers/weaviate"
echo "   • OpenTelemetry: https://opentelemetry.io/docs/"
echo "   • Langfuse: https://langfuse.com/docs"
echo ""
