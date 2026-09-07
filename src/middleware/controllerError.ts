const handleDuplicateKeyError = (err: any, res: any) => {
  const keyValue = err.keyValue ?? err.errorResponse?.keyValue;
  if (!keyValue || typeof keyValue !== "object") {
    return res.status(400).send({ message: "Violación de unicidad en base de datos." });
  }
  const field = Object.keys(keyValue)[0];
  const code = 400;
  const errors: Record<string, string> = {};
  errors[field] = `An account with that ${field} already exists.`;
  res.status(code).send(errors);
};

const handleValidationError = (err: any, res: any) => {
  const errors: Record<string, string> = {};

  Object.keys(err.errors).forEach((key) => {
    errors[key] = err.errors[key].message;
  });

  res.status(400).send(errors);
};

export default (err: any, req: any, res: any) => {
  try {
    if (!err) {
      return res.status(500).send("An unknown error occurred.");
    }

    if (
      err &&
      typeof err === "object" &&
      err.type &&
      Object.prototype.hasOwnProperty.call(err, "message")
    ) {
      return res.status(400).send(err);
    }

    if (err.name && err.name === "ValidationError")
      return handleValidationError(err, res);
    const dupCode = err.code ?? err.errorResponse?.code;
    if (dupCode != null && Number(dupCode) === 11000)
      return handleDuplicateKeyError(err, res);
    if (err.name && err.name === "custom")
      return res.status(400).send(err.message);
    if (err.message) return res.status(400).send(err.message);
    if (typeof err === "string") return res.status(400).send(err);
    throw new Error("error");
  } catch (caught) {
    console.log(caught);
    res.status(500).send("An unknown error occurred.");
  }
};
