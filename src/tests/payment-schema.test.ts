import {
  createPaymentSchema,
  updatePaymentSchema,
  updatePaymentStatusSchema,
} from "../utils/joivalidators/payment/paymentSchema";

// Test createPaymentSchema
console.log("Testing createPaymentSchema:");

// Valid data
const validPaymentData = {
  amount: 100.5,
  currency: "USD",
  paymentMethod: "credit_card",
  transactionId: "txn_123456789",
  description: "Subscription payment",
  metadata: { customerId: "12345" },
};

// Invalid data (missing required fields)
const invalidPaymentData = {
  amount: 0,
  currency: "USD",
  description: "Invalid payment",
};

const createResult1 = createPaymentSchema.validate(validPaymentData);
const createResult2 = createPaymentSchema.validate(invalidPaymentData);

console.log(
  "Valid data result:",
  createResult1.error ? createResult1.error.message : "Validation passed"
);
console.log(
  "Invalid data result:",
  createResult2.error ? createResult2.error.message : "Validation passed"
);

// Test updatePaymentSchema
console.log("\nTesting updatePaymentSchema:");

const validUpdateData = {
  amount: 200,
  status: "completed",
};

const invalidUpdateData = {
  status: "invalid_status",
};

const updateResult1 = updatePaymentSchema.validate(validUpdateData);
const updateResult2 = updatePaymentSchema.validate(invalidUpdateData);

console.log(
  "Valid update result:",
  updateResult1.error ? updateResult1.error.message : "Validation passed"
);
console.log(
  "Invalid update result:",
  updateResult2.error ? updateResult2.error.message : "Validation passed"
);

// Test updatePaymentStatusSchema
console.log("\nTesting updatePaymentStatusSchema:");

const validStatusData = {
  status: "completed",
};

const invalidStatusData = {
  status: "processing",
};

const statusResult1 = updatePaymentStatusSchema.validate(validStatusData);
const statusResult2 = updatePaymentStatusSchema.validate(invalidStatusData);

console.log(
  "Valid status result:",
  statusResult1.error ? statusResult1.error.message : "Validation passed"
);
console.log(
  "Invalid status result:",
  statusResult2.error ? statusResult2.error.message : "Validation passed"
);
