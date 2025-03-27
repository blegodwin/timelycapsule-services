import mongoose, { Model } from "mongoose";
import { Types } from "mongoose";
import { Capsule } from "../src/model/capsule.model"; // Adjust the import path as necessary
import { connect, disconnect } from "../test/db"; // Updated path for db.ts

describe("Capsule Model", () => {
  beforeAll(async () => {
    await connect(); // Connect to test database
  });

  afterAll(async () => {
    await Capsule.deleteMany({}); // Clean up
    await disconnect(); // Disconnect
  });

  describe("Schema Validation", () => {
    it("should require creator field", async () => {
      const capsule = new Capsule({
        // Missing creator
        unlockDate: new Date("2030-01-01"),
        message: "Test message",
        recipientEmail: "test@example.com",
        capsuleLink: "unique-link-123",
      });

      await expect(capsule.save()).rejects.toThrow(
        mongoose.Error.ValidationError
      );
    });

    it("should validate status enum values", async () => {
      const capsule = new Capsule({
        creator: new mongoose.Types.ObjectId(),
        status: "InvalidStatus", // Invalid value
        unlockDate: new Date("2030-01-01"),
        message: "Test message",
        recipientEmail: "test@example.com",
        capsuleLink: "unique-link-456",
      });

      await expect(capsule.save()).rejects.toThrow(
        mongoose.Error.ValidationError
      );
    });

    it("should automatically set Pending status for future capsules", async () => {
      const capsule = await Capsule.create({
        creator: new mongoose.Types.ObjectId(),
        unlockDate: new Date("2030-01-01"),
        message: "Future capsule",
        recipientEmail: "future@example.com",
        capsuleLink: "future-link",
      });

      expect(capsule.status).toBe("Pending");
    });
  });

  describe("Instance Methods", () => {
    let testCapsule: any;

    beforeEach(async () => {
      testCapsule = await Capsule.create({
        creator: new mongoose.Types.ObjectId(),
        unlockDate: new Date("2025-01-01"),
        expirationDate: new Date("2025-12-31"),
        message: "Test instance methods",
        recipientEmail: "methods@example.com",
        capsuleLink: "methods-link",
      });
    });

    it("isUnlocked() should return false before unlock date", () => {
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01"));
      expect(testCapsule.isUnlocked()).toBe(false);
    });

    it("isUnlocked() should return true after unlock date", () => {
      jest.useFakeTimers().setSystemTime(new Date("2025-06-01"));
      expect(testCapsule.isUnlocked()).toBe(true);
    });

    it("isExpired() should return false before expiration date", () => {
      jest.useFakeTimers().setSystemTime(new Date("2025-06-01"));
      expect(testCapsule.isExpired()).toBe(false);
    });

    it("isExpired() should return true after expiration date", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-01-01"));
      expect(testCapsule.isExpired()).toBe(true);
    });

    it("updateStatus() should change status to Unlocked", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2025-06-01"));
      await testCapsule.updateStatus();
      expect(testCapsule.status).toBe("Unlocked");
    });
  });

  describe("Static Methods", () => {
    const creatorId = new mongoose.Types.ObjectId();
    const recipientEmail = "static@example.com";

    beforeAll(async () => {
      await Capsule.create([
        {
          creator: creatorId,
          unlockDate: new Date("2030-01-01"),
          message: "Capsule 1",
          recipientEmail,
          capsuleLink: "static-link-1",
          isPublic: true,
        },
        {
          creator: creatorId,
          unlockDate: new Date("2030-01-01"),
          message: "Capsule 2",
          recipientEmail: "other@example.com",
          capsuleLink: "static-link-2",
        },
        {
          creator: new mongoose.Types.ObjectId(),
          unlockDate: new Date("2030-01-01"),
          message: "Capsule 3",
          recipientEmail,
          capsuleLink: "static-link-3",
        },
      ]);
    });

    it("findByRecipientEmail() should return matching capsules", async () => {
      const capsules = await Capsule.findByRecipientEmail(recipientEmail);
      expect(capsules).toHaveLength(2);
      expect(capsules[0].recipientEmail).toBe(recipientEmail);
    });

    it("findByCreator() should return creator's capsules", async () => {
      const capsules = await Capsule.findByCreator(creatorId);
      expect(capsules).toHaveLength(2);
      expect(capsules[0].creator.toString()).toBe(creatorId.toString());
    });

    it("findPublicCapsules() should return only public capsules", async () => {
      const capsules = await Capsule.findPublicCapsules();
      expect(capsules).toHaveLength(1);
      expect(capsules[0].isPublic).toBe(true);
    });
  });

  describe("Password Handling", () => {
    it("should not return password in query results by default", async () => {
      const protectedCapsule = await Capsule.create({
        creator: new mongoose.Types.ObjectId(),
        unlockDate: new Date("2030-01-01"),
        message: "Protected",
        recipientEmail: "protected@example.com",
        capsuleLink: "protected-link",
        password: "secret123",
      });

      const foundCapsule = await Capsule.findById(protectedCapsule._id);
      expect(foundCapsule).not.toBeNull(); // Check that foundCapsule is not null
      expect(foundCapsule!.password).toBeUndefined(); // Use non-null assertion
    });

    it("should return password when explicitly selected", async () => {
      const protectedCapsule = await Capsule.create({
        creator: new mongoose.Types.ObjectId(),
        unlockDate: new Date("2030-01-01"),
        message: "Protected",
        recipientEmail: "protected@example.com",
        capsuleLink: "protected-link",
        password: "secret123",
      });

      const foundCapsule = await Capsule.findById(protectedCapsule._id).select(
        "+password"
      );
      expect(foundCapsule).not.toBeNull(); // Check that foundCapsule is not null
      expect(foundCapsule!.password).toBe("secret123"); // Use non-null assertion
    });
  });
});
