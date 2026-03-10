"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, QrCode, Scan, Star, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import QRCode from "qrcode";

import { confirmExchangeWithToken, generateExchangeToken } from "@/app/actions/exchange";
import ReviewModal from "./ReviewModal";

interface QRValidationProps {
  exchangeId: string;
  isOwner: boolean;
  initialToken?: string | null;
  status: string;
}

export default function QRValidation({
  exchangeId,
  isOwner,
  initialToken,
  status,
}: QRValidationProps) {
  const [token, setToken] = useState<string | null>(initialToken || null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(status === "COMPLETED");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const t = useTranslations("exchange.qr");

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "auth_required":
        return t("errors.authRequired");
      case "exchange_not_found":
        return t("errors.exchangeNotFound");
      case "owner_only":
        return t("errors.ownerOnly");
      case "requester_only":
        return t("errors.requesterOnly");
      case "exchange_not_pending":
        return t("errors.exchangeNotPending");
      case "invalid_token":
        return t("errors.invalidToken");
      default:
        return t("errors.generic");
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    QRCode.toDataURL(token, {
      width: 300,
      margin: 2,
      color: {
        dark: "#4F46E5",
        light: "#FFFFFF",
      },
    }).then(setQrDataUrl);
  }, [token]);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        async (decodedText) => {
          setIsScanning(false);
          await scanner?.clear();
          handleConfirm(decodedText);
        },
        () => {
          // Ignore noisy scanner callbacks.
        }
      );
    }

    return () => {
      scanner?.clear();
    };
  }, [isScanning]);

  const handleGenerate = async () => {
    const result = await generateExchangeToken(exchangeId);
    if (!result.ok || !result.data) {
      toast.error(getErrorMessage(result.code));
      return;
    }

    setToken(result.data.token);
    toast.success(t("generateSuccess"));
  };

  const handleConfirm = async (scannedToken: string) => {
    setIsValidating(true);

    try {
      const result = await confirmExchangeWithToken(exchangeId, scannedToken);
      if (!result.ok) {
        toast.error(getErrorMessage(result.code));
        return;
      }

      setIsCompleted(true);
      toast.success(t("confirmSuccess"));
    } catch {
      toast.error(t("errors.generic"));
    } finally {
      setIsValidating(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="animate-in zoom-in duration-500 fade-in flex flex-col items-center gap-4 rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div>
          <h3 className="text-lg font-black text-emerald-900">{t("completedTitle")}</h3>
          <p className="text-sm font-medium text-emerald-600/80">{t("completedBody")}</p>
        </div>
        <button
          onClick={() => setShowReviewModal(true)}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-transform active:scale-95"
        >
          <Star className="h-4 w-4" />
          {t("leaveReview")}
        </button>

        {showReviewModal && (
          <ReviewModal exchangeId={exchangeId} onClose={() => setShowReviewModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOwner ? (
        <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="font-black text-slate-900">{t("ownerTitle")}</h3>
            <p className="px-4 text-xs text-slate-400">{t("ownerBody")}</p>
          </div>

          {qrDataUrl ? (
            <div className="group relative rounded-[2.5rem] border-4 border-white bg-slate-50 p-4 shadow-xl">
              <img src={qrDataUrl} alt="Exchange QR Code" className="h-48 w-48 rounded-2xl" />
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/10 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                  {t("readyToScan")}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white transition-transform active:scale-95"
            >
              {t("generate")}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Scan className="h-6 w-6" />
            </div>
            <h3 className="font-black text-slate-900">{t("requesterTitle")}</h3>
            <p className="px-4 text-xs text-slate-400">{t("requesterBody")}</p>
          </div>

          <button
            onClick={() => setIsScanning(true)}
            disabled={isValidating}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100 transition-transform active:scale-95 disabled:opacity-50"
          >
            {isValidating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Scan className="h-5 w-5" />}
            {t("scanToValidate")}
          </button>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 p-6 backdrop-blur-xl">
          <button
            onClick={() => setIsScanning(false)}
            className="absolute right-10 top-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white active:scale-90"
          >
            <X />
          </button>

          <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-[3rem] border-4 border-white/20 bg-black">
            <div id="qr-reader" className="h-full w-full" />
            <div className="animate-scan absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          </div>

          <div className="mt-12 space-y-2 text-center">
            <p className="text-xl font-black text-white">{t("scannerTitle")}</p>
            <p className="text-sm font-medium text-emerald-400">{t("scannerBody")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
