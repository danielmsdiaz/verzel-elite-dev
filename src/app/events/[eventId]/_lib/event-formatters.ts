const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "America/Recife",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Recife",
});

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatEventDate(date: Date) {
  return dateFormatter.format(date);
}

export function formatEventTime(date: Date) {
  return timeFormatter.format(date);
}

export function formatCurrency(priceCents: number) {
  return currencyFormatter.format(priceCents / 100);
}
