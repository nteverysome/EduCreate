#!/usr/bin/env node

/**
 * MCP服务器集成测试和启动脚本
 * 测试所有已安装的MCP服务器并验证其功能
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class MCPTester {
    constructor() {
        this.mcpServers = [
            {
                name: 'SQLite MCP',
                command: 'node',
                args: ['mcp-sqlite-jparkerweb/mcp-sqlite-server.js'],
                type: 'node',
                port: null,
                status: 'pending'
            },
            {
                name: 'Microsoft Playwright MCP',
                command: 'node',
                args: ['playwright-mcp-microsoft/index.js'],
                type: 'node',
                port: null,
                status: 'pending'
            },
            {
                name: 'Sequential Thinking MCP',
                command: 'node',
                args: ['sequential-thinking-zalab/src/index.js'],
                type: 'node',
                port: null,
                status: 'pending'
            },
            {
                name: 'Unstructured MCP',
                command: 'python',
                args: ['-m', 'uns_mcp'],
                type: 'python',
                cwd: 'unstructured-mcp',
                port: null,
                status: 'pending'
            },
            {
                name: 'Mem0 MCP',
                command: 'python',
                args: ['mem0-mcp/main.py'],
                type: 'python',
                port: 8080,
                status: 'pending'
            },
            {
                name: 'MCP Memory (Alternative)',
                command: 'node',
                args: ['mcp-memory-sdimitrov/src/index.js'],
                type: 'node',
                port: null,
                status: 'pending'
            }
        ];
        this.runningProcesses = [];
    }

    async testMCPServer(server) {
        return new Promise((resolve) => {
            console.log(`🧪 测试 ${server.name}...`);
            
            const options = {
                cwd: server.cwd ? path.join(__dirname, server.cwd) : __dirname,
                stdio: ['pipe', 'pipe', 'pipe']
            };

            const process = spawn(server.command, server.args, options);
            let output = '';
            let errorOutput = '';

            // 设置超时
            const timeout = setTimeout(() => {
                process.kill();
                server.status = 'timeout';
                console.log(`⏰ ${server.name} 测试超时`);
                resolve(server);
            }, 10000);

            process.stdout.on('data', (data) => {
                output += data.toString();
                // 检查是否有MCP协议相关输出
                if (output.includes('mcp') || output.includes('server') || output.includes('listening')) {
                    clearTimeout(timeout);
                    process.kill();
                    server.status = 'success';
                    server.output = output;
                    console.log(`✅ ${server.name} 测试成功`);
                    resolve(server);
                }
            });

            process.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            process.on('close', (code) => {
                clearTimeout(timeout);
                if (server.status === 'pending') {
                    server.status = code === 0 ? 'success' : 'error';
                    server.output = output;
                    server.error = errorOutput;
                    console.log(`${code === 0 ? '✅' : '❌'} ${server.name} 测试${code === 0 ? '成功' : '失败'}`);
                }
                resolve(server);
            });

            process.on('error', (err) => {
                clearTimeout(timeout);
                server.status = 'error';
                server.error = err.message;
                console.log(`❌ ${server.name} 启动错误: ${err.message}`);
                resolve(server);
            });
        });
    }

    async testAllServers() {
        console.log('🚀 开始MCP服务器集成测试...\n');
        
        const results = [];
        for (const server of this.mcpServers) {
            const result = await this.testMCPServer(server);
            results.push(result);
            console.log(''); // 空行分隔
        }

        return results;
    }

    generateReport(results) {
        const report = {
            timestamp: new Date().toISOString(),
            total: results.length,
            success: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'error').length,
            timeout: results.filter(r => r.status === 'timeout').length,
            results: results
        };

        console.log('\n📊 MCP测试报告');
        console.log('='.repeat(50));
        console.log(`总计: ${report.total}`);
        console.log(`成功: ${report.success} ✅`);
        console.log(`失败: ${report.failed} ❌`);
        console.log(`超时: ${report.timeout} ⏰`);
        console.log('='.repeat(50));

        results.forEach(result => {
            const status = result.status === 'success' ? '✅' : 
                          result.status === 'error' ? '❌' : '⏰';
            console.log(`${status} ${result.name}: ${result.status}`);
        });

        // 保存报告到文件
        fs.writeFileSync(
            path.join(__dirname, 'mcp-test-report.json'),
            JSON.stringify(report, null, 2)
        );

        return report;
    }

    async startMCPServer(server) {
        return new Promise((resolve) => {
            console.log(`🚀 启动 ${server.name}...`);
            
            const options = {
                cwd: server.cwd ? path.join(__dirname, server.cwd) : __dirname,
                stdio: ['pipe', 'pipe', 'pipe'],
                detached: true
            };

            const process = spawn(server.command, server.args, options);
            
            process.stdout.on('data', (data) => {
                console.log(`[${server.name}] ${data.toString().trim()}`);
            });

            process.stderr.on('data', (data) => {
                console.error(`[${server.name}] ERROR: ${data.toString().trim()}`);
            });

            process.on('close', (code) => {
                console.log(`[${server.name}] 进程退出，代码: ${code}`);
            });

            this.runningProcesses.push({
                name: server.name,
                process: process,
                pid: process.pid
            });

            resolve(process);
        });
    }

    async startAllServers() {
        console.log('🚀 启动所有MCP服务器...\n');
        
        for (const server of this.mcpServers) {
            if (server.status === 'success') {
                await this.startMCPServer(server);
                // 等待一秒再启动下一个
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`\n✅ 已启动 ${this.runningProcesses.length} 个MCP服务器`);
        return this.runningProcesses;
    }

    stopAllServers() {
        console.log('🛑 停止所有MCP服务器...');
        
        this.runningProcesses.forEach(({ name, process }) => {
            try {
                process.kill();
                console.log(`✅ 已停止 ${name}`);
            } catch (err) {
                console.error(`❌ 停止 ${name} 失败: ${err.message}`);
            }
        });

        this.runningProcesses = [];
    }
}

// 主函数
async function main() {
    const tester = new MCPTester();
    
    try {
        // 测试所有MCP服务器
        const results = await tester.testAllServers();
        const report = tester.generateReport(results);
        
        // 如果有成功的服务器，询问是否启动
        if (report.success > 0) {
            console.log('\n🎯 测试完成！发现可用的MCP服务器。');
            console.log('💡 你可以手动启动需要的MCP服务器，或使用VS Code集成。');
        } else {
            console.log('\n⚠️  没有发现可用的MCP服务器。请检查安装和配置。');
        }

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
    }

    // 清理函数
    process.on('SIGINT', () => {
        console.log('\n🛑 收到中断信号，正在清理...');
        tester.stopAllServers();
        process.exit(0);
    });
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = MCPTester;
