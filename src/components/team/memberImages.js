const fallbackAvatar = "/images/people/member-full.jpg";

function localVariant(url, variant) {
  if (!url) return "";
  return url.replace(
    /(\/images\/people\/optimized\/member-\d+)-(?:small|big)(\.webp)$/i,
    `$1-${variant}$2`,
  );
}

export function getMemberCardImage(member) {
  return localVariant(member?.smallImage || member?.bigImage || fallbackAvatar, "small");
}

export function getMemberDetailImage(member) {
  return localVariant(member?.bigImage || member?.smallImage || fallbackAvatar, "big");
}
