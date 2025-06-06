import { test, expect } from "vitest";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { Scrypt, LegacyScrypt, generateIdFromEntropySize } from "../src/libs/crypto.ts";

test("validateScryptHash() validates hashes generated with generateScryptHash()", async () => {
  const password = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(32)));
  const scrypt = new Scrypt();
  const hash = await scrypt.hash(password);
  await expect(scrypt.verify(hash, password)).resolves.toBe(true);
  const falsePassword = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(32)));
  await expect(scrypt.verify(hash, falsePassword)).resolves.toBe(false);
});

test("LegacyScrypt", async () => {
  const password = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(32)));
  const scrypt = new LegacyScrypt();
  const hash = await scrypt.hash(password);
  await expect(scrypt.verify(hash, password)).resolves.toBe(true);
  const falsePassword = encodeHexLowerCase(crypto.getRandomValues(new Uint8Array(32)));
  await expect(scrypt.verify(hash, falsePassword)).resolves.toBe(false);
});

test("generateIdFromEntropySize()", () => {
  // check string is only lowercase
  for (let i = 0; i < 100; i++) {
    const id = generateIdFromEntropySize(10);
    expect(id).not.toMatch(/[A-Z]/);
  }

  // check output length
  const id1 = generateIdFromEntropySize(25);
  expect(id1).toHaveLength(40);

  // check padding is omitted
  const id3 = generateIdFromEntropySize(8);
  expect(id3).not.toMatch(/=/);
});
