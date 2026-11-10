# JavaScript vendor assets

## jQuery 3.7.1

- Source: https://code.jquery.com/jquery-3.7.1.min.js
- License: MIT (retained in the asset header).
- SHA-256 (base64): `/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=`
- `jquery.min.js` is the unmodified upstream release, replacing jQuery 1.7.2.
- The 3.x line retains compatibility with this application's legacy plugins;
  migrating to jQuery 4 requires a separate review of removed APIs.

## Bootstrap 2.0.4

Both `bootstrap.js` and `bootstrap.min.js` retain their existing version and
licenses. Local jQuery 3 compatibility changes:

- Treat a placeholder `href="#"` as an empty target in alerts and dropdowns,
  preserving the existing fallback to the parent element.
- Detect support for `keydown` directly instead of using removed `$.browser`.

## Agility

`agility.min.js` retains its existing vendored release and MIT license.
The three jQuery collection `.size()` calls are replaced with `.length`.
Agility's own model and container `size()` methods remain unchanged.

These focused compatibility changes do not constitute an audit or upgrade of
the legacy Play, Bootstrap, or Agility frameworks.
