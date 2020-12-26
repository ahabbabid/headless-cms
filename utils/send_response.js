module.exports = ({ data, message, statusCode }, res) => {
  res.status(statusCode).json({
    message: message,
    data: data,
  });
};
