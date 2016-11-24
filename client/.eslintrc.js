module.exports = {
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "es6": true,
    "commonjs": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "indent": [
        "warn",
        2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-console": 0,
    "no-unused-vars": ["warn", { "vars": "all", "args": "after-used" }]
  }
};
