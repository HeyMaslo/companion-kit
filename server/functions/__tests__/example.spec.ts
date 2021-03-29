import * as admin from 'firebase-admin';
import { fail } from 'assert';
const { expect } = require("chai");

// Initialize testing server
const test = require("firebase-functions-test")({
    projectId: 'bipolarbridges',
  });
admin.initializeApp();

describe("Example Tests", () => {
	afterEach(async () => {
		await test.cleanup();
	});
	it("Should check that tests work", () => {
		const result = 1 + 1;
		expect(result).to.equal(2);
	});
});
