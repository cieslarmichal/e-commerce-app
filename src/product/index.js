exports.handler = async function (event) {
  console.log(event);

  return {
    statusCode: 200,
    body: `hello, hitting ${event.path}`,
  };
};
