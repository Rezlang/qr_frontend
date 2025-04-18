module.exports = {
  webpack: {
    alias: {},
    configure: {
      resolve: {
        fallback: {
          stream:  require.resolve("stream-browserify"),
          util:    require.resolve("util/"),
        },
      },
    },
  },
};