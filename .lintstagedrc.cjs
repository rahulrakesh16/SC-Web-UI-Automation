module.exports = {
  '*.ts': ['eslint --fix', 'prettier --write'],
  '*.{json,yml,md}': ['prettier --write'],
};
