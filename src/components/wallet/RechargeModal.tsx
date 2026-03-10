"use client";

import { useMemo, useState } from "react";
import { topUpSwaps, getTopupPaymentStatus } from "@/app/actions/wallet";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, CheckCircle2, CreditCard, Globe2, Clock3 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";

import { formatMoney } from "@/lib/geo";

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPack: {
    id: string;
    localAmount: number;
    currencyCode: string;
    swapsAmount: number;
    country: {
      id: string;
      code: string;
      name: string;
    };
    paymentProvider: {
      id: string;
      code: string;
      name: string;
    };
  } | null;
}

const PHONE_BASED_PROVIDERS = ["flooz", "tmoney", "mtnmo", "airtelmoney", "moovmoney"];

export default function RechargeModal({ isOpen, onClose, selectedPack }: RechargeModalProps) {
  const [step, setStep] = useState(1); // 1: confirmation, 2: processing, 3: success
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const locale = useLocale();
  const t = useTranslations("wallet.recharge");
  const [statusMessage, setStatusMessage] = useState("");

  const getErrorMessage = (
    code: string,
    data?: {
      retryAfterSeconds?: number;
    }
  ) => {
    switch (code) {
      case "auth_required":
        return t("errors.authRequired");
      case "country_required":
        return t("errors.countryRequired");
      case "package_required":
        return t("errors.packageRequired");
      case "provider_required":
        return t("errors.providerRequired");
      case "phone_invalid":
        return t("errors.phoneInvalid");
      case "payment_not_found":
        return t("errors.paymentNotFound");
      case "provider_response_incomplete":
        return t("errors.providerResponseIncomplete");
      case "payment_failed":
      case "provider_unconfirmed":
        return t("errors.paymentFailed");
      case "rate_limited":
        return t("errors.rateLimited", { seconds: data?.retryAfterSeconds ?? 0 });
      default:
        return t("serverError");
    }
  };

  const requiresPhoneNumber = useMemo(
    () =>
      selectedPack
        ? PHONE_BASED_PROVIDERS.includes(selectedPack.paymentProvider.code.toLowerCase())
        : false,
    [selectedPack]
  );

  if (!isOpen || !selectedPack) return null;

  const pollPayment = async (paymentId: string) => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const result = await getTopupPaymentStatus(paymentId);
      if (!result.ok || !result.data) {
        throw new Error(result.code);
      }

      const status = result.data;

      if (status.status === "SUCCESS" && status.credited) {
        setStatusMessage(t("confirmed"));
        setStep(3);
        return;
      }

      if (status.status === "FAILED" || status.status === "CANCELLED") {
        throw new Error("provider_unconfirmed");
      }
    }

    setStatusMessage(t("creditAfterWebhook"));
  };

  const handleSubmit = async () => {
    if (requiresPhoneNumber && phoneNumber.length < 8) {
      toast.error(t("invalidPhone"));
      return;
    }

    setStep(2);
    setLoading(true);
    setStatusMessage(t("processing"));

    const formData = new FormData();
    formData.set("packageId", selectedPack.id);
    formData.set("providerCode", selectedPack.paymentProvider.code);
    formData.set("origin", window.location.origin);
    if (phoneNumber) {
      formData.set("phoneNumber", phoneNumber);
    }

    try {
      const result = await topUpSwaps(formData);
      if (!result.ok || !result.data) {
        toast.error(getErrorMessage(result.code));
        setStep(1);
        return;
      }

      if (result.data.redirectUrl) {
        toast.loading(t("redirecting"), { id: "payment-redirect" });
        window.location.assign(result.data.redirectUrl);
        return;
      }

      if (result.data.status === "SUCCESS") {
        setStep(3);
        return;
      }

      if (result.data.paymentId) {
        setStatusMessage(t("creditAfterWebhook"));
        await pollPayment(result.data.paymentId);
        return;
      }

      throw new Error("provider_response_incomplete");
    } catch (error) {
      const code = error instanceof Error ? error.message : "server_error";
      toast.error(getErrorMessage(code));
      setStep(1);
    } finally {
      toast.dismiss("payment-redirect");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPhoneNumber("");
    setStatusMessage("");
    onClose();
  };

  const priceLabel = formatMoney(selectedPack.localAmount, selectedPack.currencyCode, locale);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {t("title", {amount: selectedPack.swapsAmount})}
              </h2>
              <p className="text-sm font-bold text-primary mt-1">{priceLabel}</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Globe2 className="w-3.5 h-3.5" />
                <span>{selectedPack.country.name}</span>
                <span>•</span>
                <span>{selectedPack.paymentProvider.name}</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                      {t("package")}
                    </p>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-slate-900">
                          {selectedPack.swapsAmount} Swaps
                        </p>
                        <p className="text-[11px] font-bold text-slate-500 mt-1">
                          {selectedPack.paymentProvider.name}
                        </p>
                      </div>
                      <p className="text-sm font-black text-primary">{priceLabel}</p>
                    </div>
                  </div>

                  {requiresPhoneNumber && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                        {t("paymentNumber")}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                          <Smartphone className="w-5 h-5 text-slate-300" />
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder={t("phonePlaceholder")}
                          className="w-full bg-slate-50 border-2 border-slate-100 p-5 pl-14 rounded-3xl font-black text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    className="w-full h-16 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-3xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {t("pay", {price: priceLabel})}
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8 text-center"
                >
                  <div className="w-20 h-20 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto mb-6" />
                  <p className="text-lg font-black text-slate-900 tracking-tight">
                    {loading ? t("processing") : t("waitingProvider")}
                  </p>
                  <p className="text-sm font-medium text-slate-400 mt-2 px-10 leading-relaxed italic">
                    {statusMessage}
                  </p>
                  {!loading && (
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-[11px] font-black uppercase tracking-widest text-amber-700">
                      <Clock3 className="w-3.5 h-3.5" />
                      {t("webhookPending")}
                    </div>
                  )}
                  <p className="text-xs font-medium text-slate-400 mt-3 px-10 leading-relaxed italic">
                    {requiresPhoneNumber
                      ? t("confirmPhone")
                      : t("creditAfterWebhook")}
                  </p>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-8 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                    {t("confirmed")}
                  </h3>
                  <p className="text-sm font-bold text-emerald-500 mt-2">
                    {t("credited", {amount: selectedPack.swapsAmount})}
                  </p>

                  <button
                    onClick={handleClose}
                    className="mt-10 w-full h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-3xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    {t("close")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
