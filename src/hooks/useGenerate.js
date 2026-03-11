import { useState, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

/**
 * useGenerate — manages the full generation lifecycle:
 * - Form state
 * - API call to /api/generate
 * - Loading / error / result states
 * - Citation verification status display
 */
export function useGenerate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null); // Step-by-step feedback

  const generate = useCallback(async (brief) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Generating
      setProgress({ step: 1, message: 'Analysing brief and querying AI engine…' });

      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brief)
      });

      // Step 2: Verifying
      setProgress({ step: 2, message: 'Verifying citations against PubMed…' });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      // Step 3: Done
      setProgress({ step: 3, message: 'Complete' });
      setResult(data);

    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setProgress(null);
    } finally {
      setLoading(false);
      // Clear progress after brief delay
      setTimeout(() => setProgress(null), 1000);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(null);
  }, []);

  return { generate, loading, error, result, progress, reset };
}
