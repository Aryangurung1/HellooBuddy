"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import { PaymentCard } from "./component/PaymentCard";
import { trpc } from "../_trpc/client";
import { Button } from "@/components/ui/button";

export default function PaymentMethod() {
  const { mutate: createStripeSession } = trpc.createStripeSession.useMutation({
    onSuccess: ({ url }) => {
      console.log("Stripe session URL:", url);
      window.location.href = url ?? "/dashboard/billing";
    },
  });
  const [formData, setformData] = useState({
    amount: "1333",
    tax_amount: "0",
    total_amount: "1333",
    transaction_uuid: uuidv4(),
    product_service_charge: "0",
    product_delivery_charge: "0",
    product_code: "EPAYTEST",
    success_url: "https://kalacrum.com/api/esewa/success",
    failure_url: "https://kalacrum.com/paymentfailure",
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: "",
    secret: "8gBm/:&EnhH.1/q",
  });

  // generate signature function
  const generateSignature = (
    total_amount: string,
    transaction_uuid: string,
    product_code: string,
    secret: string | CryptoJS.lib.WordArray
  ) => {
    const hashString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hash = CryptoJS.HmacSHA256(hashString, secret);
    const hashedSignature = CryptoJS.enc.Base64.stringify(hash);
    return hashedSignature;
  };

  // useeffect
  useEffect(() => {
    const { total_amount, transaction_uuid, product_code, secret } = formData;
    const hashedSignature = generateSignature(
      total_amount,
      transaction_uuid,
      product_code,
      secret
    );

    setformData((prevFormData) => ({ 
      ...prevFormData, 
      signature: hashedSignature 
    }));
  }, [formData.total_amount, formData.transaction_uuid, formData.product_code, formData.secret]);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold mb-4 text-gray-800">
            Select Your Payment Method
          </h1>
          <p className="text-xl text-gray-600">
            Choose the option that best suits your needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stripe Payment Card */}
          <PaymentCard
            name="Stripe"
            logo="/StripeLogo.png"
            description="Secure, fast payments processed by Stripe's global platform. Ideal for international transactions."
            handlePayment={createStripeSession}
          />

          {/* eSewa Payment Form */}
          <form
            action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
            method="POST"
          >
            <input type="hidden" name="amount" value={formData.amount} />
            <input
              type="hidden"
              name="tax_amount"
              value={formData.tax_amount}
            />
            <input
              type="hidden"
              name="total_amount"
              value={formData.total_amount}
            />
            <input
              type="hidden"
              name="transaction_uuid"
              value={formData.transaction_uuid}
            />
            <input
              type="hidden"
              name="product_code"
              value={formData.product_code}
            />
            <input
              type="hidden"
              name="product_service_charge"
              value={formData.product_service_charge}
            />
            <input
              type="hidden"
              name="product_delivery_charge"
              value={formData.product_delivery_charge}
            />
            <input
              type="hidden"
              name="success_url"
              value={formData.success_url}
            />
            <input
              type="hidden"
              name="failure_url"
              value={formData.failure_url}
            />
            <input
              type="hidden"
              name="signed_field_names"
              value={formData.signed_field_names}
            />
            <input type="hidden" name="signature" value={formData.signature} />

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 relative mr-4">
                  <Image
                    src="/eswea.jpg"
                    alt="eSewa logo"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">eSewa</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Nepal&apos;s leading digital wallet for quick and easy local
                transactions.
              </p>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
              >
                Pay with eSewa
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}