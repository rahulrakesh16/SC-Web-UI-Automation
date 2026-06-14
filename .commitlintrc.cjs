module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'test', 'chore', 'refactor', 'ci', 'docs', 'perf', 'style', 'build', 'security'],
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'always', 'sentence-case'],
    'header-max-length': [2, 'always', 100],
    'subject-full-stop': [2, 'never', '.'],
  },
};
