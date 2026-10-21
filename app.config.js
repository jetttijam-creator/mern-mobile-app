// Extends app.json. Cleartext (plain HTTP) is allowed for development builds only.
// Build a release with APP_ENV=production and Android blocks plain HTTP again.
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      'expo-build-properties',
      {
        android: { usesCleartextTraffic: process.env.APP_ENV !== 'production' },
      },
    ],
  ],
});
