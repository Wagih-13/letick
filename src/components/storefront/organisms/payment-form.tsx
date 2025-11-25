"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Building, Wallet } from "lucide-react";
import { toast } from "sonner";

interface PaymentFormProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export function PaymentForm({ onSubmit, onBack }: PaymentFormProps) {
  const [paymentType, setPaymentType] = useState("cod");
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (paymentType === "card") {
      if (!formData.cardNumber.trim()) next.cardNumber = "Card number is required";
      if (!formData.cardName.trim()) next.cardName = "Name on card is required";
      if (!formData.expiry.trim()) next.expiry = "Expiry is required";
      if (!formData.cvv.trim()) next.cvv = "CVV is required";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please fill payment details");
      return;
    }
    if (paymentType === "card") {
      onSubmit({ type: "card", ...formData });
    } else if (paymentType === "cod") {
      onSubmit({ type: "cash_on_delivery" });
    } else if (paymentType === "paypal") {
      onSubmit({ type: "paypal" });
    } else {
      onSubmit({ type: paymentType });
    }
  };

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Payment Information</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Type */}
        <RadioGroup value={paymentType} onValueChange={setPaymentType}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-not-allowed opacity-50">
              <RadioGroupItem value="card" id="card" disabled />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-not-allowed flex-1">
                <CreditCard className="h-5 w-5" />
                <span>Credit/Debit Card (Coming Soon)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer">
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                <Wallet className="h-5 w-5" />
                <span>Cash on Delivery</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer opacity-50">
              <RadioGroupItem value="paypal" id="paypal" disabled />
              <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer flex-1">
                <Building className="h-5 w-5" />
                <span>PayPal (Coming Soon)</span>
              </Label>
            </div>
          </div>
        </RadioGroup>

        {paymentType === "card" && (
          <>
            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                required
                aria-invalid={Boolean(errors.cardNumber) || undefined}
              />
              {errors.cardNumber && (
                <p className="mt-1 text-xs text-destructive">{errors.cardNumber}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cardName">Name on Card *</Label>
              <Input
                id="cardName"
                value={formData.cardName}
                onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                required
                aria-invalid={Boolean(errors.cardName) || undefined}
              />
              {errors.cardName && (
                <p className="mt-1 text-xs text-destructive">{errors.cardName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date *</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                  required
                  aria-invalid={Boolean(errors.expiry) || undefined}
                />
                {errors.expiry && (
                  <p className="mt-1 text-xs text-destructive">{errors.expiry}</p>
                )}
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                  required
                  aria-invalid={Boolean(errors.cvv) || undefined}
                />
                {errors.cvv && (
                  <p className="mt-1 text-xs text-destructive">{errors.cvv}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-1 sm:flex-initial">
            Review Order
          </Button>
        </div>
      </form>
    </div>
  );
}
