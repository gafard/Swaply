"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, QrCode, Scan, Star, X, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { Html5QrcodeScanner } from "html5-qrcode";
import QRCode from "qrcode";

import { confirmExchangeWithToken, generateExchangeToken } from "@/app/actions/exchange";
import ReviewModal from "./ReviewModal";
import LiquidButton from "@/components/ui/LiquidButton";
import HoloBadge from "@/components/ui/HoloBadge";

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
    if (!token) return;

    QRCode.toDataURL(token, {
      width: 320,
      margin: 2,
      color: {
        dark: "#2563EB",
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
      <div className="animate-in zoom-in-95 duration-500 fade-in flex flex-col items-center gap-4 rounded-[32px] border border-success/30 bg-success/10 p-6 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/20 text-success shadow-sm">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">{t("completedTitle")}</h3>
          <p className="text-xs font-semibold text-success mt-1">{t("completedBody")}</p>
        </div>
        <LiquidButton
          variant="primary"
          size="md"
          icon={<Star className="h-4 w-4" />}
          onClick={() => setShowReviewModal(true)}
        >
          {t("leaveReview")}
        </LiquidButton>

        {showReviewModal && (
          <ReviewModal exchangeId={exchangeId} onClose={() => setShowReviewModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOwner ? (
        <div className="flex flex-col items-center gap-5 rounded-[32px] border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-foreground">{t("ownerTitle")}</h3>
            <p className="px-2 text-xs text-muted leading-relaxed">{t("ownerBody")}</p>
          </div>

          {qrDataUrl ? (
            <div className="relative rounded-[28px] border-4 border-surface-raised bg-white p-4 shadow-lg">
              <img src={qrDataUrl} alt="Exchange QR Code" className="h-48 w-48 rounded-2xl" />
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/10 opacity-0 backdrop-blur-[2px] transition-opacity hover:opacity-100">
                <HoloBadge variant="primary" size="sm">
                  {t("readyToScan")}
                </HoloBadge>
              </div>
            </div>
          ) : (
            <LiquidButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleGenerate}
            >
              {t("generate")}
            </LiquidButton>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 rounded-[32px] border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Scan className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-foreground">{t("requesterTitle")}</h3>
            <p className="px-2 text-xs text-muted leading-relaxed">{t("requesterBody")}</p>
          </div>

          <LiquidButton
            variant="primary"
            size="lg"
            fullWidth
            loading={isValidating}
            icon={<Scan className="h-5 w-5" />}
            onClick={() => setIsScanning(true)}
          >
            {t("scanToValidate")}
          </LiquidButton>
        </div>
      )}

      {/* Holographic Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-2xl">
          <button
            onClick={() => setIsScanning(false)}
            className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white active:scale-90 transition-all hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-[36px] border-4 border-primary/40 bg-black shadow-glow">
            <div id="qr-reader" className="h-full w-full" />
            <div className="animate-scan absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_#3B82F6]" />
          </div>

          <div className="mt-8 space-y-1.5 text-center">
            <p className="font-display text-xl font-bold text-white">{t("scannerTitle")}</p>
            <p className="text-xs font-semibold text-primary">{t("scannerBody")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
