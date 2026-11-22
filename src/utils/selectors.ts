// `.filter(x => …)` with a single single-parameter arrow predicate; rules check its body.
export const filterArrow =
  'CallExpression[callee.property.name="filter"][arguments.length=1][arguments.0.type="ArrowFunctionExpression"][arguments.0.params.length=1][arguments.0.params.0.type="Identifier"]';

// A one-argument `.map(callback)` receiver: `arr.map(f).flat()` belongs to the flat-map rules.
export const mapReceiver =
  '[callee.object.type="CallExpression"][callee.object.callee.property.name="map"][callee.object.arguments.length=1]';

// `s[0].toUpperCase()`: the object of a case-conversion call is a string.
export const caseConversionReceiver =
  'CallExpression > MemberExpression.callee[property.name=/^to(Locale)?(Upper|Lower)Case$/] > .object';

// Arrays are not case-converted, concatenated with `+` or interpolated, so a `.slice` call in
// these positions is on a string (`s[0].toUpperCase() + s.slice(1)` belongs to the string rules).
export const stringContext = `${caseConversionReceiver}, BinaryExpression[operator="+"] > *, TemplateLiteral > *`;
