// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // react-hooks v6's React Compiler rules flag two intentional patterns used
    // throughout this codebase: Reanimated shared-value mutation (`.value =`,
    // the library's documented API) and "load initial state on mount" effects
    // (AsyncStorage/SecureStore/API hydration, where there's no non-effect
    // alternative). Both are correct here, not bugs.
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
