export function numFormat(number: number, currency: string = "$") {
  let options: Intl.NumberFormatOptions = {};
  switch (currency) {
    case "$":
      options = {
        style: "currency",
        currency: "USD",
      };
      break;
    case "Bs":
      options = {
        style: "currency",
        currency: "VED",
      };
      break;
    case "€":
      options = {
        style: "currency",
        currency: "EUR",
      };
      break;
  }
  if (options.currency === "VED") {
    return new Intl.NumberFormat("de-DE", options)
      .format(number)
      .replace("VED", "Bs");
  }
  return new Intl.NumberFormat("de-DE", options).format(number);
}

export function textBodyEmail(text: string, company: any, cotiza: any) {
  text = text.replace(/</g, "&60;");
  text = text.replace(/>/g, "&62;");
  text = text.replace(/{br}/g, "<br />");
  text = text.replace(/{cotizaNumber}/g, cotiza.number);
  text = text.replace(/{CompanyName}/g, company.name);
  text = text.replace(
    /{emailCompany}/g,
    `<a href="mailto:${company.email}" style="text-decoration: none; color: ${company.configMail.colors.primary}">${company.email}</a>`
  );

  return text;
}
