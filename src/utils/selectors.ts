// shared esquery fragments (filterArrow, mapReceiver, stringContext)

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

// A non-computed `.slice(…)` call outside a string context; `attributes` constrain its arguments.
export const arraySliceCall = (attributes: string) =>
  `CallExpression[callee.type="MemberExpression"][callee.computed=false][callee.property.name="slice"]${attributes}:not(${stringContext})`;

// `xs.slice(-1)[0]`: the last element, owned by prefer-last.
export const lastSliceElement =
  'MemberExpression[computed=true][property.type="Literal"][property.raw="0"][object.type="CallExpression"][object.callee.type="MemberExpression"][object.callee.computed=false][object.callee.property.name="slice"][object.arguments.length=1][object.arguments.0.type="UnaryExpression"][object.arguments.0.operator="-"][object.arguments.0.argument.type="Literal"][object.arguments.0.argument.raw="1"]';

// The function of a class or object method, constructor, getter or setter: a named member,
// not an inline function value. For use inside `:not(…)`.
export const memberFunction =
  'MethodDefinition > .value, Property[method=true] > .value, Property[kind=/^[gs]et$/] > .value';
