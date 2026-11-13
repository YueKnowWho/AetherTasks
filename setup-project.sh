#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Initializing Git repository in current folder..."
if [ ! -d ".git" ]; then
  git init
else
  echo "Git repository already initialized."
fi

echo "Initializing npm..."
if [ ! -f "package.json" ]; then
  npm init -y
fi

echo "Installing Webpack and dev dependencies..."
npm install --save-dev webpack webpack-cli html-webpack-plugin style-loader css-loader

echo "Installing common utilities (date-fns)..."
npm install date-fns

echo "Creating folder structure (src, dist)..."
mkdir -p src dist

echo "Creating template files..."
cat << 'EOF' > src/index.js
import './style.css';
console.log("Webpack is working!");
EOF

cat << 'EOF' > src/style.css
body {
  font-family: sans-serif;
  margin: 0;
  padding: 20px;
}
EOF

cat << 'EOF' > src/template.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Todo List</title>
</head>
<body>
</body>
</html>
EOF

cat << 'EOF' > webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devtool: 'eval-source-map',
  devServer: {
    static: './dist',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
EOF

echo "Updating package.json scripts..."
node -e '
  const fs = require("fs");
  const pkg = JSON.parse(fs.readFileSync("package.json"));
  pkg.scripts = {
    ...pkg.scripts,
    "build": "webpack",
    "watch": "webpack --watch",
    "start": "webpack serve --open"
  };
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
'

echo "Creating initial Git commit..."
git add .
git commit -m "Initial commit: Webpack boilerplate setup"

echo "✨ Setup complete! Run 'npm run start' to begin development."