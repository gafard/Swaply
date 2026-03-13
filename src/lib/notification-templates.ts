import { Prisma } from "@prisma/client";

import { routing, type AppLocale } from "@/i18n/routing";

export type NotificationTemplate =
  | "new_local_item"
  | "item_reported_owner"
  | "exchange_reserved"
  | "exchange_confirmed"
  | "new_message"
  | "item_removed_after_review"
  | "report_reviewed_without_action"
  | "reservation_expired_owner"
  | "reservation_expired_requester"
  | "wishlist_match_found";


export type NotificationPayloadMap = {
  new_local_item: {
    itemTitle: string;
    zoneName?: string | null;
  };
  item_reported_owner: {
    itemTitle: string;
  };
  exchange_reserved: {
    username: string;
    itemTitle: string;
  };
  exchange_confirmed: {
    itemTitle: string;
  };
  new_message: {
    username: string;
    itemTitle: string;
  };
  item_removed_after_review: {
    itemTitle: string;
  };
  report_reviewed_without_action: {
    itemTitle: string;
  };
  reservation_expired_owner: {
    itemTitle: string;
  };
  reservation_expired_requester: {
    itemTitle: string;
  };
  wishlist_match_found: {
    itemTitle: string;
    wishlistTitle: string;
  };
};


type NotificationContent = {
  title: string;
  body: string;
};

const COPY: Record<
  AppLocale,
  Record<
    NotificationTemplate,
    {
      title: string;
      body: string;
    }
  >
> = {
  fr: {
    new_local_item: {
      title: "Nouvel objet près de chez vous",
      body: 'Un nouvel objet "{itemTitle}" vient d\'être publié à {zoneName}.',
    },
    item_reported_owner: {
      title: "Un objet a été signalé",
      body: 'Votre annonce "{itemTitle}" a été signalée et sera revue par l\'équipe.',
    },
    exchange_reserved: {
      title: "Nouvelle proposition de troc",
      body: '{username} a réservé "{itemTitle}".',
    },
    exchange_confirmed: {
      title: "Échange validé",
      body: 'L\'échange de "{itemTitle}" a été confirmé.',
    },
    new_message: {
      title: "Nouveau message",
      body: '{username} vous a écrit au sujet de "{itemTitle}".',
    },
    item_removed_after_review: {
      title: "Votre annonce a été retirée",
      body: 'Votre annonce "{itemTitle}" a été retirée après revue modération.',
    },
    report_reviewed_without_action: {
      title: "Signalement examiné",
      body:
        'Votre signalement pour "{itemTitle}" a été examiné sans action sur l\'annonce.',
    },
    reservation_expired_owner: {
      title: "Réservation expirée",
      body:
        'La réservation pour "{itemTitle}" a expiré. L\'objet est à nouveau disponible.',
    },
    reservation_expired_requester: {
      title: "Réservation expirée",
      body: 'Votre réservation pour "{itemTitle}" a expiré.',
    },
    wishlist_match_found: {
      title: "Trouvaille pour votre wishlist !",
      body: 'Un objet correspondant à votre recherche "{wishlistTitle}" est disponible : {itemTitle}.',
    },
  },

  en: {
    new_local_item: {
      title: "New item near you",
      body: 'A new item "{itemTitle}" has just been published in {zoneName}.',
    },
    item_reported_owner: {
      title: "An item was reported",
      body: 'Your listing "{itemTitle}" was reported and will be reviewed.',
    },
    exchange_reserved: {
      title: "New trade request",
      body: '{username} reserved "{itemTitle}".',
    },
    exchange_confirmed: {
      title: "Exchange confirmed",
      body: 'The exchange for "{itemTitle}" has been confirmed.',
    },
    new_message: {
      title: "New message",
      body: '{username} sent you a message about "{itemTitle}".',
    },
    item_removed_after_review: {
      title: "Your listing was removed",
      body: 'Your listing "{itemTitle}" was removed after moderation review.',
    },
    report_reviewed_without_action: {
      title: "Report reviewed",
      body: 'Your report for "{itemTitle}" was reviewed without action on the listing.',
    },
    reservation_expired_owner: {
      title: "Reservation expired",
      body:
        'The reservation for "{itemTitle}" expired. The item is available again.',
    },
    reservation_expired_requester: {
      title: "Reservation expired",
      body: 'Your reservation for "{itemTitle}" expired.',
    },
    wishlist_match_found: {
      title: "Match found for your wishlist!",
      body: 'An item matching your search "{wishlistTitle}" is now available: {itemTitle}.',
    },
  },

  es: {
    new_local_item: {
      title: "Nuevo artículo cerca de ti",
      body: 'Se acaba de publicar un nuevo artículo "{itemTitle}" en {zoneName}.',
    },
    item_reported_owner: {
      title: "Se reportó un artículo",
      body: 'Tu anuncio "{itemTitle}" fue reportado y será revisado.',
    },
    exchange_reserved: {
      title: "Nueva propuesta de intercambio",
      body: '{username} reservó "{itemTitle}".',
    },
    exchange_confirmed: {
      title: "Intercambio validado",
      body: 'Se confirmó el intercambio de "{itemTitle}".',
    },
    new_message: {
      title: "Nuevo mensaje",
      body: '{username} te escribió sobre "{itemTitle}".',
    },
    item_removed_after_review: {
      title: "Tu anuncio fue retirado",
      body: 'Tu anuncio "{itemTitle}" fue retirado tras la revisión de moderación.',
    },
    report_reviewed_without_action: {
      title: "Reporte revisado",
      body: 'Tu reporte sobre "{itemTitle}" fue revisado sin acción sobre el anuncio.',
    },
    reservation_expired_owner: {
      title: "Reserva expirada",
      body:
        'La reserva de "{itemTitle}" expiró. El artículo vuelve a estar disponible.',
    },
    reservation_expired_requester: {
      title: "Reserva expirada",
      body: 'Tu reserva de "{itemTitle}" expiró.',
    },
    wishlist_match_found: {
      title: "¡Encontramos algo para tu wishlist!",
      body: 'Un artículo que coincide con tu búsqueda "{wishlistTitle}" está disponible: {itemTitle}.',
    },
  },

  pt: {
    new_local_item: {
      title: "Novo item perto de você",
      body: 'Um novo item "{itemTitle}" foi publicado em {zoneName}.',
    },
    item_reported_owner: {
      title: "Um item foi denunciado",
      body: 'Seu anúncio "{itemTitle}" foi denunciado e será analisado.',
    },
    exchange_reserved: {
      title: "Nova proposta de troca",
      body: '{username} reservou "{itemTitle}".',
    },
    exchange_confirmed: {
      title: "Troca validada",
      body: 'A troca de "{itemTitle}" foi confirmada.',
    },
    new_message: {
      title: "Nova mensagem",
      body: '{username} enviou uma mensagem sobre "{itemTitle}".',
    },
    item_removed_after_review: {
      title: "Seu anúncio foi removido",
      body: 'Seu anúncio "{itemTitle}" foi removido após revisão da moderação.',
    },
    report_reviewed_without_action: {
      title: "Denúncia analisada",
      body: 'Sua denúncia sobre "{itemTitle}" foi analisada sem ação sobre o anúncio.',
    },
    reservation_expired_owner: {
      title: "Reserva expirada",
      body:
        'A reserva de "{itemTitle}" expirou. O item está disponível novamente.',
    },
    reservation_expired_requester: {
      title: "Reserva expirada",
      body: 'Sua reserva de "{itemTitle}" expirou.',
    },
    wishlist_match_found: {
      title: "Encontramos algo para sua wishlist!",
      body: 'Um item correspondente à sua busca "{wishlistTitle}" está disponível: {itemTitle}.',
    },
  },

};

function interpolate(
  template: string,
  params: Record<string, string | number | null | undefined>
) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = params[key];
    return value === null || value === undefined ? "" : String(value);
  });
}

export function resolveNotificationLocale(locale?: string | null): AppLocale {
  if (locale && routing.locales.includes(locale as AppLocale)) {
    return locale as AppLocale;
  }

  return routing.defaultLocale;
}

export function buildNotificationContent<T extends NotificationTemplate>(
  locale: string | null | undefined,
  template: T,
  payload: NotificationPayloadMap[T]
): NotificationContent {
  const resolvedLocale = resolveNotificationLocale(locale);
  const copy = COPY[resolvedLocale][template];

  return {
    title: interpolate(copy.title, payload),
    body: interpolate(copy.body, payload),
  };
}

export function isNotificationTemplate(value?: string | null): value is NotificationTemplate {
  return Boolean(value && value in COPY.fr);
}

export function parseNotificationPayload<T extends NotificationTemplate>(
  value: Prisma.JsonValue | null | undefined
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as NotificationPayloadMap[T];
}

