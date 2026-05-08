'use strict';

const { withRetry } = require('../src/utils/retry');

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable error and succeeds', async () => {
    const retryableErr = Object.assign(new Error('Server error'), { retryable: true });
    const fn = jest.fn()
      .mockRejectedValueOnce(retryableErr)
      .mockResolvedValue('ok');
    const result = await withRetry(fn, 2, 0);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry on non-retryable error', async () => {
    const nonRetryableErr = Object.assign(new Error('Auth failure'), { retryable: false });
    const fn = jest.fn().mockRejectedValue(nonRetryableErr);
    await expect(withRetry(fn, 2, 0)).rejects.toThrow('Auth failure');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting retries', async () => {
    const retryableErr = Object.assign(new Error('Server error'), { retryable: true });
    const fn = jest.fn().mockRejectedValue(retryableErr);
    await expect(withRetry(fn, 2, 0)).rejects.toThrow('Server error');
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });
});
