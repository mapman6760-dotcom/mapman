import axios from "axios";

/**
 * Execute Payout via RazorpayX or simulate in test mode.
 *
 * When live keys (rzp_live_*) are provided in .env, it calls the live RazorpayX API.
 * In test mode (rzp_test_* or fallback), it handles payouts safely without failure.
 */
export const executeRazorpayPayout = async ({
  amount,
  accountHolderName,
  accountNumber,
  ifscCode,
  upiId,
  mode,
  referenceId,
  contactName,
  contactEmail,
  contactPhone
}) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const accountNumberX = process.env.RAZORPAYX_ACCOUNT_NUMBER;

  const isLiveKey = Boolean(keyId && keyId.startsWith("rzp_live_"));

  // If credentials are completely missing, use test simulation
  if (!keyId || !keySecret || !accountNumberX) {
    return {
      payoutId: `pout_test_${Date.now()}`,
      status: "processed",
      mode: mode || (upiId ? "UPI" : "IMPS"),
      isMock: true
    };
  }

  const isUpi = Boolean(upiId);
  const payoutMode = mode || (isUpi ? "UPI" : "IMPS");

  const contactData = {
    name: (accountHolderName || contactName || "Shop Owner").trim(),
    email: (contactEmail || "support@mapman.com").trim(),
    contact: String(contactPhone || "9876543210").replace(/\D/g, "").slice(-10) || "9876543210",
    type: "vendor"
  };

  const fundAccount = isUpi
    ? {
        account_type: "vpa",
        vpa: {
          address: String(upiId).trim()
        },
        contact: contactData
      }
    : {
        account_type: "bank_account",
        bank_account: {
          name: accountHolderName || "Beneficiary",
          ifsc: String(ifscCode).toUpperCase().trim(),
          account_number: String(accountNumber).trim()
        },
        contact: contactData
      };

  const payload = {
    account_number: accountNumberX,
    amount: Math.round(Number(amount) * 100), // in paise
    currency: "INR",
    mode: payoutMode,
    purpose: "payout",
    fund_account: fundAccount,
    queue_if_low_balance: true,
    reference_id: referenceId ? String(referenceId) : `ref_${Date.now()}`,
    narration: "Mapman Payout"
  };

  const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  try {
    const response = await axios.post("https://api.razorpay.com/v1/payouts", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`
      },
      timeout: 15000
    });

    return {
      payoutId: response.data.id,
      status: response.data.status,
      mode: response.data.mode || payoutMode,
      isMock: false
    };
  } catch (error) {
    const errorDetails = error.response?.data?.error?.description || error.message;

    // In test mode, fallback gracefully so local testing never breaks
    if (!isLiveKey) {
      console.warn("RazorpayX test mode fallback to simulation:", errorDetails);
      return {
        payoutId: `pout_test_${Date.now()}`,
        status: "processed",
        mode: payoutMode,
        isMock: true,
        note: errorDetails
      };
    }

    // In Live mode, throw the real Razorpay error so money is not deducted on gateway failure
    throw new Error(`Razorpay Live Payout Error: ${errorDetails}`);
  }
};
