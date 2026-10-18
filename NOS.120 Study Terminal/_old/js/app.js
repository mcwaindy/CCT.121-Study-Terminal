// NOS.120 Study Terminal - Main Application
class StudyTerminal {
    constructor() {
        this.apiBase = '/api';
        this.currentSection = 'dashboard';
        this.currentFlashcardIndex = 0;
        this.flashcards = [];
        this.commands = [];
        this.quizzes = [];
        this.notes = [];
        this.quizState = {
            currentIndex: 0,
            quiz: null,
            answers: {},
            startTime: null
        };
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadData();
        this.showSection('dashboard');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Dashboard
        document.getElementById('resetBtn').addEventListener('click', () => this.resetProgress());

        // Flashcards
        document.getElementById('allCardsBtn').addEventListener('click', () => this.setFlashcardMode('all'));
        document.getElementById('unmasteredBtn').addEventListener('click', () => this.setFlashcardMode('unmastered'));
        document.getElementById('flashcardModuleSelect').addEventListener('change', () => this.loadFlashcards());
        document.getElementById('flashcard').addEventListener('click', () => this.toggleFlashcard());
        document.getElementById('prevCardBtn').addEventListener('click', () => this.previousCard());
        document.getElementById('nextCardBtn').addEventListener('click', () => this.nextCard());
        document.getElementById('markMasteredBtn').addEventListener('click', () => this.markCurrentCardMastered());

        // Notes
        document.getElementById('notesSearch').addEventListener('input', () => this.filterNotes());
        document.getElementById('moduleSelect').addEventListener('change', () => this.filterNotes());

        // Quizzes
        document.getElementById('prevQuestionBtn').addEventListener('click', () => this.previousQuestion());
        document.getElementById('nextQuestionBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('submitQuizBtn').addEventListener('click', () => this.submitQuiz());

        // Commands
        document.getElementById('commandSearch').addEventListener('input', () => this.filterCommands());
        document.getElementById('commandModuleSelect').addEventListener('change', () => this.filterCommands());

        // Terminal Modes
        document.getElementById('modeTestBtn').addEventListener('click', () => this.switchTerminalMode('test'));
        document.getElementById('modeChallengeBtn').addEventListener('click', () => this.switchTerminalMode('challenge'));
        document.getElementById('modeShellBtn').addEventListener('click', () => this.switchTerminalMode('shell'));
        window.Shell.init();
        window.Challenges.init();
        document.getElementById('testSubmitBtn').addEventListener('click', () => this.checkTestCommand());
    }

    async loadData() {
        try {
            const [notes, flashcards, commands, quizzes] = await Promise.all([
                fetch(`${this.apiBase}/notes`).then(r => r.json()),
                fetch(`${this.apiBase}/flashcards`).then(r => r.json()),
                fetch(`${this.apiBase}/commands`).then(r => r.json()),
                fetch(`${this.apiBase}/quizzes`).then(r => r.json())
            ]);

            this.notes = notes;
            const mastered = JSON.parse(localStorage.getItem('nos120.mastered') || '[]');
            this.allCards = window.CARDS.map((c, i) => ({ id: 'c' + i, module: 'Module' + c[0], question: c[1], answer: c[2], isMastered: mastered.includes('c' + i) }));
            this.flashcards = this.allCards;
            this.commands = commands;
            this.quizzes = quizzes;

            this.renderQuizzes();
            this.renderCommandList();
            this.loadFlashcards();
            this.renderNotes();
            this.populateCommandSelects();
            await this.refreshDashboard();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data');
        }
    }

    showSection(sectionId) {
        if (this.currentSection === 'terminal' && sectionId !== 'terminal') window.Shell.onLeave();
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');

        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        if (sectionId === 'dashboard') {
            this.refreshDashboard();
        } else if (sectionId === 'progress') {
            this.renderProgressTracker();
        }

        this.currentSection = sectionId;
    }

    // Dashboard Functions
    async refreshDashboard() {
        try {
            const progress = await fetch(`${this.apiBase}/progress`).then(r => r.json());
            const weakAreas = await fetch(`${this.apiBase}/progress/weak-areas`).then(r => r.json());

            this.updateProgressStats(progress);
            this.renderWeakAreas(weakAreas);
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
        }
    }

    updateProgressStats(progress) {
        document.getElementById('overallProgress').textContent = `${Math.round(progress.overallProgress)}%`;
        document.getElementById('flashcardProgress').textContent = `${this.allCards.filter(c => c.isMastered).length}/${this.allCards.length}`;
        document.getElementById('commandProgress').textContent = `${progress.masteredCommands}/${progress.totalCommands}`;
        document.getElementById('quizAverage').textContent = `${Math.round(progress.averageQuizScore)}%`;

        const readiness = progress.readiness.overallReadiness;
        const readinessEl = document.getElementById('readinessStatus');
        readinessEl.className = `readiness-status status-${readiness}`;

        const messages = {
            'very-ready': 'You are very well prepared! Time to take the exam.',
            'ready': 'You are ready for the exam with some review recommended.',
            'partially-ready': 'You need more focused study in weak areas.',
            'not-ready': 'Continue studying, especially in the identified weak areas.'
        };

        readinessEl.textContent = readiness.replace('-', ' ').toUpperCase();
        document.getElementById('readinessMessage').textContent = messages[readiness] || '';

        const details = document.getElementById('readinessDetails');
        details.innerHTML = `
            <h4>Strong Areas:</h4>
            <ul>${progress.readiness.strongAreas.map(a => `<li>✓ ${a}</li>`).join('')}</ul>
            <h4>Areas for Improvement:</h4>
            <ul>${progress.readiness.weakAreas.map(a => `<li>⚠ ${a}</li>`).join('')}</ul>
        `;
    }

    renderWeakAreas(weakAreas) {
        const container = document.getElementById('weakAreasContainer');
        container.innerHTML = weakAreas.map(area => `
            <div class="weak-area">
                <h4>${area.name}</h4>
                <p>Type: ${area.type}</p>
                <p>Mastery: ${Math.round(area.masteryPercentage)}%</p>
                <p>Failures: ${area.failureCount}</p>
            </div>
        `).join('');

        if (weakAreas.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No weak areas identified!</p>';
        }
    }

    // Flashcards Functions
    setFlashcardMode(mode) {
        document.getElementById('allCardsBtn').classList.toggle('active', mode === 'all');
        document.getElementById('unmasteredBtn').classList.toggle('active', mode === 'unmastered');
        this.loadFlashcards(mode);
    }

    async loadFlashcards(mode) {
        mode = mode || (document.getElementById('unmasteredBtn').classList.contains('active') ? 'unmastered' : 'all');
        let cards = this.allCards;
        const moduleId = document.getElementById('flashcardModuleSelect').value;

        if (moduleId) {
            cards = cards.filter(c => c.module === moduleId);
        }

        if (mode === 'unmastered') {
            cards = cards.filter(c => !c.isMastered);
        }

        this.flashcards = cards;
        this.currentFlashcardIndex = 0;
        document.getElementById('flashcard').classList.remove('flipped');

        document.getElementById('totalCards').textContent = cards.length;
        document.getElementById('masteredCount').textContent = `${cards.filter(c => c.isMastered).length} mastered`;

        if (cards.length > 0) {
            this.showFlashcard();
        } else {
            document.getElementById('cardFront').textContent = 'No cards available';
            document.getElementById('cardBack').textContent = '';
        }
    }

    showFlashcard() {
        if (this.flashcards.length === 0) return;

        const card = this.flashcards[this.currentFlashcardIndex];
        const flashcardEl = document.getElementById('flashcard');

        flashcardEl.classList.remove('flipped');
        document.getElementById('cardFront').textContent = card.question;
        document.getElementById('cardBack').textContent = card.answer;
        document.getElementById('currentCard').textContent = this.currentFlashcardIndex + 1;

        if (card.hint) {
            document.querySelector('.card-hint').textContent = `Hint: ${card.hint}`;
        }
    }

    toggleFlashcard() {
        document.getElementById('flashcard').classList.toggle('flipped');
    }

    previousCard() {
        if (this.currentFlashcardIndex > 0) {
            this.currentFlashcardIndex--;
            this.showFlashcard();
        }
    }

    nextCard() {
        if (this.currentFlashcardIndex < this.flashcards.length - 1) {
            this.currentFlashcardIndex++;
            this.showFlashcard();
        }
    }

    async markCurrentCardMastered() {
        const card = this.flashcards[this.currentFlashcardIndex];
        if (!card) return;
        card.isMastered = true;
        localStorage.setItem('nos120.mastered', JSON.stringify(this.allCards.filter(c => c.isMastered).map(c => c.id)));
        document.getElementById('masteredCount').textContent = `${this.flashcards.filter(c => c.isMastered).length} mastered`;
        this.nextCard();
    }

    // Notes Functions
    renderNotes() {
        window.NotesView.render();
    }

    renderNotesLegacy() {
        const container = document.getElementById('notesContainer');
        const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
        function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
        container.innerHTML = window.NOTES.map(n => `
            <div class="card note-card" data-module="Module${n.m}">
                <h3>Module ${n.m}: ${n.title}</h3>
                ${n.sections.map(s => `<div class="note-section"><h4>${s.t}</h4><ul>${s.b.map(b => `<li>${fmt(b)}</li>`).join('')}</ul></div>`).join('')}
            </div>`).join('');
        this.filterNotes();
        return;
        container.innerHTML = this.notes.map(note => `
            <div class="card note-card" data-module="${note.module}">
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <div class="note-content">
                    ${note.concepts.length > 0 ? `
                        <div class="note-section">
                            <h4>Key Concepts</h4>
                            <ul>${note.concepts.map(c => `<li>${c}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    ${note.terminology.length > 0 ? `
                        <div class="note-section">
                            <h4>Terminology</h4>
                            <ul>${note.terminology.map(t => `<li>${t}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    ${note.keyCommands.length > 0 ? `
                        <div class="note-section">
                            <h4>Key Commands</h4>
                            <ul>${note.keyCommands.map(cmd => `<li><code>${cmd}</code></li>`).join('')}</ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.note-content')) {
                    card.querySelector('.note-content').classList.toggle('expanded');
                }
            });
        });

        this.filterNotes();
    }

    filterNotes() {
        window.NotesView.render();
    }

    filterNotesLegacy() {
        const searchTerm = document.getElementById('notesSearch').value.toLowerCase();
        const moduleFilter = document.getElementById('moduleSelect').value;

        document.querySelectorAll('.note-card').forEach(card => {
            const matchesSearch = card.textContent.toLowerCase().includes(searchTerm);
            const matchesModule = !moduleFilter || card.dataset.module === moduleFilter;
            card.style.display = (matchesSearch && matchesModule) ? '' : 'none';
        });
    }

    // Quizzes Functions
    renderQuizzes() {
        const container = document.getElementById('quizList');
        container.innerHTML = this.quizzes.map(quiz => `
            <div class="card quiz-item" data-quiz-id="${quiz.id}">
                <h4>${quiz.title}</h4>
                <p>${quiz.questions.length} questions</p>
                <div class="quiz-meta">
                    <span>${quiz.module}</span>
                    ${quiz.isFullTest ? '<span>🎯 Full Test</span>' : '<span>📋 Practice</span>'}
                    ${quiz.timeLimit ? `<span>⏱️ ${quiz.timeLimit}min</span>` : ''}
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.quiz-item').forEach(item => {
            item.addEventListener('click', () => {
                const quizId = item.dataset.quizId;
                this.startQuiz(quizId);
            });
        });
    }

    startQuiz(quizId) {
        const quiz = this.quizzes.find(q => q.id === quizId);
        if (!quiz) return;

        this.quizState = {
            currentIndex: 0,
            quiz: quiz,
            answers: {},
            startTime: Date.now()
        };

        document.getElementById('quizList').style.display = 'none';
        document.getElementById('quizResultsContainer').classList.add('hidden');
        document.getElementById('quizContainer').classList.remove('hidden');

        this.showQuestion();
    }

    showQuestion() {
        const quiz = this.quizState.quiz;
        const question = quiz.questions[this.quizState.currentIndex];

        document.getElementById('quizTitle').textContent = quiz.title;
        document.getElementById('questionNumber').textContent = 
            `Question ${this.quizState.currentIndex + 1} of ${quiz.questions.length}`;

        const container = document.getElementById('questionContainer');
        container.innerHTML = `
            <div class="question-text">${question.text}</div>
            ${this.renderQuestionOptions(question)}
        `;
    }

    renderQuestionOptions(question) {
        if (question.type === 'multiple-choice') {
            return `<div class="question-options">
                ${question.options.map((option, i) => `
                    <label class="option">
                        <input type="radio" name="answer" value="${i}" ${this.quizState.answers[question.id] === option ? 'checked' : ''}>
                        <span>${option}</span>
                    </label>
                `).join('')}
            </div>`;
        } else {
            return `<div class="question-options">
                <input type="text" class="input-field" id="answerInput" placeholder="Enter your answer" value="${(this.quizState.answers[question.id] || '').replace(/"/g, '&quot;')}">
            </div>`;
        }
    }

    getQuestionAnswer() {
        const question = this.quizState.quiz.questions[this.quizState.currentIndex];
        if (question.type === 'multiple-choice') {
            const checked = document.querySelector('input[name="answer"]:checked');
            return checked ? question.options[parseInt(checked.value)] : null;
        } else {
            return document.getElementById('answerInput')?.value || '';
        }
    }

    saveAnswer() {
        const q = this.quizState.quiz.questions[this.quizState.currentIndex];
        const answer = this.getQuestionAnswer();
        if (answer !== null && answer !== '') this.quizState.answers[q.id] = answer;
    }

    previousQuestion() {
        this.saveAnswer();

        if (this.quizState.currentIndex > 0) {
            this.quizState.currentIndex--;
            this.showQuestion();
        }
    }

    nextQuestion() {
        this.saveAnswer();

        if (this.quizState.currentIndex < this.quizState.quiz.questions.length - 1) {
            this.quizState.currentIndex++;
            this.showQuestion();
        }
    }

    async submitQuiz() {
        this.saveAnswer();

        const timeSpent = Math.floor((Date.now() - this.quizState.startTime) / 1000);

        try {
            const result = await fetch(`${this.apiBase}/quizzes/${this.quizState.quiz.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId: this.quizState.quiz.id,
                    answers: this.quizState.answers,
                    timeSpendSeconds: timeSpent
                })
            }).then(r => r.json());

            this.showQuizResults(result);
            await this.refreshDashboard();
        } catch (error) {
            this.showError('Failed to submit quiz');
        }
    }

    showQuizResults(result) {
        document.getElementById('quizContainer').classList.add('hidden');

        const percentage = result.percentageScore;
        const container = document.getElementById('quizResultsContainer');

        container.innerHTML = `
            <div class="card quiz-results">
                <h2>Quiz Results</h2>
                <div class="quiz-score">${Math.round(percentage)}%</div>
                <div class="quiz-feedback">
                    ${result.correctAnswers} of ${result.totalQuestions} correct
                </div>
                ${percentage >= 70 ? '<p style="color: var(--success-color);">Great job! You\'ve demonstrated solid understanding.</p>' :
                  percentage >= 50 ? '<p style="color: var(--warning-color);">Good effort! Review the questions you missed.</p>' :
                  '<p style="color: var(--error-color);">Continue studying this material and try again.</p>'}

                <div class="quiz-details">
                    <h3>Question Review</h3>
                    ${this.quizState.quiz.questions.map((q, i) => `
                        <div class="question-result ${result.questionResults[q.id] ? 'correct' : 'incorrect'}">
                            <strong>${result.questionResults[q.id] ? '✓' : '✗'} ${q.text}</strong>
                            ${!result.questionResults[q.id] ? `<p>Correct answer: ${q.correctAnswer}</p>` : ''}
                                                        ${q.explanation ? `<p><em>${q.explanation}</em></p>` : ''}
                        </div>
                    `).join('')}
                </div>

                <button class="btn-primary" onclick="location.reload()">Retake Quiz</button>
                <button class="btn-secondary" onclick="app.showSection('quizzes')">Back to Quizzes</button>
            </div>
        `;

        container.classList.remove('hidden');
    }

    // Commands Functions
    renderCommandList() {
        const container = document.getElementById('commandList');
        container.innerHTML = this.commands.map(cmd => `
            <div class="card command-card" data-command-id="${cmd.id}" data-module="${cmd.module}">
                <h4>${cmd.name}</h4>
                <p>${cmd.description}</p>
                <div class="command-details">
                    <h4>Syntax</h4>
                    <pre>${cmd.syntax}</pre>
                    <h4>Examples</h4>
                    <ul>${cmd.examples.map(e => `<li><code>${e}</code></li>`).join('')}</ul>
                    <h4>Common Flags</h4>
                    <ul>${cmd.commonFlags.map(f => `<li><code>${f}</code></li>`).join('')}</ul>
                    ${cmd.relatedConcepts.length > 0 ? `
                        <h4>Related Concepts</h4>
                        <ul>${cmd.relatedConcepts.map(c => `<li>${c}</li>`).join('')}</ul>
                    ` : ''}
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.command-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const details = card.querySelector('.command-details');
                details.classList.toggle('visible');
            });
        });

        this.filterCommands();
    }

    filterCommands() {
        const searchTerm = document.getElementById('commandSearch').value.toLowerCase();
        const moduleFilter = document.getElementById('commandModuleSelect').value;

        document.querySelectorAll('.command-card').forEach(card => {
            const matchesSearch = card.textContent.toLowerCase().includes(searchTerm);
            const matchesModule = !moduleFilter || card.dataset.module === moduleFilter;
            card.style.display = (matchesSearch && matchesModule) ? '' : 'none';
        });
    }

    populateCommandSelects() {
        const select = document.getElementById('testCommandSelect');
        select.innerHTML = '<option value="">Choose a command...</option>' + 
            this.commands.map(cmd => `<option value="${cmd.id}">${cmd.name}</option>`).join('');
    }

    // Terminal Functions
    switchTerminalMode(mode) {
        const testBtn = document.getElementById('modeTestBtn');
        const challengeBtn = document.getElementById('modeChallengeBtn');
        const testMode = document.getElementById('testYourselfMode');
        const challengeMode = document.getElementById('challengeMode');
        const shellBtn = document.getElementById('modeShellBtn');
        const shellMode = document.getElementById('shellMode');

        if (mode !== 'shell') window.Shell.onLeave();
        testBtn.classList.toggle('active', mode === 'test');
        challengeBtn.classList.toggle('active', mode === 'challenge');
        shellBtn.classList.toggle('active', mode === 'shell');
        testMode.classList.toggle('active', mode === 'test');
        challengeMode.classList.toggle('active', mode === 'challenge');
        shellMode.classList.toggle('active', mode === 'shell');
        if (mode === 'shell') document.getElementById('shellInput').focus();
    }

    async checkTestCommand() {
        const commandId = document.getElementById('testCommandSelect').value;
        const userInput = document.getElementById('testInput').value.trim();

        if (!commandId || !userInput) {
            this.showError('Please select a command and enter input');
            return;
        }

        try {
            const result = await fetch(`${this.apiBase}/commands/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    commandId: commandId,
                    userInput: userInput,
                    mode: 'test-yourself'
                })
            }).then(r => r.json());

            this.showValidationResult('test', result);
            document.getElementById('testInput').value = '';
        } catch (error) {
            this.showError('Failed to validate command');
        }
    }

    async checkChallengeCommand() {
        const userInput = document.getElementById('challengeInput').value.trim();

        if (!userInput) {
            this.showError('Please enter a command');
            return;
        }

        try {
            // For now, just provide feedback
            this.showValidationResult('challenge', {
                isCorrect: userInput.length > 0,
                feedback: 'Command challenge validation would work here'
            });
            document.getElementById('challengeInput').value = '';
        } catch (error) {
            this.showError('Failed to validate command');
        }
    }

    showValidationResult(mode, result) {
        const resultEl = document.getElementById(`${mode}Result`);
        resultEl.classList.add('visible');
        resultEl.className = `result-box visible ${result.isCorrect ? 'success' : 'error'}`;
        resultEl.innerHTML = `
            <strong>${result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>
            <p>${result.feedback}</p>
            ${result.correctAnswer ? `<p>Expected: <code>${result.correctAnswer}</code></p>` : ''}
        `;
    }

    // Progress Tracker
    renderProgressTracker() {
        const cards = this.flashcards;
        const cmds = this.commands;

        const masteredCards = cards.filter(c => c.isMastered).length;
        const masteredCmds = cmds.filter(c => c.isMastered).length;
        const total = cards.length + cmds.length;
        const overall = total > 0 ? ((masteredCards + masteredCmds) / total) * 100 : 0;

        document.getElementById('progressFill').style.width = `${overall}%`;
        document.getElementById('progressText').textContent = `${Math.round(overall)}%`;

        document.getElementById('flashcardProgressDetail').innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${cards.length > 0 ? (masteredCards / cards.length * 100) : 0}%"></div>
            </div>
            <p>${masteredCards} of ${cards.length} mastered</p>
        `;

        document.getElementById('commandProgressDetail').innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${cmds.length > 0 ? (masteredCmds / cmds.length * 100) : 0}%"></div>
            </div>
            <p>${masteredCmds} of ${cmds.length} mastered</p>
        `;

        document.getElementById('quizProgressDetail').innerHTML = '<p>Take more quizzes to track progress</p>';
    }

    async resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            try {
                await fetch(`${this.apiBase}/progress/reset`, { method: 'POST' });
                await this.loadData();
                this.showSection('dashboard');
            } catch (error) {
                this.showError('Failed to reset progress');
            }
        }
    }

    // Utility Functions
    showError(message) {
        console.error(message);
        // Could implement a toast notification here
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new StudyTerminal();
});
