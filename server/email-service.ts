import { sendEmail } from './outlook';
import { storage } from './storage';
import type { Question } from '@shared/schema';

export function generateDailyQuizEmail(questions: Question[], dayNumber: number): string {
  const questionsList = questions.map((q, index) => `
    <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 18px;">Question ${index + 1}</h3>
      <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
        <strong>Topic:</strong> ${q.topic}
      </p>
      ${q.scenario ? `
        <div style="background-color: #fef3c7; border-left: 3px solid #f59e0b; padding: 16px; margin: 16px 0; border-radius: 6px;">
          <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
            <strong>Scenario:</strong> ${q.scenario}
          </p>
        </div>
      ` : ''}
      <p style="color: #0f172a; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; font-weight: 500;">
        ${q.question}
      </p>
      <div style="margin: 12px 0;">
        <p style="color: #475569; margin: 8px 0; padding: 12px; background-color: white; border-radius: 6px;">
          <strong>A)</strong> ${q.optionA}
        </p>
        <p style="color: #475569; margin: 8px 0; padding: 12px; background-color: white; border-radius: 6px;">
          <strong>B)</strong> ${q.optionB}
        </p>
        <p style="color: #475569; margin: 8px 0; padding: 12px; background-color: white; border-radius: 6px;">
          <strong>C)</strong> ${q.optionC}
        </p>
        <p style="color: #475569; margin: 8px 0; padding: 12px; background-color: white; border-radius: 6px;">
          <strong>D)</strong> ${q.optionD}
        </p>
      </div>
    </div>
  `).join('');

  const answersList = questions.map((q, index) => {
    const correctOption = q.answer;
    const correctText = correctOption === 'A' ? q.optionA 
                      : correctOption === 'B' ? q.optionB
                      : correctOption === 'C' ? q.optionC
                      : q.optionD;
    return `
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 12px 0; border-radius: 6px;">
        <p style="color: #166534; margin: 0; font-size: 16px;">
          <strong>Question ${index + 1}:</strong> Answer <strong>${correctOption}</strong> - ${correctText}
        </p>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0 0 8px 0; font-size: 28px;">100 Days to CeMAP Ready</h1>
          <p style="color: #dbeafe; margin: 0; font-size: 16px;">Day ${dayNumber} of 100</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 20px;">
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
            <p style="color: #1e40af; font-size: 18px; margin: 0; font-weight: 600;">
              Your Daily CeMAP Practice Questions
            </p>
            <p style="color: #3730a3; font-size: 14px; margin: 8px 0 0 0;">
              3 questions to sharpen your knowledge
            </p>
          </div>

          <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 20px 0; border-bottom: 3px solid #3b82f6; padding-bottom: 12px;">
            Today's Questions
          </h2>

          ${questionsList}

          <div style="margin: 40px 0 30px 0; border-top: 2px solid #e2e8f0; padding-top: 30px;">
            <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 20px 0; border-bottom: 3px solid #22c55e; padding-bottom: 12px;">
              Answers
            </h2>
            ${answersList}
          </div>

          <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #92400e; font-size: 14px; margin: 0 0 12px 0;">
              <strong>Keep Going!</strong>
            </p>
            <p style="color: #78350f; font-size: 14px; margin: 0; line-height: 1.6;">
              You're ${dayNumber}% of the way through your CeMAP preparation journey. Stay consistent and success will follow!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0;">
            <strong style="color: #334155;">J&K CeMAP Training</strong>
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0;">
            This email is part of your 100 Days to CeMAP Ready campaign.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            Questions from: CeMAP Scenario Question Bank
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendDailyQuizToSubscriber(email: string): Promise<void> {
  const subscription = await storage.getEmailSubscription(email);
  
  if (!subscription || subscription.isActive !== 1 || subscription.daysSent >= 100) {
    return;
  }

  // Get all scenario questions
  const allQuestions = await storage.getAllQuestions();
  const scenarioQuestions = allQuestions.filter(q => q.scenarioId);
  
  // Pick 3 random scenario questions
  const shuffled = scenarioQuestions.sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffled.slice(0, 3);

  const dayNumber = subscription.daysSent + 1;
  const htmlContent = generateDailyQuizEmail(selectedQuestions, dayNumber);
  
  await sendEmail(
    email,
    `Daily CeMap Pop Quiz - Day ${dayNumber} of 100`,
    htmlContent
  );

  // Update days sent
  await storage.updateSubscriptionDaysSent(subscription.id, dayNumber);
}

export async function sendDailyQuizToAllSubscribers(): Promise<{ sent: number; failed: number }> {
  const activeSubscriptions = await storage.getAllActiveSubscriptions();
  
  let sent = 0;
  let failed = 0;

  for (const subscription of activeSubscriptions) {
    try {
      await sendDailyQuizToSubscriber(subscription.email);
      sent++;
    } catch (error) {
      console.error(`Failed to send to ${subscription.email}:`, error);
      failed++;
    }
  }

  return { sent, failed };
}
