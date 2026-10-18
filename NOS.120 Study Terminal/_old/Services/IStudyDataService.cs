using NOS._120_Study_Terminal.Models;

namespace NOS._120_Study_Terminal.Services;

public interface IStudyDataService
{
    // Notes
    List<StudyNote> GetNotes();
    List<StudyNote> GetNotesByModule(string moduleId);

    // Flashcards
    List<Flashcard> GetFlashcards();
    List<Flashcard> GetUnmasteredFlashcards();
    void MarkFlashcardMastered(string id);
    void MarkFlashcardUnmastered(string id);

    // Quizzes
    List<Quiz> GetQuizzes();
    List<Quiz> GetQuizzesByModule(string moduleId);
    QuizResult SubmitQuiz(string quizId, QuizSubmission submission);

    // Commands
    List<LinuxCommand> GetCommands();
    List<LinuxCommand> GetUnmasteredCommands();
    CommandValidationResult ValidateCommand(CommandValidation validation);
    void MarkCommandMastered(string id);

    // Progress
    ProgressSummary GetProgressSummary();
    List<WeakArea> GetWeakAreas();
    void ResetProgress();
}

public class StudyDataService : IStudyDataService
{
    private readonly List<StudyNote> _notes = new();
    private readonly Dictionary<string, Flashcard> _flashcards = new();
    private Dictionary<string, LinuxCommand> _commands = new();
    private List<Quiz> _quizzes = new();
    private readonly Dictionary<string, QuizResult> _quizResults = new();

    public StudyDataService()
    {
        Load();
    }

    private void Load()
    {
        _commands = StudyContent.BuildCommands().ToDictionary(c => c.Id);
        _quizzes = StudyContent.BuildQuizzes();
    }

    public List<StudyNote> GetNotes() => _notes;

    public List<StudyNote> GetNotesByModule(string moduleId) =>
        _notes.Where(n => n.Module == moduleId).ToList();

    public List<Flashcard> GetFlashcards() => _flashcards.Values.ToList();

    public List<Flashcard> GetUnmasteredFlashcards() =>
        _flashcards.Values.Where(f => !f.IsMastered).ToList();

    public void MarkFlashcardMastered(string id)
    {
        if (_flashcards.TryGetValue(id, out var card)) card.IsMastered = true;
    }

    public void MarkFlashcardUnmastered(string id)
    {
        if (_flashcards.TryGetValue(id, out var card)) card.IsMastered = false;
    }

    public List<Quiz> GetQuizzes() => _quizzes;

    public List<Quiz> GetQuizzesByModule(string moduleId) =>
        _quizzes.Where(q => q.Module == moduleId).ToList();

    private static string Normalize(string s) =>
        string.Join(' ', (s ?? string.Empty).Trim().ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries));

    public QuizResult SubmitQuiz(string quizId, QuizSubmission submission)
    {
        var quiz = _quizzes.FirstOrDefault(q => q.Id == quizId)
            ?? throw new ArgumentException("Quiz not found", nameof(quizId));

        int correct = 0;
        var questionResults = new Dictionary<string, bool>();

        foreach (var question in quiz.Questions)
        {
            bool isCorrect = submission.Answers.TryGetValue(question.Id, out var answer)
                && Normalize(answer) == Normalize(question.CorrectAnswer);
            questionResults[question.Id] = isCorrect;
            if (isCorrect) correct++;
        }

        var result = new QuizResult
        {
            QuizId = quizId,
            TotalQuestions = quiz.Questions.Count,
            CorrectAnswers = correct,
            PercentageScore = quiz.Questions.Count == 0 ? 0 : (double)correct / quiz.Questions.Count * 100,
            QuestionResults = questionResults,
            CompletedAt = DateTime.UtcNow,
            TimeSpendSeconds = submission.TimeSpendSeconds
        };

        _quizResults[quizId] = result;
        return result;
    }

    public List<LinuxCommand> GetCommands() => _commands.Values.ToList();

    public List<LinuxCommand> GetUnmasteredCommands() =>
        _commands.Values.Where(c => !c.IsMastered).ToList();

    public CommandValidationResult ValidateCommand(CommandValidation validation)
    {
        if (!_commands.TryGetValue(validation.CommandId, out var command))
            throw new ArgumentException("Command not found", nameof(validation));

        command.Attempts++;
        var names = command.Name.Split('/', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        var words = validation.UserInput.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries).ToList();
        if (words.FirstOrDefault() == "sudo") words.RemoveAt(0);
        var first = words.FirstOrDefault() ?? string.Empty;
        bool isCorrect = names.Any(n => n.Equals(first, StringComparison.Ordinal));

        if (isCorrect)
        {
            command.CorrectAttempts++;
            if (command.CorrectAttempts >= 3) command.IsMastered = true;
        }

        return new CommandValidationResult
        {
            IsCorrect = isCorrect,
            Feedback = isCorrect
                ? $"Good. {command.Description}."
                : $"Expected a command starting with '{command.Name}'.",
            CorrectAnswer = command.Examples.FirstOrDefault() ?? command.Syntax
        };
    }

    public void MarkCommandMastered(string id)
    {
        if (_commands.TryGetValue(id, out var command)) command.IsMastered = true;
    }

    public ProgressSummary GetProgressSummary()
    {
        var summary = new ProgressSummary
        {
            TotalFlashcards = _flashcards.Count,
            MasteredFlashcards = _flashcards.Values.Count(f => f.IsMastered),
            TotalCommands = _commands.Count,
            MasteredCommands = _commands.Values.Count(c => c.IsMastered),
            QuizzesTaken = _quizResults.Count,
            AverageQuizScore = _quizResults.Count > 0 ? _quizResults.Values.Average(r => r.PercentageScore) : 0
        };

        int total = summary.TotalFlashcards + summary.TotalCommands;
        int done = summary.MasteredFlashcards + summary.MasteredCommands;
        summary.OverallProgress = total > 0 ? (double)done / total * 100 : 0;

        foreach (var group in _commands.Values.GroupBy(c => c.Module))
        {
            var scores = _quizzes.Where(q => q.Module == group.Key && _quizResults.ContainsKey(q.Id))
                .Select(q => _quizResults[q.Id].PercentageScore).ToList();
            summary.ModuleProgress[group.Key] = new ModuleProgress
            {
                Module = group.Key,
                CommandsComplete = group.Count(c => c.IsMastered),
                CompletionPercentage = (double)group.Count(c => c.IsMastered) / group.Count() * 100,
                AverageQuizScore = scores.Count > 0 ? scores.Average() : 0
            };
        }

        var readiness = summary.Readiness;
        double score = (summary.OverallProgress + summary.AverageQuizScore) / 2;
        readiness.OverallReadiness = score >= 85 ? "very-ready" : score >= 70 ? "ready" : score >= 40 ? "partially-ready" : "not-ready";
        readiness.StrongAreas = summary.ModuleProgress.Values.Where(m => m.AverageQuizScore >= 80).Select(m => m.Module).ToList();
        readiness.WeakAreas = summary.ModuleProgress.Values.Where(m => m.AverageQuizScore > 0 && m.AverageQuizScore < 60).Select(m => m.Module).ToList();
        readiness.RecommendedFocus = readiness.WeakAreas.FirstOrDefault() ?? string.Empty;
        return summary;
    }

    public List<WeakArea> GetWeakAreas()
    {
        var areas = new List<WeakArea>();
        foreach (var quiz in _quizzes)
        {
            if (!_quizResults.TryGetValue(quiz.Id, out var r) || r.PercentageScore >= 70) continue;
            areas.Add(new WeakArea
            {
                Type = "module",
                Name = quiz.Title,
                MasteryPercentage = r.PercentageScore,
                FailureCount = r.TotalQuestions - r.CorrectAnswers
            });
        }
        return areas;
    }

    public void ResetProgress()
    {
        foreach (var card in _flashcards.Values)
        {
            card.IsMastered = false;
            card.Attempts = 0;
            card.CorrectAttempts = 0;
        }
        _quizResults.Clear();
        Load();
    }
}
