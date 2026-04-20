import { fetchGovtInternships } from '../server/services/internship.service.js';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

async function test() {
    console.log("Starting scrape test...");
    try {
        const results = await fetchGovtInternships();
        console.log(`Found ${results.length} internships.`);
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
