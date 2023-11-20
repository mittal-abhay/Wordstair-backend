const isAccountSuspended = (user) => {
  if (Number(user.suspendedTillTimestamp) === -1) {
    return true;
  } else if (Number(user.suspendedTillTimestamp) > Date.now()) {
    return true;
  }
  return false;
};

module.exports = {
  isAccountSuspended,
};
