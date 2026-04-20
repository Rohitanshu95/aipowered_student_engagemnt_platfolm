import axios from 'axios';
import * as cheerio from 'cheerio';

let cache = {
    data: null,
    lastFetched: null
};

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Main Service to aggregate trending govt internships
 */
/**
 * Main Service to aggregate trending govt internships
 */
export const fetchGovtInternships = async (force = false) => {
    // Check Cache (Bypass if forced)
    if (!force && cache.data && cache.lastFetched && (Date.now() - cache.lastFetched < CACHE_DURATION)) {
        console.log("Serving internships from cache");
        return cache.data;
    }

    console.log(`Fetching fresh internship data from govt portals (Force: ${force})...`);
    
    const results = [];

    try {
        // 1. AICTE Portal Scraping
        try {
            console.log("Scraping AICTE...");
            const aicteResponse = await axios.get('https://internship.aicte-india.org/recentlyposted.php', { 
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            const $ = cheerio.load(aicteResponse.data);
            
            let aicteCount = 0;
            $('.box_intern_list').each((i, el) => {
                const title = $(el).find('.intern_title, h4').text().trim();
                const org = $(el).find('.intern_org, .company_name').text().trim();
                const location = $(el).find('.location').text().trim() || "India";
                const stipend = $(el).find('.stipend').text().trim() || "As per norms";
                const duration = $(el).find('.duration').text().trim() || "2-6 Months";
                const closeDate = $(el).find('.last_date').text().trim() || "See portal";
                const relativeLink = $(el).find('a.btn-primary').attr('href');
                
                if (title && org) {
                    aicteCount++;
                    results.push({
                        id: `aicte-${i}-${Date.now()}`,
                        source: "AICTE Portal",
                        title,
                        org,
                        stipend,
                        duration,
                        location,
                        openDate: "Recently Posted",
                        closeDate,
                        link: relativeLink ? `https://internship.aicte-india.org/${relativeLink}` : 'https://internship.aicte-india.org/recentlyposted.php',
                        type: "Govt Sponsored"
                    });
                }
            });
            console.log(`AICTE Scrape successful: Found ${aicteCount} items`);
        } catch (e) { 
            console.error("AICTE Scrape Failed:", e.message); 
        }

        // 2. NITI Aayog Scraper
        try {
            console.log("Scraping NITI Aayog...");
            const nitiUrl = 'https://workforindia.niti.gov.in/intern/InternshipEntry/homepage.aspx';
            const nitiResponse = await axios.get(nitiUrl, { timeout: 10000 });
            const $ = cheerio.load(nitiResponse.data);
            
            // Look for application window status
            const statusText = $('body').text();
            const isOpen = statusText.toLowerCase().includes('apply online') || 
                           statusText.toLowerCase().includes('application form');
            
            results.push({
                id: `niti-${Date.now()}`,
                source: "NITI Aayog",
                title: "Public Policy Internship",
                org: "NITI Aayog, Govt of India",
                stipend: "Unpaid / Research-based",
                duration: "6-12 Weeks",
                location: "New Delhi / Remote",
                openDate: "1st of every month",
                closeDate: isOpen ? "10th of this month" : "Submission Closed (Opens 1st May)",
                link: nitiUrl,
                type: isOpen ? "Active" : "Monthly Recurring"
            });
        } catch (e) {
            console.error("NITI Aayog Scrape Failed:", e.message);
        }

        // 3. PM Internship Portal (Attempt to find featured list)
        try {
            console.log("Scraping PM Internship...");
            const pmUrl = 'https://pminternship.mca.gov.in/';
            const pmResponse = await axios.get(pmUrl, { timeout: 10000 });
            const $ = cheerio.load(pmResponse.data);
            
            // Check for landing page notifications or cards if they exist in static HTML
            const featuredCount = 0;
            // Note: PM portal is JS heavy, we mostly provide the direct link as "active" 
            // but we can look for specific announcement banners
            results.push({
                id: `pm-${Date.now()}`,
                source: "PM Internship Portal",
                title: "National Internship Scheme (MCA)",
                org: "Top 500 Companies (Partnered)",
                stipend: "₹5,000/month (Fixed)",
                duration: "12 Months",
                location: "Across India",
                openDate: "Check Portal for Wave 3",
                closeDate: "Rolling Admissions",
                link: pmUrl,
                type: "National Scheme"
            });
        } catch (e) {
            console.error("PM Internship Scrape Failed:", e.message);
        }

        // 4. Featured Industry & Premium Roles (Demo Data)
        results.unshift(
            {
                id: `demo-1-${Date.now()}`,
                source: "Google Careers",
                title: "Software Engineer Intern (Cloud)",
                org: "Google India",
                stipend: "₹1,00,000/month",
                duration: "10-12 Weeks",
                location: "Bangalore / Hyderabad",
                openDate: "April 2026",
                closeDate: "Rolling",
                link: "https://www.google.com/about/careers/applications/jobs/results/",
                type: "Premium Industry",
                description: "Work on large scale distributed systems, Kubernetes, and Golang backend services for Google Cloud Platform."
            },
            {
                id: `demo-2-${Date.now()}`,
                source: "ISRO Portal",
                title: "Research Intern (Space Apps)",
                org: "ISRO - Space Applications Centre",
                stipend: "₹25,000/month",
                duration: "6 Months",
                location: "Ahmedabad",
                openDate: "Open Now",
                closeDate: "May 15, 2026",
                link: "https://www.isro.gov.in/Careers.html",
                type: "Research Govt",
                description: "Assist in developing satellite image processing algorithms and geospatial data analytics using Python and C++."
            },
            {
                id: `demo-3-${Date.now()}`,
                source: "Tesla India",
                title: "AI & Autopilot Intern",
                org: "Tesla India R&D",
                stipend: "₹65,000/month",
                duration: "3-6 Months",
                location: "Pune / Remote",
                openDate: "Limited Slots",
                closeDate: "June 2026",
                link: "https://www.tesla.com/careers",
                type: "Hardware/AI",
                description: "Implement computer vision models for edge devices and optimize neural network performance for real-time inference."
            }
        );

        // Final Update Cache
        if (results.length > 0) {
            cache.data = results;
            cache.lastFetched = Date.now();
        }

        return results;
    } catch (error) {
        console.error("Aggregation Error:", error);
        return results;
    }
};
