
async function sendAndGetReason(obj, funcName, args, options) {
  try {
    await obj[funcName](...args, options);
  } catch (e) {
    return e.reason;
  }
  return "";
}

module.exports = {
  sendAndGetReason
}