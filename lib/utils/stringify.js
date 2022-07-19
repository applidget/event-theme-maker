module.exports = (something) => {
  if (typeof something === "string") {
    return something;
  }

  return JSON.stringify(something);
}
