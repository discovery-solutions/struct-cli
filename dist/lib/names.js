export function toPascalCase(s) {
    return s
        .replace(/[_\-\s]+/g, " ")
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
}
export function toKebabPlural(s) {
    const base = s
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/\s+/g, "-")
        .toLowerCase();
    return base.endsWith("s") ? base : `${base}s`;
}
