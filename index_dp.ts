import axios from 'axios';

export type DataPoint = {
    id: number;
    question_text: string;
    correct_answer: string;
    dataset_id: number;
    created_at: string;
    sources: any[];
    mendableAnswer?: string;
    conversation_id?: number;
}

function generateConversationId(): number {
    return Math.floor(10000 + Math.random() * 90000);
}

const questionsPerBatch = 6;
const timeoutDuration = 10000;

async function evaluateQueries(apiKey: string, dataPoints: DataPoint[]): Promise<DataPoint[]> {
    try {
        const results = [...dataPoints];
        const totalQuestions = results.length;
        let processedCount = 0;
        let startTime = Date.now();

        const showProgress = setInterval(() => {
            const elapsedMinutes = (Date.now() - startTime) / 60000;
            const avgTimePerSet = elapsedMinutes / (processedCount / questionsPerBatch);
            const setsLeft = (totalQuestions - processedCount) / questionsPerBatch;
            const estimatedTimeLeft = avgTimePerSet * setsLeft;

            console.log(`Progress: ${processedCount}/${totalQuestions} Estimated time left: ${estimatedTimeLeft.toFixed(2)} minutes.`);
        }, 10000);

        for (let i = 0; i < results.length; i++) {
            const question = results[i].question_text;
            const conversation_id = generateConversationId();

            results[i].conversation_id = conversation_id;

            try {
                const response = await axios.post('https://api.mendable.ai/v0/mendableChat', {
                    question: question,
                    anon_key: apiKey,
                    conversation_id: conversation_id,
                    shouldStream: false
                });

                results[i].mendableAnswer = response.data.answer.text;

                if (i % questionsPerBatch === (questionsPerBatch - 1)) {
                    await new Promise(resolve => setTimeout(resolve, timeoutDuration));
                }

                processedCount++;

            } catch (error) {
                console.error(`Failed to fetch answer for question: ${question}. Error:`, error);
            }
        }

        clearInterval(showProgress);
        
        return results;

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

const sampleDataPoints: DataPoint[] = [
    {
        id: 1,
        question_text: "How do I import an app file in PerfectApps?",
        correct_answer: "",  // Fill in with expected correct answers or leave empty
        dataset_id: 101,
        created_at: "2023-08-21T10:00:00.000Z",
        sources: [],
    },
    {
        id: 2,
        question_text: "How do I create a personal folder in the View Apps section?",
        correct_answer: "",
        dataset_id: 101,
        created_at: "2023-08-21T10:05:00.000Z",
        sources: [],
    },
    {
        id: 3,
        question_text: "What steps should I follow to add an e-mail server as an account resource?",
        correct_answer: "",
        dataset_id: 101,
        created_at: "2023-08-21T10:10:00.000Z",
        sources: [],
    },
    {
        id: 4,
        question_text: "How can I give a user the ability to use the Archiving function?",
        correct_answer: "",
        dataset_id: 101,
        created_at: "2023-08-21T10:15:00.000Z",
        sources: [],
    },
    {
        id: 5,
        question_text: "What are the steps to archive app instances?",
        correct_answer: "",
        dataset_id: 101,
        created_at: "2023-08-21T10:20:00.000Z",
        sources: [],
    }
];

// Now you can use the `sampleDataPoints` array to test the function.


// Usage:
evaluateQueries('448a3e47-642b-48be-92d1-d67d0e44221c', sampleDataPoints)
    .then(updatedData => console.log(updatedData))
    .catch(err => console.error('Error:', err));
