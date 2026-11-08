const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Page not found - Siana Architecture</title>
  <meta name="robots" content="noindex" />
</head>
<body>
  <h1>Page not found</h1>
  <p><a href="/">Siana Architecture</a></p>
</body>
</html>
`;

export default function handler(_req, res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  res.end(HTML);
}
