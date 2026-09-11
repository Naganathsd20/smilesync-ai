/**
 * Utility for handling transient Gemini API errors with exponential backoff retries.
 */

export function isTransientGeminiError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.statusCode || error.response?.status;
  if (status === 503 || status === 504 || status === 429) {
    return true;
  }
  const message = (error.message || String(error)).toLowerCase();
  return (
    message.includes("503") ||
    message.includes("service unavailable") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("resource exhausted") ||
    message.includes("temporarily unavailable") ||
    message.includes("try again later")
  );
}

/**
 * Cleanly sanitizes raw GoogleGenerativeAI error messages for end users.
 */
export function getCleanGeminiErrorMessage(error: any, fallbackMessage: string): string {
  if (isTransientGeminiError(error)) {
    return "Nova AI is currently experiencing high demand. Please try again in a few moments.";
  }
  const msg = error?.message || String(error);
  if (msg.includes("[GoogleGenerativeAI Error]") || msg.includes("503 Service Unavailable")) {
    return "AI service is currently experiencing high demand. Please try again in a few moments.";
  }
  return msg || fallbackMessage;
}

/**
 * Wraps Gemini model.generateContent call with exponential backoff retries for transient 503/UNAVAILABLE errors.
 *
 * @param model The Gemini model instance
 * @param prompt The prompt string or content array
 * @param maxRetries Maximum number of retries for transient errors (default: 2)
 * @param baseDelayMs Initial backoff delay in milliseconds (default: 1000)
 */
export async function generateContentWithRetry(
  model: any,
  prompt: any,
  maxRetries = 2,
  baseDelayMs = 1000
) {
  let attempt = 0;
  while (true) {
    try {
      return await model.generateContent(prompt);
    } catch (error: any) {
      attempt++;
      const isTransient = isTransientGeminiError(error);
      if (!isTransient || attempt > maxRetries) {
        throw error;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 200;
      console.warn(
        `[GEMINI_RETRY] Transient 503/UNAVAILABLE error (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(
          delay
        )}ms...`,
        error?.message || error
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
