"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { removeItem } from "@/app/actions/item";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface DeleteItemButtonProps {
  itemId: string;
  itemTitle: string;
}

export default function DeleteItemButton({ itemId, itemTitle }: DeleteItemButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("profile");

  const handleDelete = () => {
    startTransition(async () => {
      const result = await removeItem(itemId);
      if (result.ok) {
        toast.success(t("itemsDeleteSuccess"));
        setIsConfirming(false);
      } else {
        toast.error(t("itemsDeleteError"));
      }
    });
  };

  if (isConfirming) {
    return (
      <div className="mt-3 overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm border border-rose-100">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {t("itemsDeleteConfirm")}
            </p>
            <p className="text-[10px] text-rose-600/70 font-medium mt-0.5">
              {itemTitle}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setIsConfirming(false)}
            className="flex-1 rounded-xl bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500 border border-slate-100 shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            className="flex-1 rounded-xl bg-rose-500 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-rose-200 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Confirmer
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-rose-100 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 transition hover:bg-rose-50 hover:border-rose-200 active:scale-95 shadow-sm mt-3"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {t("itemsDelete")}
    </button>
  );
}
