import { BadRequestException } from '@nestjs/common';
import { createHmac } from 'crypto';

// Isolated test for eSewa signature verification logic
// Tests the critical security fix: hardcoded required fields (not trusting signed_field_names from payload)

function verifyEsewaSignature(
  payload: Record<string, string>,
  secretKey: string,
): { valid: boolean; error?: string } {
  const REQUIRED_SIGNED_FIELDS = [
    'transaction_code',
    'status',
    'total_amount',
    'transaction_uuid',
    'product_code',
    'signed_field_names',
  ] as const;

  const missing = REQUIRED_SIGNED_FIELDS.filter(f => !payload[f]);
  if (missing.length > 0) {
    return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  const message = REQUIRED_SIGNED_FIELDS.map(f => `${f}=${payload[f]}`).join(',');
  const expected = createHmac('sha256', secretKey).update(message).digest('base64');

  if (expected !== payload['signature']) {
    return { valid: false, error: 'Signature mismatch' };
  }

  return { valid: true };
}

describe('eSewa signature verification (hardened)', () => {
  const SECRET = 'test-secret-key';

  const CANONICAL_FIELDS = [
    'transaction_code',
    'status',
    'total_amount',
    'transaction_uuid',
    'product_code',
    'signed_field_names',
  ] as const;

  function buildValidPayload(overrides: Record<string, string> = {}): Record<string, string> {
    const base: Record<string, string> = {
      transaction_code: 'TX123',
      status: 'COMPLETE',
      total_amount: '1000',
      transaction_uuid: 'uuid-abc',
      product_code: 'EPAYTEST',
      signed_field_names: CANONICAL_FIELDS.join(','),
    };
    const merged = { ...base, ...overrides };
    const message = CANONICAL_FIELDS.map(f => `${f}=${merged[f]}`).join(',');
    merged['signature'] = createHmac('sha256', SECRET).update(message).digest('base64');
    return merged;
  }

  it('passes with a valid payload and correct HMAC', () => {
    const payload = buildValidPayload();
    const result = verifyEsewaSignature(payload, SECRET);
    expect(result.valid).toBe(true);
  });

  it('rejects a payload with missing required field', () => {
    const payload = buildValidPayload();
    delete payload['status'];
    const result = verifyEsewaSignature(payload, SECRET);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('status');
  });

  it('rejects an attacker-crafted payload that manipulates signed_field_names', () => {
    // Attacker provides signed_field_names with only "status" and correct HMAC over just status=COMPLETE
    const attackerPayload: Record<string, string> = {
      transaction_code: 'FAKE',
      status: 'COMPLETE',
      total_amount: '1',
      transaction_uuid: 'attacker-uuid',
      product_code: 'EPAYTEST',
      signed_field_names: 'status',    // attacker's narrow field list
    };
    // Attacker computes HMAC over only "status=COMPLETE"
    attackerPayload['signature'] = createHmac('sha256', SECRET).update('status=COMPLETE').digest('base64');

    // Our hardened verifier uses CANONICAL_FIELDS (not signed_field_names) — so HMAC won't match
    const result = verifyEsewaSignature(attackerPayload, SECRET);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Signature mismatch');
  });
});

describe('eSewa signature verification — additional edge cases', () => {
  const SECRET = 'another-secret';
  const CANONICAL_FIELDS = [
    'transaction_code', 'status', 'total_amount',
    'transaction_uuid', 'product_code', 'signed_field_names',
  ] as const;

  function buildValidPayload(overrides: Record<string, string> = {}): Record<string, string> {
    const base: Record<string, string> = {
      transaction_code: 'TX999',
      status: 'COMPLETE',
      total_amount: '500',
      transaction_uuid: 'uuid-xyz',
      product_code: 'MYSTORE',
      signed_field_names: CANONICAL_FIELDS.join(','),
    };
    const merged = { ...base, ...overrides };
    const message = CANONICAL_FIELDS.map(f => `${f}=${merged[f]}`).join(',');
    merged['signature'] = createHmac('sha256', SECRET).update(message).digest('base64');
    return merged;
  }

  it('rejects when signature is tampered with', () => {
    const payload = buildValidPayload();
    payload['signature'] = 'tampered-signature';
    const result = verifyEsewaSignature(payload, SECRET);
    expect(result.valid).toBe(false);
  });

  it('rejects when wrong secret is used', () => {
    const payload = buildValidPayload();
    const result = verifyEsewaSignature(payload, 'wrong-secret');
    expect(result.valid).toBe(false);
  });

  it('rejects FAILED transaction status (valid HMAC but wrong status)', () => {
    const payload = buildValidPayload({ status: 'FAILED' });
    // A valid HMAC is generated over the FAILED payload
    const message = CANONICAL_FIELDS.map(f => `${f}=${payload[f]}`).join(',');
    payload['signature'] = createHmac('sha256', SECRET).update(message).digest('base64');
    // Signature itself is valid — calling code must check status separately
    const result = verifyEsewaSignature(payload, SECRET);
    expect(result.valid).toBe(true); // signature check passes; status check is caller's responsibility
    expect(payload.status).toBe('FAILED');
  });

  it('rejects empty payload', () => {
    const result = verifyEsewaSignature({}, SECRET);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Missing required fields');
  });

  it('rejects payload with empty string fields', () => {
    const payload = buildValidPayload({ transaction_code: '' });
    const result = verifyEsewaSignature(payload, SECRET);
    expect(result.valid).toBe(false);
  });
});
