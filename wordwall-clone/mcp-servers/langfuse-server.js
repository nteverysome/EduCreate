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
                throw new Error(Unknown method: );
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
