import Image from "next/image";
import { Button } from "@/components/ui/button";

interface PaymentCardProps {
  name: string;
  logo: string;
  description: string;
  handlePayment: () => void;
}

export function PaymentCard({
  name,
  logo,
  description,
  handlePayment,
}: PaymentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 relative mr-4">
          <Image
            src={logo}
            alt={`${name} logo`}
            layout="fill"
            objectFit="contain"
          />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">{name}</h2>
      </div>
      <p className="text-gray-600 mb-6">{description}</p>

      <Button
        onClick={() => handlePayment()}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
      >
        Proceed with {name}
      </Button>
    </div>
  );
}
