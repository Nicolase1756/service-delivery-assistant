

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ReportedIssue, IssueStatus, IssueCategory, IssuePriority, CouncillorStats, Department, SentimentData } from "../types";
import { DepartmentalPerformance } from "./useExecutiveStats";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set for Gemini. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const suggestCategory = async (description: string, photoBase64: string | null): Promise<{ category: IssueCategory, priority: IssuePriority } | null> => {
    if (!API_KEY) {
        console.warn("AI features disabled. API_KEY not set.");
        return null;
    }

    const textPart = {
        text: `Analyze the following service delivery issue report. Based on the description and/or image, determine the most likely category and urgency level (priority).
        
        Description: "${description}"

        The category must be one of the following exact values: [${Object.values(IssueCategory).join(', ')}].
        The priority must be one of the following exact values: [${Object.values(IssuePriority).join(', ')}].
        - Use 'High' priority for critical issues like major water leaks, power outages, or public safety hazards.
        - Use 'Medium' priority for significant but not critical issues like large potholes or broken streetlights.
        - Use 'Low' priority for minor issues like waste removal delays or small graffiti.

        Return a single, valid JSON object with "category" and "priority" keys. Do not add any other text or markdown formatting.
        `,
    };

    const contents: { parts: any[] } = { parts: [textPart] };

    if (photoBase64) {
        const mimeType = photoBase64.substring(5, photoBase64.indexOf(';'));
        const data = photoBase64.substring(photoBase64.indexOf(',') + 1);
        const imagePart = {
            inlineData: {
                mimeType,
                data,
            },
        };
        contents.parts.push(imagePart);
    }
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, enum: Object.values(IssueCategory) },
                        priority: { type: Type.STRING, enum: Object.values(IssuePriority) },
                    },
                    required: ["category", "priority"],
                },
            },
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (Object.values(IssueCategory).includes(result.category) && Object.values(IssuePriority).includes(result.priority)) {
            return result;
        } else {
            console.error("AI response has invalid category or priority", result);
            return null;
        }

    } catch (error) {
        console.error("Error suggesting category with Gemini:", error);
        return null;
    }
};


export const generateAccountabilityReport = async (
    issues: ReportedIssue[], 
    sentiment: SentimentData,
    avgResolutionTimeMs: number | null
): Promise<string> => {
    if (!API_KEY) {
        return "AI report generation is disabled. Please configure the API_KEY environment variable.";
    }

    const totalIssues = issues.length;
    const resolvedIssues = issues.filter(i => i.status === IssueStatus.RESOLVED).length;
    const pendingIssues = issues.filter(i => i.status === IssueStatus.PENDING).length;
    const inProgressIssues = issues.filter(i => i.status === IssueStatus.IN_PROGRESS).length;
    const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;
    
    const formattedAvgTime = avgResolutionTimeMs 
        ? `${(avgResolutionTimeMs / (1000 * 3600 * 24)).toFixed(1)} days` 
        : 'N/A';

    const issuesByCategory = issues.reduce<Record<string, number>>((acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
    }, {});

    const prompt = `
        As a municipal performance analyst, generate a public-facing transparency report based on the following service delivery data.
        The tone should be professional, transparent, and easy for residents to understand.
        Your analysis must be based *only* on the data provided below. Do not invent new data.

        **Data Summary:**
        - Total Issues Reported: ${totalIssues}
        - Resolved Issues: ${resolvedIssues}
        - Resolution Rate: ${resolutionRate.toFixed(1)}%
        - Pending Issues: ${pendingIssues}
        - In Progress Issues: ${inProgressIssues}
        - Average Resolution Time: ${formattedAvgTime}
        - Breakdown by Category: ${JSON.stringify(issuesByCategory, null, 2)}
        - Community Sentiment: ${sentiment.positivePercentage.toFixed(1)}% positive (${sentiment.satisfied} satisfied, ${sentiment.unsatisfied} unsatisfied reviews)

        **Report Structure (use these exact headings):**
        ### 📊 Overall Performance Snapshot
        - Start with a brief, high-level overview. Mention the total issues, resolution rate, and average resolution time.

        ### ✅ Key Achievements
        - Mention the number of resolved issues and highlight the positive community sentiment percentage.

        ### 📈 Community Sentiment
        - Briefly summarize the community feedback based on the sentiment data (satisfied vs. unsatisfied counts).

        ### 🎯 Areas for Focus
        - Point out the categories with the most reports and the number of pending issues. Frame it as a commitment to improve.
        
        ### 💬 Concluding Remarks
        - End with a commitment to improving service delivery and thank residents for their engagement.
        
        **Formatting Rules:**
        - Use clean Markdown.
        - Use the exact headings provided, including the emojis.
        - Use bullet points (starting with "- ") for lists.
        - Use bold text with asterisks (**text**).
        - Do not use any HTML tags.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating report with Gemini:", error);
        return "There was an error generating the AI report. Please try again later.";
    }
};

export const generateCouncillorBriefing = async (stats: CouncillorStats): Promise<string> => {
    if (!API_KEY) {
        return "AI briefing is disabled. API_KEY not set.";
    }

    const prompt = `
        As an expert municipal analyst, provide a concise weekly briefing for the Ward ${stats.ward} Councillor, ${stats.councillor}.
        Your analysis must be based *only* on the data provided below. Be direct, insightful, and frame your points as actionable intelligence.
        Use Markdown for formatting.

        **Data for Ward ${stats.ward}:**
        - Total Issues: ${stats.totalIssues}
        - Resolution Rate: ${stats.resolutionRate.toFixed(1)}%
        - Average Resolution Time: ${stats.avgResolutionTimeMs ? (stats.avgResolutionTimeMs / (1000 * 3600 * 24)).toFixed(1) + ' days' : 'N/A'}
        - Community Sentiment: ${stats.sentiment.positivePercentage.toFixed(1)}% positive
        - Top 3 Issue Categories: ${stats.categoryBreakdown.slice(0, 3).map(c => `${c.name} (${c.count})`).join(', ')}
        - Issue Trend (Last 30 Days): The data shows a trend of reported vs. resolved issues. Analyze if there is a growing backlog or effective clearing of issues.

        **Briefing Structure (use these exact headings):**
        ### Key Insights
        - Provide 2-3 bullet points on the most important takeaways from the data. Is the resolution rate good? Is sentiment high or low? Is there a notable trend?

        ### Areas of Concern
        - Identify the top 1-2 problem areas. Focus on the category with the most reports or a negative trend (e.g., "The backlog of Pothole reports is increasing").

        ### Positive Developments
        - Highlight one key success. This could be a high resolution rate, positive sentiment, or clearing issues faster than they are reported.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating councillor briefing with Gemini:", error);
        return "An error occurred while generating the AI briefing. Please try again.";
    }
};


export const generateExecutiveSummary = async (
    overallResolutionRate: number,
    openIssuesCount: number,
    departmentalPerformance: DepartmentalPerformance[],
    criticalIssuesCount: number
): Promise<string> => {
    if (!API_KEY) {
        return "AI summary is disabled. API_KEY not set.";
    }
    
    const topPerformer = departmentalPerformance.length > 0 ? departmentalPerformance[0] : null;
    const bottomPerformer = departmentalPerformance.length > 1 ? departmentalPerformance[departmentalPerformance.length - 1] : null;

    const prompt = `
        As a Chief Operations Officer, generate a high-level executive summary for the Mayor and Municipal Manager.
        The tone must be strategic, concise, and focused on performance and risk. Use clean Markdown for formatting.
        Base your analysis strictly on the data provided below. Do not invent data.

        **Municipality-Wide Data:**
        - Overall Resolution Rate: ${overallResolutionRate.toFixed(1)}%
        - Total Open Issues: ${openIssuesCount}
        - Critical Unresolved High-Priority Issues: ${criticalIssuesCount}
        - Top Performing Department: ${topPerformer ? `${topPerformer.name} (${topPerformer.resolutionRate.toFixed(1)}% resolution rate)` : 'N/A'}
        - Lowest Performing Department: ${bottomPerformer ? `${bottomPerformer.name} (${bottomPerformer.resolutionRate.toFixed(1)}% resolution rate)`: 'N/A'}

        **Summary Structure (use these exact headings):**
        ### Overall Performance
        - Give a one-sentence assessment of the municipality's current operational status based on the resolution rate and open issues.

        ### Strategic Risks
        - Highlight the most significant risk. This should be the number of critical issues or the performance of the lowest-performing department.

        ### Key Recommendation
        - Provide one clear, actionable recommendation. For example, suggest focusing resources on the lowest-performing department or addressing the backlog of critical issues.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating executive summary with Gemini:", error);
        return "An error occurred while generating the AI summary. Please try again.";
    }
};

export const generateWardHealthSummary = async (
    wardNumber: number,
    wardResolutionRate: number,
    cityResolutionRate: number,
    avgWardResolutionTimeMs: number | null,
    avgCityResolutionTimeMs: number | null
): Promise<string> => {
    if (!API_KEY) {
        return "AI features are currently unavailable.";
    }

    const formatDurationForAI = (ms: number | null): string => {
        if (ms === null) return 'Not Applicable';
        const days = (ms / (1000 * 60 * 60 * 24));
        return `${days.toFixed(1)} days`;
    };

    const prompt = `
        As a helpful community assistant, provide a very concise, one or two-sentence summary for a resident about their ward's performance.
        The tone should be simple, encouraging, and easy to understand. Do not use complex jargon.
        Directly compare the ward's performance to the city average based *only* on the data below.

        **Data:**
        - Ward Number: ${wardNumber}
        - Ward Resolution Rate: ${wardResolutionRate.toFixed(1)}%
        - City-wide Average Resolution Rate: ${cityResolutionRate.toFixed(1)}%
        - Ward Average Resolution Time: ${formatDurationForAI(avgWardResolutionTimeMs)}
        - City-wide Average Resolution Time: ${formatDurationForAI(avgCityResolutionTimeMs)}

        **Example summaries:**
        - "Your ward is resolving issues slightly faster than the city average. Great work by your local team!"
        - "Currently, the resolution rate in your ward is just below the city-wide average. The municipality is working on improving response times."
        - "Performance in your ward is on par with the city average for resolving reported issues."

        Generate a new summary based on the provided data.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating ward health summary:", error);
        return "Could not generate an AI summary at this time.";
    }
};