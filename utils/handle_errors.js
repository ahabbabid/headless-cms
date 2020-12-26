exports.throwCustomException = (status, message) => {
  throw {
    status: status,
    message: message,
  };
};

exports.handleCustomException = (error, res, next) => {
  if (error.status) {
    res.status(error.status).json({ message: error.message });
  } else {
    res.status(500).json({ message: "Something went wrong" });
    // next()
  }
};

exports.handleGeneralException = (error, req, res, next) => {
  res.status(500).res.json({
    message: "Something went wrong",
  });
};
