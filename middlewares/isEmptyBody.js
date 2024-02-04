const isEmptyBody = async (req, res, next) => {
  if (req.method === "PUT") {
    const keys = Object.keys(req.body);
    if (!keys.length) {
      const error = new Error(`Missing fields!`);
      error.status = 400;
      return next(error);
    }
  } else if (req.method === "PATCH") {
    const keys = Object.keys(req.body);
    if (!keys.length) {
      const error = new Error(`Missing field favorite`);
      error.status = 400;
      return next(error);
    }
  }
  next();
};

export default isEmptyBody;