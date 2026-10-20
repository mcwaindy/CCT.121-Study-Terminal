CCT.addChapter({
  id: "rpt", num: 4.5, title: "Digital Forensic Report Writing (Supplement)",
  summary: "Why reports matter, report types, structure, writing style, layout, and tool-generated reports. From the report writing slides (not the textbook).",

  notes: [
    { id: "importance", title: "Importance of Reports & Rule 26", category: "legal",
      summary: "What reports do, FRCP Rule 26 requirements, deposition records.",
      body: `
<div class="key">Reports <b>communicate investigation results, including expert opinion</b>. They can justify collecting more evidence, be used at a <b>probable cause hearing</b>, and communicate expert opinion.</div>
<ul>
<li><b>All US district courts</b> require expert witnesses to submit written reports; state courts are starting to.</li>
<li>Reports should <b>answer the questions you were retained to answer</b>.</li>
</ul>
<h3>FRCP Rule 26: the expert's written report</h3>
<ul>
<li>Testimony is based on <b>sufficient facts or data</b>.</li>
<li>Testimony is the product of <b>reliable principles and methods</b>.</li>
<li>The witness has <b>applied the principles and methods reliably</b> to the facts of the case.</li>
<li>Must specify <b>fees paid</b> for the expert's services and list <b>all other civil or criminal cases</b> in which the expert has testified.</li>
</ul>
<h3>Keep deposition notices / subpoenas</h3>
<p>Record: <b>jurisdiction, style of the case, cause number, date and location of the deposition, deponent's name</b>. Attorneys use <b>deposition banks</b> to research an expert's previous testimony; keep examples of your own prior testimony.</p>
<p class="dim">Connects to Module 1 (Daubert, FRE 702-705 style standards) and the Module 2 expert witness note.</p>` },

    { id: "scope", title: "Limiting a Report to Specifics", category: "legal",
      summary: "Start from the mission; know audience and purpose.",
      body: `
<ul>
<li>Every report to a client starts with the <b>job mission or goal</b>: find information on a specific subject, recover certain important documents, or recover certain file types with specific dates and times.</li>
<li><b>Before writing, identify your audience and the purpose</b> of the report.</li>
</ul>` },

    { id: "types", title: "Types of Reports", category: "legal",
      summary: "Examination plan, verbal, preliminary, written (affidavit/declaration).",
      body: `
<table><tr><th>Type</th><th>Key points</th></tr>
<tr><td><b>Examination plan</b></td><td>Questions to expect when testifying; the attorney uses it to guide your testimony; you can propose changes to clarify; helps the attorney learn forensic terms and functions</td></tr>
<tr><td><b>Verbal report</b></td><td>Less structured; <b>attorneys cannot be forced to release verbal reports</b></td></tr>
<tr><td><b>Preliminary report</b></td><td>Covers areas still unfinished: tests not concluded, interrogatories, document production, depositions</td></tr>
<tr><td><b>Written report</b></td><td>Affidavit or declaration: limit what you write, mind details, <b>thoroughly document and support</b> what you write</td></tr></table>
<h3>Written preliminary reports are high-risk</h3>
<ul>
<li>Anything you write down as part of your examination is <b>subject to discovery</b> (opposing attorneys seeking information from each other).</li>
<li>Better if there is <b>no written report</b> to provide. <b>Destroying it could be spoliation</b> (destroying or concealing evidence).</li>
<li>Include the same information as a verbal report plus: <b>billing to date and estimated cost to complete</b>; a <b>tentative</b> (not "preliminary") conclusion; areas for further investigation, with <b>attorney confirmation of the scope</b>.</li>
</ul>` },

    { id: "opinion", title: "Expert Opinion & Hypothetical Questions", category: "legal",
      summary: "Four conditions for opinion testimony; using hypotheticals.",
      body: `
<h3>An expert may testify to an opinion or conclusion if:</h3>
<ol>
<li>It depends on <b>special knowledge, skills, or training</b>.</li>
<li>The witness <b>qualifies as a true expert</b> in the field.</li>
<li>Testimony is to a <b>reasonable degree of certainty</b>.</li>
<li>The expert <b>knows the facts</b> the opinion is based on, or testifies to a <b>hypothetical question</b>.</li>
</ol>
<h3>Hypothetical questions</h3>
<ul>
<li>Based on <b>factual evidence</b>; guide and support your opinion. They can be <b>abused and overly complex</b>.</li>
<li>Opinions rest on knowledge and experience: state the facts needed to answer; <b>no unnecessary facts</b>.</li>
</ul>` },

    { id: "structure", title: "Report Structure", category: "legal",
      summary: "Abstract through appendixes; what each part does.",
      body: `
<p>Sample structure (names vary by organization): <b>Abstract, Table of contents, Body, Conclusion, References, Glossary, Acknowledgements, Appendixes</b>.</p>
<table><tr><th>Part</th><th>Purpose</th></tr>
<tr><td>Abstract</td><td>Condenses the report to the essentials</td></tr>
<tr><td>Body</td><td><b>Introduction and discussion</b> sections</td></tr>
<tr><td>Conclusion</td><td>Refers to the report's purpose, states the main points, draws conclusions, possibly <b>renders an opinion</b></td></tr>
<tr><td>References &amp; appendixes</td><td>Supporting material the work refers to</td></tr></table>` },

    { id: "style", title: "Writing Clearly: Style", category: "legal",
      summary: "Clarity, voice, objectivity, signposts.",
      body: `
<ul>
<li><b>Consider:</b> communicative quality, ideas and organization, grammar and vocabulary, punctuation and spelling.</li>
<li>Lay out ideas in <b>logical order</b>; build arguments piece by piece; group sentences into paragraphs and paragraphs into sections.</li>
<li><b>Avoid</b> jargon, slang, colloquialisms; <b>define technical terms</b>; consider your audience.</li>
<li>Natural language; avoid repetition, vague language, generalizations; use <b>active, not passive voice</b>; avoid too many details and personal observations.</li>
<li><b>Project objectivity:</b> calm, detached observations. A tone of objectivity is key to success.</li>
<li><b>Signposts:</b> draw attention to a point; help readers scan by highlighting main points and logical development.</li>
</ul>` },

    { id: "layout", title: "Layout, Numbering & Presentation", category: "legal",
      summary: "Numbering systems, methods, calculations, references, appendixes.",
      body: `
<table><tr><th>Numbering</th><th>Description</th></tr>
<tr><td><b>Decimal</b></td><td>Divides into sections (1, 1.1, 1.2); readers scan headings and see how parts relate</td></tr>
<tr><td><b>Legal-sequential</b></td><td>Used in <b>pleadings</b>; <b>Roman numerals</b> for major aspects, <b>Arabic numbers</b> for supporting information</td></tr></table>
<ul>
<li><b>Supporting material:</b> figures, tables, data, equations to tell the story.</li>
<li><b>Format consistently:</b> consistency matters more than the particular format.</li>
<li><b>Explain examination and data collection methods:</b> how you studied the problem, following logically from the purpose.</li>
<li><b>Calculations:</b> if you use hashing algorithms, give the <b>common name</b>.</li>
<li><b>Uncertainty and error analysis:</b> protects your credibility.</li>
<li><b>Results and conclusions:</b> explain findings with subheadings; save broader generalizations and summaries for the conclusion.</li>
<li><b>References:</b> by author's last name and year of publication; standard format.</li>
<li><b>Appendixes:</b> raw data, figures not used in the body, anticipated exhibits; <b>in the order referred to</b> in the report.</li>
</ul>` },

    { id: "toolreports", title: "Reports from Forensic Tools", category: "apps",
      summary: "Tool output formats and your responsibility.",
      body: `
<ul>
<li>Forensic tools <b>generate reports</b> during analysis. <b>It is still your responsibility to explain the significance</b> of the evidence.</li>
<li>Formats: <b>plaintext, Word and PDF, spreadsheet, HTML</b>.</li>
</ul>` }
  ],

  glossary: [
    ["FRCP Rule 26", "Federal Rule of Civil Procedure requiring an expert's written report: sufficient facts/data, reliable principles and methods, reliable application; fees and prior testimony listed.", ""],
    ["Deposition Bank", "Collection of experts' prior testimony that attorneys use to research an expert.", ""],
    ["Examination Plan", "Document of questions to expect at testimony; guides the attorney and educates them in forensic terms.", ""],
    ["Verbal Report", "Unstructured oral report; attorneys cannot be forced to release it.", ""],
    ["Preliminary Report", "Report on areas not yet completed; written versions are high-risk and discoverable.", ""],
    ["Discovery", "Process by which opposing attorneys seek information from each other.", ""],
    ["Spoliation", "Destroying or concealing evidence, including destroying a report.", ""],
    ["Affidavit / Declaration", "Written sworn statement form of report; limit content and support it.", ""],
    ["Abstract", "Condensed summary of a report's essential information.", ""],
    ["Decimal Numbering", "Section numbering (1, 1.1) that shows how parts relate.", ""],
    ["Legal-Sequential Numbering", "Pleading numbering: Roman numerals for major aspects, Arabic for supporting information.", ""],
    ["Signpost", "Writing device that draws the reader's attention to a point or the logical flow.", ""]
  ],

  cards: [
    ["Why do forensic reports matter?", "They communicate results and expert opinion, can justify collecting more evidence, and are used at probable cause hearings."],
    ["Who requires expert written reports?", "All US district courts; state courts increasingly."],
    ["What does FRCP Rule 26 require?", "Written report showing sufficient facts/data, reliable principles and methods, and reliable application; fees and previous testimony listed."],
    ["Which two items must a Rule 26 report list besides the opinion basis?", "Fees paid for the expert's services and all other cases in which the expert has testified."],
    ["Deposition notice details to keep?", "Jurisdiction, style of the case, cause number, date and location, deponent's name."],
    ["What is a deposition bank?", "Collection attorneys use to research an expert's prior testimony."],
    ["Where does every client report start?", "The job mission or goal."],
    ["Before writing, identify what?", "The audience and purpose."],
    ["Four report types?", "Examination plan, verbal, preliminary, written (affidavit/declaration)."],
    ["Why are verbal reports used?", "Less structured; attorneys can't be forced to release them."],
    ["Why are written preliminary reports high-risk?", "Subject to discovery; destroying them can be spoliation."],
    ["Extra items in a preliminary report?", "Billing to date and cost estimate; tentative conclusion; areas for further investigation with attorney's confirmation of scope."],
    ["Four conditions for expert opinion testimony?", "Special knowledge/skills/training; true expert; reasonable degree of certainty; knows the facts or answers a hypothetical."],
    ["Report structure?", "Abstract, table of contents, body, conclusion, references, glossary, acknowledgements, appendixes."],
    ["What is in the body?", "Introduction and discussion."],
    ["What does the conclusion do?", "Refers to purpose, states main points, draws conclusions, possibly renders an opinion."],
    ["Voice and tone?", "Active voice; objective, calm, detached; avoid jargon and vagueness."],
    ["What are signposts?", "Cues that highlight main points and logical development for scanning."],
    ["Two numbering systems?", "Decimal; legal-sequential (Roman numerals plus Arabic)."],
    ["Hashing in a report?", "Give the algorithm's common name."],
    ["Why include uncertainty and error analysis?", "Protects your credibility."],
    ["Where do broader generalizations go?", "In the conclusion."],
    ["Citation style?", "Author's last name and year; standard format."],
    ["Appendix order?", "In the order referred to in the report."],
    ["Tool-generated report formats?", "Plaintext, Word/PDF, spreadsheet, HTML."],
    ["Who explains evidence significance in a tool report?", "You, the examiner."]
  ],

  quiz: [
    ["Which court-related rule requires an expert's written report?", ["FRE 902", "FRCP Rule 26", "Daubert", "FRE 1002"], 1, ""],
    ["Which is NOT required in a Rule 26 report?", ["Fees paid", "Other cases testified in", "The expert's home address", "Reliable methods applied reliably"], 2, ""],
    ["Which keeps records of an expert's past testimony for attorneys?", ["Exhibit log", "Deposition bank", "Docket", "Plea deal"], 1, ""],
    ["A report to a client should begin with:", ["Conclusion", "Job mission or goal", "Glossary", "Hash values"], 1, ""],
    ["Which report type can an attorney not be forced to release?", ["Written", "Verbal", "Affidavit", "Preliminary written"], 1, ""],
    ["Why is a written preliminary report high-risk?", ["It is too short", "It is discoverable by opposing counsel", "It must be notarized", "It contains hashes"], 1, ""],
    ["Destroying a written preliminary report could be considered:", ["Good practice", "Spoliation", "Privilege", "Redaction"], 1, ""],
    ["In a preliminary report, conclusions should be called:", ["Final", "Tentative", "Absolute", "Sworn"], 1, ""],
    ["Which is NOT one of the four conditions for expert opinion?", ["Special knowledge", "Reasonable degree of certainty", "Being employed by law enforcement", "Knows the facts or answers a hypothetical"], 2, ""],
    ["The report section that condenses the essentials is the:", ["Abstract", "Appendix", "Glossary", "Body"], 0, ""],
    ["Legal-sequential numbering uses:", ["Roman numerals for major aspects, Arabic for support", "Letters only", "Decimals", "Bullets"], 0, "It is used in pleadings."],
    ["Preferred voice in forensic reports:", ["Passive", "Active", "Slang", "First-person narrative"], 1, ""],
    ["When you cite a hashing algorithm in a report you should:", ["Use initials only", "Give its common name", "Omit it", "Use only SHA-1"], 1, ""],
    ["Why include error and uncertainty analysis?", ["To lengthen the report", "To protect credibility", "Required by HIPAA", "To hide results"], 1, ""],
    ["Appendixes should be arranged:", ["Alphabetically", "In the order referred to in the report", "By size", "Randomly"], 1, ""],
    ["Which is NOT a typical forensic-tool report format?", ["Plaintext", "HTML", "Spreadsheet", "Video"], 3, ""],
    ["Who is responsible for explaining the significance of tool-generated findings?", ["The tool", "The examiner", "The judge", "The vendor"], 1, ""]
  ]
});
