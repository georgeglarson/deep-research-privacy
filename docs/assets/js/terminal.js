export class TerminalManager {
    constructor(element, options = {}) {
        this.terminal = element;
        this.output = element.querySelector('.terminal__output');
        this.input = element.querySelector('.terminal__input');
        this.isDemo = options.demo || false;
        this.history = [];
        this.historyIndex = -1;
        this.isTyping = false;

        // Demo mode responses
        this.demoResponses = {
            'help': [
                'Available commands:',
                '',
                'research "topic"      - Research a specific topic',
                'compare "A vs B"      - Compare two subjects',
                'privacy              - Learn about our privacy features',
                'models              - List available AI models',
                'clear               - Clear the terminal',
                'help                - Show this help message',
                ''
            ],
            'research "privacy in ai"': [
                'Researching privacy in AI...',
                '',
                '📊 Key Findings:',
                '',
                '1. Data Protection',
                '   - Encryption methods for AI training data',
                '   - Privacy-preserving machine learning techniques',
                '   - Local processing vs cloud computing',
                '',
                '2. Regulatory Compliance',
                '   - GDPR implications for AI systems',
                '   - Data minimization principles',
                '   - User consent requirements',
                '',
                '3. Emerging Trends',
                '   - Federated learning adoption',
                '   - Differential privacy implementation',
                '   - Zero-knowledge proofs in AI',
                '',
                'Would you like to explore any of these topics in detail?',
                'Use: research "topic" to dive deeper'
            ],
            'compare "venice vs openai"': [
                'Comparing Venice.ai and OpenAI...',
                '',
                '🔄 Feature Comparison:',
                '',
                '1. Model Access',
                '   Venice.ai: Uncensored, full access to model capabilities',
                '   OpenAI: Content restrictions and safety filters',
                '',
                '2. Privacy Focus',
                '   Venice.ai: Privacy-first approach, local processing options',
                '   OpenAI: Cloud-based processing, data collection',
                '',
                '3. Cost Structure',
                '   Venice.ai: Pay-per-use, transparent pricing',
                '   OpenAI: Subscription tiers, usage limits',
                '',
                '4. Use Cases',
                '   Venice.ai: Research, uncensored analysis, privacy-critical apps',
                '   OpenAI: General purpose, content creation, business applications',
                ''
            ],
            'privacy': [
                '🔒 Privacy Features:',
                '',
                '1. No Data Collection',
                '   - Zero logging of search queries',
                '   - No user tracking or profiling',
                '   - No cookies or persistent storage',
                '',
                '2. Local Processing',
                '   - All computation happens on your machine',
                '   - No cloud dependencies',
                '   - Complete data control',
                '',
                '3. Open Source',
                '   - Fully auditable codebase',
                '   - Transparent operations',
                '   - Community-verified security',
                ''
            ],
            'models': [
                '🤖 Available Models:',
                '',
                '1. llama-3.3-70b',
                '   - Latest general purpose model',
                '   - 65k context window',
                '   - Function calling support',
                '',
                '2. llama-3.2-3b',
                '   - Fast, efficient model',
                '   - 131k context window',
                '   - Optimal for quick queries',
                '',
                '3. dolphin-2.9.2-qwen2-72b',
                '   - Uncensored model',
                '   - 32k context window',
                '   - Best for unrestricted research',
                '',
                '4. deepseek-r1-671b',
                '   - Largest available model',
                '   - 131k context window',
                '   - Highest accuracy',
                ''
            ]
        };

        this.setupEventListeners();
        this.focusInput();
    }

    setupEventListeners() {
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        document.querySelectorAll('.demo-player__example').forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.dataset.command;
                this.runCommand(command);
            });
        });

        // Refocus input when clicking anywhere in terminal
        this.terminal.addEventListener('click', () => this.focusInput());
    }

    focusInput() {
        if (!this.isTyping) {
            this.input.focus();
        }
    }

    async runCommand(command) {
        if (this.isTyping) return;
        
        command = command.trim().toLowerCase();
        if (!command) return;

        // Add command to history
        this.history.push(command);
        this.historyIndex = this.history.length;

        // Clear input and add command to output
        this.input.value = '';
        this.addToOutput(`$ ${command}`);

        if (command === 'clear') {
            this.output.innerHTML = '';
            return;
        }

        if (this.isDemo) {
            // Demo mode: Use pre-defined responses
            const response = this.demoResponses[command] || [
                'Command not recognized. Type "help" for available commands.',
                'Try one of our example commands below!'
            ];
            
            this.isTyping = true;
            for (const line of response) {
                await this.typeOutput(line);
            }
            this.isTyping = false;
            this.focusInput();
        } else {
            // Full mode: Connect to actual backend
            try {
                const response = await fetch('/api/research', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command })
                });
                const data = await response.json();
                await this.typeOutput(data.result);
            } catch (error) {
                this.addToOutput('Error: Please check your API configuration');
            }
        }
    }

    async typeOutput(text, speed = 10) {
        if (text === '') {
            this.addToOutput('');
            return;
        }

        const chars = text.split('');
        for (const char of chars) {
            await new Promise(resolve => setTimeout(resolve, speed));
            this.addToOutput(char, true);
        }
        this.addToOutput(''); // New line
    }

    addToOutput(text, sameLine = false) {
        if (sameLine) {
            const lines = this.output.querySelectorAll('div');
            const lastLine = lines[lines.length - 1];
            if (lastLine) {
                lastLine.textContent += text;
            } else {
                const line = document.createElement('div');
                line.textContent = text;
                this.output.appendChild(line);
            }
        } else {
            const line = document.createElement('div');
            line.textContent = text;
            this.output.appendChild(line);
            this.output.scrollTop = this.output.scrollHeight;
        }
    }

    handleInput(e) {
        if (this.isTyping) {
            e.preventDefault();
            return;
        }

        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            if (command) {
                this.runCommand(command);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
        }
    }
}