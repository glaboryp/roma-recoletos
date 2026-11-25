import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mobile } from './phone.ts';

test('Spanish mobiles are stored as 9 digits', () => {
  for (const s of ['600123456', '600 12 34 56', '600-123-456', '600.123.456', '+34 600 123 456', '0034600123456', '712345678']) {
    assert.equal(mobile(s), s.startsWith('712') ? '712345678' : '600123456', s);
  }
});

test('foreign numbers keep their prefix', () => {
  assert.equal(mobile('+33 6 12 34 56 78'), '+33612345678');
  assert.equal(mobile('0044 7700 900123'), '+447700900123');
});

test('landlines, typos and junk are rejected', () => {
  for (const s of ['912345678', '+34 912 345 678', '60012345', '6001234567', '600abc456', '', '+3460012345', '+1234567']) {
    assert.equal(mobile(s), null, s);
  }
});
