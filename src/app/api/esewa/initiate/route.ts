import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json(); // Parse the body of the POST request
  const { amount, transaction_uuid, signature } = body;

  const esewaBaseURL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

  // Construct the payload for eSewa
  const payload = {
    amount,
    tax_amount: "0",
    total_amount: amount,
    transaction_uuid,
    product_code: "EPAYTEST",
    product_service_charge: "0",
    product_delivery_charge: "0",
    signed_field_names: "total_amount,transaction_uuid,product_code",
    success_url: "https://kalacrum.com/api/esewa/success",
    failure_url: "https://kalacrum.com/api/esewa/failure",
    signature,
  };

  // Make the POST request to eSewa
  const response = await fetch(esewaBaseURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  return NextResponse.json(data); // Return eSewa's response to the client
}
