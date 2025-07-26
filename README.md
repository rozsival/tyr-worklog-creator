# 🕒 Tyr Worklog Creator

*A delightfully lazy solution to the soul-crushing tedium of manual worklog entry.*

## 📖 The Story

You know that feeling when you've been working on the same project for weeks, and suddenly you realize you haven't
logged a single hour? And then you face the dreaded prospect of manually copy-pasting the same project ID, ticket ID,
and generic comment for 20+ individual days?

Yeah, that's exactly what happened here. Our developer was staring at weeks of unlogged work, contemplating the
mind-numbing task of creating identical worklog entries day by day, when the laziness kicked in and said: *"There has to
be a better way!"*

And thus, this beautiful piece of automation was born. Because why spend 20 minutes doing repetitive data entry when you
can spend 2 hours building a script to do it in 30 seconds? 🤷‍♂️

## ✨ What It Does

This CLI tool helps you bulk-create worklog entries for the Tyr system with minimal effort:

- 📅 **Smart Date Selection**: Shows all workdays in the current month (Monday-Friday, up to today)
- 🗓️ **Week Grouping**: Beautifully organized week-by-week with visual separators
- ☑️ **Bulk Selection**: Select/deselect days with checkboxes (all pre-selected by default)
- 🔧 **Environment Defaults**: Configure common project/ticket IDs in `.env` for one-click entry
- 🚀 **Batch Processing**: Creates all selected worklogs in one go
- 🕘 **Smart Timing**: Automatically sets start time to 9:00 AM

## 🚀 Quick Start

1. **Clone and install**:
   ```bash
   git clone <your-repo>
   cd tyr-worklog-hack
   pnpm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Configure your `.env`**:
   ```env
   # Required
   JWT=your_jwt_token_here
   GRAPHQL_URL=https://backend.apitree.tyr.app/graphql

   # Optional (but highly recommended for lazy people)
   PROJECT_ID=your_default_project_id
   TICKET_ID=your_default_ticket_id
   ```

4. **Run the magic**:
   ```bash
   pnpm start
   ```

## 🎯 Usage

The script will guide you through:

1. **Date Selection**: Choose which workdays to log (nicely grouped by weeks)
2. **Details Entry**: Enter comment, time spent (defaults to 8h), project, and ticket
3. **Preview & Confirm**: Review the operation before execution
4. **Batch Creation**: Sit back and watch your worklogs get created

## 🛠️ Requirements

- Node.js (recent version)
- pnpm
- Valid JWT token for the Tyr system
- A healthy appreciation for automation over manual labor

## 🎨 Example Output

```
🕒 Tyr Worklog Creator

? Select days for which you want to create worklogs:
── Week 1: Jul 7 (Mon) - Jul 11 (Fri) ──
◉ Jul 7 (Mon)
◉ Jul 8 (Tue)
◉ Jul 9 (Wed)
◉ Jul 10 (Thu)
◉ Jul 11 (Fri)

── Week 2: Jul 14 (Mon) - Jul 18 (Fri) ──
◉ Jul 14 (Mon)
...
```

## 🤝 Contributing

Found a bug? Want to add a feature? PRs welcome! Though let's be honest, this script perfectly serves its purpose of
eliminating worklog drudgery, so it might just stay beautifully simple.

## 📜 License

UNLICENSED - Because sometimes the best solutions are born from pure laziness and don't need fancy licensing.

---

*"Why do something manually when you can automate it?" - Every developer ever*

*Built with ❤️ and a healthy dose of laziness by someone who refused to copy-paste worklog entries for the 47th time.*
