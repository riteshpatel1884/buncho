**What the interviewer is really testing**

To verify actual, practical usage and check your skill level in basic prompt engineering.

**Expert answer**

**Situation:** In my previous internship, we needed to categorize a spreadsheet containing over 300 customer feedback submissions into specific sentiment tags, but we were short on time.

**Task:** I needed to sort this data accurately without wasting days manually reading each line.

**Action:** I decided to use a Large Language Model. Instead of a generic query, I wrote a specific prompt: *"Act as a senior customer success manager. Review the following list of customer feedback. Categorize each into one of four buckets: Product Bug, Feature Request, Billing Issue, or Praise. Provide the output strictly in a clean markdown table."*

**Result:** The AI processed the entire list in seconds with roughly 90% accuracy. I spent about an hour auditing the data and correcting the misclassified points. It saved our team a full day of manual labor.

**Why this works**

It uses STAR, quotes a real prompt with a role, a closed label set and a strict output format, and shows human verification (an hour auditing the output) with a measurable result.

**Tips to make it yours**

- Use the STAR structure: Situation, Task, Action, Result.
- Quote the real prompt. Good prompts set a role, fixed categories and a strict output format.
- Mention how you checked the output, and put a number on the result.
