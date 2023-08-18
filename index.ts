import axios from 'axios';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import { writeToString } from 'fast-csv';

async function evaluateQueries(apiKey: string, filePath: string) {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf8');
    
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    }).data as any[];

    for (let i = 0; i < results.length; i++) {
      const question = results[i].question;
      const response = await axios.post('https://api.mendable.ai/v0/mendableChat', {
        apiKey: apiKey,
        question: question,
      });
      results[i].mendableAnswer = response.data.answer;
    }

    const csvOutput = await writeToString(results, { headers: true });

    fs.writeFileSync('out.csv', csvOutput);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage:
evaluateQueries('6fb69289-e4fb-48be-a046-18b12910f5c7', '/workspaces/mendable_evaluation/perfect_apps_eval.csv')
  .then(() => console.log('Done'))
  .catch(err => console.error('Error:', err));
