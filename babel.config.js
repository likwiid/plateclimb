// SPDX-License-Identifier: GPL-3.0-or-later
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      // Replace import.meta, which classic script bundles cannot parse, with a safe fallback
      function () {
        return {
          visitor: {
            MetaProperty(path) {
              path.replaceWithSourceString(
                '(typeof globalThis.__importMeta !== "undefined" ? globalThis.__importMeta : { env: { MODE: process.env.NODE_ENV } })'
              );
            },
          },
        };
      },
      "react-native-reanimated/plugin",
    ],
  };
};
