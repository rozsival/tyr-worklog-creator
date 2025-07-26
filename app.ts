#!/usr/bin/env node

import { config } from 'dotenv';
import inquirer, { CheckboxChoiceOptions } from 'inquirer';

config();

interface WorklogInput {
  started: string;
  comment: string;
  timeSpentString: string;
  project: string;
  ticket: string;
}

// Get all work days (Monday-Friday) in current month
function getWorkDaysInCurrentMonth(): Date[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today at 00:00:00
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const workDays: Date[] = [];

  for (let day = new Date(firstDay); day <= lastDay; day.setDate(day.getDate() + 1)) {
    const dayOfWeek = day.getDay();
    // Monday = 1, Friday = 5 AND not in the future
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && day <= today) {
      workDays.push(new Date(day));
    }
  }

  return workDays;
}

// Group work days by weeks
function groupWorkDaysByWeek(workDays: Date[]): Date[][] {
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  for (const day of workDays) {
    // If it's Monday (1) and we have days in current week, start a new week
    if (day.getDay() === 1 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }

  // Add the last week if it has days
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

// Format date for display (shorter format)
function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  }) + ` (${date.toLocaleDateString('en-US', { weekday: 'short' })})`;
}

// Format date for display (full format for summary)
function formatDateForSummary(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format date for GraphQL (ISO string with 9:00 AM time)
function formatDateForGraphQL(date: Date): string {
  const isoDate = new Date(date);
  isoDate.setHours(9, 0, 0, 0);
  return isoDate.toISOString();
}

// Execute GraphQL mutation
async function executeWorklogMutation(input: WorklogInput): Promise<any> {
  const query = `
    mutation WorklogCreate($input: WorklogCreateInput!) {
      result: createWorklog(input: $input) {
        id
        __typename
      }
    }
  `;

  const response = await fetch(process.env.GRAPHQL_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.JWT}`,
    },
    body: JSON.stringify({
      query,
      operationName: 'WorklogCreate',
      variables: { input }
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

async function main() {
  console.log('🕒 Tyr Worklog Creator\n');

  // Check for required environment variables
  if (!process.env.JWT) {
    console.error('❌ Error: JWT token is not set in .env file');
    process.exit(1);
  }

  if (!process.env.GRAPHQL_URL) {
    console.error('❌ Error: GRAPHQL_URL is not set in .env file');
    process.exit(1);
  }

  // Get work days for current month
  const workDays = getWorkDaysInCurrentMonth();
  const weekGroups = groupWorkDaysByWeek(workDays);

  // Allow user to exclude dates
  const choices: (CheckboxChoiceOptions | inquirer.Separator)[] = [];

  weekGroups.forEach((week, weekIndex) => {
    if (weekIndex > 0) {
      choices.push(new inquirer.Separator());
    }

    const weekStart = week[0];
    const weekEnd = week[week.length - 1];
    choices.push(new inquirer.Separator(`── Week ${weekIndex
    + 1}: ${formatDateForDisplay(weekStart)} - ${formatDateForDisplay(weekEnd)} ──`));

    week.forEach((day) => {
      const globalIndex = workDays.indexOf(day);
      choices.push({
        name: `${formatDateForDisplay(day)}`,
        value: globalIndex,
        checked: true
      });
    });
  });

  const { selectedDays } = await inquirer.prompt<{ selectedDays: number[] }>([
    {
      type: 'checkbox',
      name: 'selectedDays',
      message: 'Select days for which you want to create worklogs:',
      choices: choices,
      pageSize: 20
    }
  ]);

  const finalWorkDays = selectedDays.map((index) => workDays[index]);

  if (finalWorkDays.length === 0) {
    console.log('❌ No days selected. Exiting...');
    process.exit(0);
  }

  // Get user inputs
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'comment',
      message: 'Comment (required):',
      validate: (input: string) => input.trim() !== '' || 'Comment is required'
    },
    {
      type: 'input',
      name: 'timeSpentString',
      message: 'Time spent:',
      default: '8h'
    },
    {
      type: 'input',
      name: 'project',
      message: 'Project ID:',
      default: process.env.PROJECT_ID || ''
    },
    {
      type: 'input',
      name: 'ticket',
      message: 'Ticket ID:',
      default: process.env.TICKET_ID || ''
    }
  ]);

  // Show summary
  console.log('\n📋 Operation summary:');
  console.log(`Comment: ${answers.comment}`);
  console.log(`Time: ${answers.timeSpentString}`);
  console.log(`Project: ${answers.project}`);
  console.log(`Ticket: ${answers.ticket}`);
  console.log('\nDays for which worklogs will be created:');
  finalWorkDays.forEach((day, index) => {
    console.log(`${index + 1}. ${formatDateForSummary(day)} (${formatDateForGraphQL(day)})`);
  });

  const graphqlOperation = {
    query: `mutation WorklogCreate($input: WorklogCreateInput!) {
      result: createWorklog(input: $input) {
        id
        __typename
      }
    }`,
    operationName: 'WorklogCreate',
    variables: {
      input: {
        started: '[DATE_WILL_BE_REPLACED]',
        comment: answers.comment,
        timeSpentString: answers.timeSpentString,
        project: answers.project,
        ticket: answers.ticket
      }
    }
  };

  console.log('\n🔍 GraphQL operation:');
  console.log(JSON.stringify(graphqlOperation, null, 2));

  // Final confirmation
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Proceed with creating worklogs?',
      default: false
    }
  ]);

  if (!confirm) {
    console.log('❌ Operation cancelled by user');
    process.exit(0);
  }

  // Execute mutations
  console.log('\n🚀 Creating worklogs...');

  for (let i = 0; i < finalWorkDays.length; i++) {
    const day = finalWorkDays[i];
    const input: WorklogInput = {
      started: formatDateForGraphQL(day),
      comment: answers.comment,
      timeSpentString: answers.timeSpentString,
      project: answers.project,
      ticket: answers.ticket
    };

    try {
      console.log(`⏳ Creating worklog for ${formatDateForSummary(day)}...`);
      const result = await executeWorklogMutation(input);

      if (result.errors) {
        console.error(`❌ Error for ${formatDateForSummary(day)}:`, result.errors);
      } else {
        console.log(`✅ Worklog created for ${formatDateForSummary(day)} (ID: ${result.data.result.id})`);
      }
    } catch (error) {
      console.error(`❌ Error creating worklog for ${formatDateForSummary(day)}:`, error);
    }
  }

  console.log('\n🎉 Done!');
}

await main();
