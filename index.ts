import axios from 'axios';
import * as fs from 'fs';
import * as Papa from 'papaparse';
import { writeToString } from 'fast-csv';

function generateConversationId(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

async function evaluateQueries(apiKey: string, filePath: string): Promise<void> {
    try {
        const csvContent = fs.readFileSync(filePath, 'utf8');
        const results = Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
        }).data as any[];

        const totalQuestions = results.length;
        let processedCount = 0;
        let startTime = Date.now();

        const showProgress = setInterval(() => {
            const elapsedMinutes = (Date.now() - startTime) / 60000;
            const avgTimePerSet = elapsedMinutes / (processedCount / 6);
            const setsLeft = (totalQuestions - processedCount) / 6;
            const estimatedTimeLeft = avgTimePerSet * setsLeft;

            console.log(`Progress: ${processedCount}/${totalQuestions} Estimated time left: ${estimatedTimeLeft.toFixed(2)} minutes.`);
        }, 20000);

        for (let i = 0; i < results.length; i++) {
            const question = results[i].question;
            const conversation_id = generateConversationId();

            results[i].conversation_id = conversation_id;  // Adding conversation_id to the result.

            try {
                const response = await axios.post('https://api.mendable.ai/v0/mendableChat', {
                    question: question,
                    anon_key: apiKey,
                    conversation_id: conversation_id,
                    shouldStream: false
                });

                results[i].mendableAnswer = response.data.answer.text;

                // Pause every 6 requests for 10 seconds
                if (i % 6 === 5) {
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }

                processedCount++;

            } catch (error) {
                console.error(`Failed to fetch answer for question: ${question}. Error:`, error);
            }
        }

        clearInterval(showProgress);  // Stop showing the progress once all questions are processed.

        // Create a timestamp-based filename for the output CSV.
        const currentTimestamp = new Date().toISOString().replace(/[\W_]+/g, "_");
        const csvOutput = await writeToString(results, { headers: true });
        fs.writeFileSync(`${currentTimestamp}_mendable_eval.csv`, csvOutput);

    } catch (error) {
        console.error('Error:', error);
    }
}

// Usage:
evaluateQueries('448a3e47-642b-48be-92d1-d67d0e44221c', '/workspaces/mendable_evaluation/perfect_apps_eval.csv')
    .then(() => console.log('Done'))
    .catch(err => console.error('Error:', err));
