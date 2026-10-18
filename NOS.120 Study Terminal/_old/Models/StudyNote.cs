namespace NOS._120_Study_Terminal.Models;

public class StudyNote
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Module { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public List<string> Concepts { get; set; } = new();
    public List<string> KeyCommands { get; set; } = new();
    public List<string> Terminology { get; set; } = new();
}

public class Flashcard
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Module { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public string? Hint { get; set; }
    public bool IsMastered { get; set; } = false;
    public int Attempts { get; set; } = 0;
    public int CorrectAttempts { get; set; } = 0;
}

public class Quiz
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Module { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public List<QuizQuestion> Questions { get; set; } = new();
    public bool IsFullTest { get; set; } = false;
    public int? TimeLimit { get; set; } // in minutes
}

public class QuizQuestion
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Text { get; set; } = string.Empty;
    public string Type { get; set; } = "multiple-choice"; // multiple-choice, fill-blank, true-false
    public List<string>? Options { get; set; }
    public string CorrectAnswer { get; set; } = string.Empty;
    public string? Explanation { get; set; }
}

public class QuizSubmission
{
    public string QuizId { get; set; } = string.Empty;
    public Dictionary<string, string> Answers { get; set; } = new();
    public int TimeSpendSeconds { get; set; }
}

public class QuizResult
{
    public string QuizId { get; set; } = string.Empty;
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public double PercentageScore { get; set; }
    public Dictionary<string, bool> QuestionResults { get; set; } = new();
    public DateTime CompletedAt { get; set; }
    public int TimeSpendSeconds { get; set; }
}

public class LinuxCommand
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Module { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Syntax { get; set; } = string.Empty;
    public List<string> Examples { get; set; } = new();
    public List<string> CommonFlags { get; set; } = new();
    public List<string> RelatedConcepts { get; set; } = new();
    public bool IsMastered { get; set; } = false;
    public int Attempts { get; set; } = 0;
    public int CorrectAttempts { get; set; } = 0;
}

public class CommandValidation
{
    public string CommandId { get; set; } = string.Empty;
    public string UserInput { get; set; } = string.Empty;
    public string Mode { get; set; } = "test-yourself"; // test-yourself, command-challenge
}

public class CommandValidationResult
{
    public bool IsCorrect { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public string? CorrectAnswer { get; set; }
}

public class ProgressSummary
{
    public double OverallProgress { get; set; }
    public int TotalFlashcards { get; set; }
    public int MasteredFlashcards { get; set; }
    public int TotalCommands { get; set; }
    public int MasteredCommands { get; set; }
    public int QuizzesTaken { get; set; }
    public double AverageQuizScore { get; set; }
    public Dictionary<string, ModuleProgress> ModuleProgress { get; set; } = new();
    public ReadinessAssessment Readiness { get; set; } = new();
}

public class ModuleProgress
{
    public string Module { get; set; } = string.Empty;
    public double CompletionPercentage { get; set; }
    public int FlashcardsComplete { get; set; }
    public int CommandsComplete { get; set; }
    public double AverageQuizScore { get; set; }
}

public class ReadinessAssessment
{
    public string OverallReadiness { get; set; } = "not-ready"; // not-ready, partially-ready, ready, very-ready
    public List<string> WeakAreas { get; set; } = new();
    public List<string> StrongAreas { get; set; } = new();
    public string RecommendedFocus { get; set; } = string.Empty;
}

public class WeakArea
{
    public string Type { get; set; } = string.Empty; // concept, command, module
    public string Name { get; set; } = string.Empty;
    public double MasteryPercentage { get; set; }
    public int FailureCount { get; set; }
}
