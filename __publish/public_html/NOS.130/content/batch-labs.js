/* Batch file challenges. Each check is a case-insensitive regex tested against the script text. */
NOS.batchTemplates = [
  { name: "Blank", code: "@echo off\r\nrem Your script here\r\n\r\npause\r\n" },
  { name: "Hello", code: "@echo off\r\necho Hello, %USERNAME%!\r\necho Today is %DATE%\r\npause\r\n" },
  { name: "Backup", code: "@echo off\r\nset SRC=C:\\Users\\%USERNAME%\\Documents\r\nset DST=D:\\Backup\r\nif not exist \"%DST%\" mkdir \"%DST%\"\r\nrobocopy \"%SRC%\" \"%DST%\" /E\r\necho Backup finished.\r\npause\r\n" }
];
NOS.batchLabs = [
  { id: "b1", title: "Hello script", level: 1, task: "Turn off command echoing, print a greeting with echo, and keep the window open with pause.",
    checks: [["@echo off", /^\s*@echo\s+off/im], ["echo command", /^\s*echo\s+\S+/im], ["pause", /^\s*pause\b/im]], hint: "@echo off, echo Hello, pause" },
  { id: "b2", title: "Variables", level: 1, task: "Use set to create a variable called NAME and print it with %NAME%.",
    checks: [["set NAME=", /^\s*set\s+"?NAME=/im], ["uses %NAME%", /%NAME%/i]], hint: "set NAME=Student  then  echo %NAME%" },
  { id: "b3", title: "Ask the user", level: 2, task: "Use set /p to prompt for input and echo it back.",
    checks: [["set /p", /^\s*set\s+\/p\s+\w+=/im], ["echo the variable", /echo\s+.*%\w+%/i]], hint: "set /p NAME=Your name: " },
  { id: "b4", title: "Make a folder safely", level: 2, task: "Create C:\\Temp\\Lab only if it does not already exist, using if not exist and mkdir.",
    checks: [["if not exist", /if\s+not\s+exist/i], ["mkdir / md", /\b(mkdir|md)\s+/i], ["path C:\\Temp\\Lab", /C:\\Temp\\Lab/i]], hint: "if not exist C:\\Temp\\Lab mkdir C:\\Temp\\Lab" },
  { id: "b5", title: "Backup with robocopy", level: 2, task: "Copy a source folder to a destination with robocopy including subfolders (/E).",
    checks: [["robocopy", /\brobocopy\s+/i], ["/E switch", /\/E\b/i]], hint: "robocopy C:\\Data D:\\Backup /E" },
  { id: "b6", title: "Loop over files", level: 3, task: "Use a for loop to echo each .txt file in the current folder.",
    checks: [["for", /\bfor\s+(\/\w\s+)?%%\w\s+in\s*\(/i], ["*.txt", /\*\.txt/i], ["uses %%variable", /%%\w/]], hint: "for %%f in (*.txt) do echo %%f" },
  { id: "b7", title: "Network check", level: 3, task: "Ping a host, then use errorlevel to print Online or Offline.",
    checks: [["ping", /\bping\s+\S+/i], ["errorlevel", /errorlevel/i], ["Online/Offline", /online/i], ["goto or else", /goto|else|\|\|/i]], hint: "ping -n 1 8.8.8.8 >nul  then  if errorlevel 1 ..." },
  { id: "b8", title: "Log with a timestamp", level: 3, task: "Append a line with %DATE% and %TIME% to a log file using >>.",
    checks: [["%DATE%", /%DATE%/i], ["%TIME%", /%TIME%/i], [">> redirect", />>\s*\S+/]], hint: "echo %DATE% %TIME% >> log.txt" },
  { id: "b9", title: "Add a local user (admin script)", level: 3, task: "Use net user to add a user, then net localgroup to add them to Users. Include a comment (rem) warning that it needs admin rights.",
    checks: [["net user ... /add", /net\s+user\s+\S+\s+.*\/add/i], ["net localgroup", /net\s+localgroup\s+/i], ["rem comment", /^\s*(rem|::)\s*\S+/im]], hint: "net user lab P@ss1 /add" }
];
